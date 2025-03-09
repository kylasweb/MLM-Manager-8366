// MLM Commission Management API with Prisma
const { prisma, formatId, paginate, handlePrismaError } = require('../utils/prisma');
const { authMiddleware, requireAdmin, withAuth, withAdmin } = require('../utils/auth');

/**
 * Calculate commission for a transaction
 * @param {Object} transaction - The transaction data
 * @param {Object} user - The user who made the sale
 * @returns {Array} - Array of commission objects
 */
async function calculateCommissions(transaction, user) {
  try {
    const commissions = [];

    // If no user or transaction amount is invalid, return empty array
    if (!user || !transaction.amount || transaction.amount <= 0) {
      return commissions;
    }

    // Calculate direct commission
    const directCommissionRate = user.directCommission || 10; // Default 10%
    const directCommissionAmount = (transaction.amount * directCommissionRate) / 100;

    // Create direct commission record
    commissions.push({
      userId: user.id,
      transactionId: transaction.id,
      amount: directCommissionAmount,
      percentage: directCommissionRate,
      type: 'direct',
      level: 0,
      status: 'pending',
      notes: `Direct commission from transaction ${transaction.id}`
    });

    // Calculate level commissions (upline)
    let levelCommissions = user.levelCommissions;
    if (typeof levelCommissions === 'string') {
      try {
        levelCommissions = JSON.parse(levelCommissions);
      } catch (e) {
        levelCommissions = [5, 3, 1]; // Default if parsing fails
      }
    } else if (!Array.isArray(levelCommissions)) {
      levelCommissions = [5, 3, 1]; // Default if not an array
    }

    let currentSponsorId = user.sponsorId;
    let level = 1;

    // Process up to the number of levels in the commission rates array
    while (currentSponsorId && level <= levelCommissions.length) {
      // Get the sponsor at this level
      const sponsor = await prisma.user.findUnique({
        where: { id: currentSponsorId }
      });

      if (!sponsor) break;

      // Calculate commission for this level
      const levelRate = levelCommissions[level - 1];
      const levelAmount = (transaction.amount * levelRate) / 100;

      // Create level commission record
      commissions.push({
        userId: sponsor.id,
        transactionId: transaction.id,
        amount: levelAmount,
        percentage: levelRate,
        type: 'level',
        level,
        status: 'pending',
        notes: `Level ${level} commission from user ${user.username}`
      });

      // Move up to the next sponsor
      currentSponsorId = sponsor.sponsorId;
      level++;
    }

    return commissions;
  } catch (error) {
    console.error('Error calculating commissions:', error);
    return [];
  }
}

/**
 * GET /api/commissions - Get all commissions (admin only)
 */
async function getAllCommissions(event) {
  try {
    const queryParams = event.queryStringParameters || {};
    
    // Build query filters
    const where = {};
    
    // Filter by status if provided
    if (queryParams.status) {
      where.status = queryParams.status;
    }
    
    // Filter by type if provided
    if (queryParams.type) {
      where.type = queryParams.type;
    }
    
    // Filter by user ID if provided
    if (queryParams.userId) {
      where.userId = queryParams.userId;
    }
    
    // Filter by date range if provided
    if (queryParams.startDate || queryParams.endDate) {
      where.createdAt = {};
      
      if (queryParams.startDate) {
        where.createdAt.gte = new Date(queryParams.startDate);
      }
      
      if (queryParams.endDate) {
        where.createdAt.lte = new Date(queryParams.endDate);
      }
    }
    
    // Define sort order
    const orderBy = {};
    orderBy[queryParams.sortField || 'createdAt'] = queryParams.sortOrder === 'asc' ? 'asc' : 'desc';
    
    // Use the paginate helper
    const { results, pagination } = await paginate(
      async (skip, take) => {
        const total = await prisma.commission.count({ where });
        const commissions = await prisma.commission.findMany({
          where,
          orderBy,
          skip,
          take,
          include: {
            user: {
              select: {
                username: true,
                fullName: true
              }
            },
            transaction: {
              select: {
                amount: true,
                type: true,
                status: true
              }
            }
          }
        });
        
        return [total, commissions];
      },
      {
        page: queryParams.page,
        limit: queryParams.limit || 20
      }
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        commissions: results,
        pagination
      })
    };
  } catch (error) {
    return handlePrismaError(error, 'getting commissions');
  }
}

/**
 * GET /api/commissions/user/:userId - Get commissions for a specific user
 */
async function getUserCommissions(event) {
  try {
    const userId = event.path.split('/').pop();
    const queryParams = event.queryStringParameters || {};
    
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'User ID is required' })
      };
    }
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, auth0Id: true }
    });
    
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' })
      };
    }
    
    // Check permissions - users can only view their own commissions
    const isAdmin = event.mlmUser && event.mlmUser.roles && event.mlmUser.roles.includes('admin');
    const isOwnCommissions = event.auth.userId === user.auth0Id;
    
    if (!isAdmin && !isOwnCommissions) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'You do not have permission to view these commissions' })
      };
    }
    
    // Build query filters
    const where = { userId: user.id };
    
    // Filter by status if provided
    if (queryParams.status) {
      where.status = queryParams.status;
    }
    
    // Filter by type if provided
    if (queryParams.type) {
      where.type = queryParams.type;
    }
    
    // Filter by date range if provided
    if (queryParams.startDate || queryParams.endDate) {
      where.createdAt = {};
      
      if (queryParams.startDate) {
        where.createdAt.gte = new Date(queryParams.startDate);
      }
      
      if (queryParams.endDate) {
        where.createdAt.lte = new Date(queryParams.endDate);
      }
    }
    
    // Define sort order
    const orderBy = {};
    orderBy[queryParams.sortField || 'createdAt'] = queryParams.sortOrder === 'asc' ? 'asc' : 'desc';
    
    // Use the paginate helper
    const { results, pagination } = await paginate(
      async (skip, take) => {
        const total = await prisma.commission.count({ where });
        const commissions = await prisma.commission.findMany({
          where,
          orderBy,
          skip,
          take,
          include: {
            transaction: {
              select: {
                amount: true,
                type: true,
                description: true,
                createdAt: true
              }
            }
          }
        });
        
        return [total, commissions];
      },
      {
        page: queryParams.page,
        limit: queryParams.limit || 20
      }
    );
    
    // Get user's commission statistics
    const stats = await calculateCommissionStats(user.id);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        commissions: results,
        pagination,
        stats
      })
    };
  } catch (error) {
    return handlePrismaError(error, 'getting user commissions');
  }
}

/**
 * Calculate commission statistics for a user
 * @param {string} userId - The user ID
 * @returns {Object} - Commission statistics
 */
async function calculateCommissionStats(userId) {
  try {
    // Calculate total earnings
    const totalEarnings = await prisma.commission.aggregate({
      _sum: {
        amount: true
      },
      where: {
        userId
      }
    });
    
    // Calculate pending earnings
    const pendingEarnings = await prisma.commission.aggregate({
      _sum: {
        amount: true
      },
      where: {
        userId,
        status: 'pending'
      }
    });
    
    // Calculate paid earnings
    const paidEarnings = await prisma.commission.aggregate({
      _sum: {
        amount: true
      },
      where: {
        userId,
        status: 'paid'
      }
    });
    
    // Get commission counts by type
    const byType = await prisma.commission.groupBy({
      by: ['type'],
      _sum: {
        amount: true
      },
      where: {
        userId
      }
    });
    
    // Count total commissions
    const totalCommissions = await prisma.commission.count({
      where: {
        userId
      }
    });
    
    return {
      totalEarnings: totalEarnings._sum.amount || 0,
      pendingEarnings: pendingEarnings._sum.amount || 0,
      paidEarnings: paidEarnings._sum.amount || 0,
      totalCommissions,
      byType: byType.reduce((acc, type) => {
        acc[type.type] = type._sum.amount || 0;
        return acc;
      }, {})
    };
  } catch (error) {
    console.error('Error calculating commission stats:', error);
    return {
      totalEarnings: 0,
      pendingEarnings: 0,
      paidEarnings: 0,
      totalCommissions: 0,
      byType: {}
    };
  }
}

/**
 * POST /api/commissions/process-transaction - Process transaction and calculate commissions
 */
async function processTransaction(event) {
  try {
    const body = JSON.parse(event.body);
    
    // Validate required fields
    if (!body.amount || !body.userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Amount and user ID are required' })
      };
    }
    
    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: body.userId }
    });
    
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' })
      };
    }
    
    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: parseFloat(body.amount),
        type: body.type || 'sale',
        status: body.status || 'completed',
        description: body.description || 'Transaction',
        metadata: body.metadata || {}
      }
    });
    
    // Calculate commissions
    const commissions = await calculateCommissions(transaction, user);
    
    // Save commissions if any were calculated
    if (commissions.length > 0) {
      await prisma.commission.createMany({
        data: commissions
      });
    }
    
    // Get the created commissions with user data
    const createdCommissions = await prisma.commission.findMany({
      where: {
        transactionId: transaction.id
      },
      include: {
        user: {
          select: {
            username: true,
            fullName: true
          }
        }
      }
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        transaction: formatId(transaction),
        commissions: formatId(createdCommissions),
        message: 'Transaction processed and commissions calculated successfully'
      })
    };
  } catch (error) {
    return handlePrismaError(error, 'processing transaction');
  }
}

/**
 * PUT /api/commissions/pay - Mark commissions as paid (admin only)
 */
async function payCommissions(event) {
  try {
    const body = JSON.parse(event.body);
    
    // Validate required fields
    if (!body.commissionIds || !Array.isArray(body.commissionIds) || body.commissionIds.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Commission IDs array is required' })
      };
    }
    
    // Update commissions
    const updateResult = await prisma.commission.updateMany({
      where: {
        id: {
          in: body.commissionIds
        }
      },
      data: {
        status: 'paid',
        paidAt: new Date(),
        paymentReference: body.paymentReference || null,
        paymentNotes: body.paymentNotes || 'Paid by admin'
      }
    });
    
    if (updateResult.count === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No commissions were updated' })
      };
    }
    
    // Get the updated commissions
    const updatedCommissions = await prisma.commission.findMany({
      where: {
        id: {
          in: body.commissionIds
        }
      },
      include: {
        user: {
          select: {
            username: true,
            fullName: true
          }
        }
      }
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `${updateResult.count} commissions marked as paid`,
        commissions: formatId(updatedCommissions)
      })
    };
  } catch (error) {
    return handlePrismaError(error, 'paying commissions');
  }
}

/**
 * GET /api/commissions/stats - Get overall commission statistics (admin only)
 */
async function getCommissionStats(event) {
  try {
    // Calculate total paid commissions
    const totalPaid = await prisma.commission.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: 'paid'
      }
    });
    
    // Calculate total pending commissions
    const totalPending = await prisma.commission.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: 'pending'
      }
    });
    
    // Calculate commissions by type
    const byType = await prisma.commission.groupBy({
      by: ['type'],
      _sum: {
        amount: true
      }
    });
    
    // Get top earners
    const topEarners = await prisma.user.findMany({
      take: 10,
      orderBy: {
        commissions: {
          _sum: {
            amount: 'desc'
          }
        }
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        _sum: {
          select: {
            commissions: {
              amount: true
            }
          }
        }
      }
    });
    
    // Format top earners
    const formattedTopEarners = await Promise.all(
      topEarners.map(async (user) => {
        const stats = await calculateCommissionStats(user.id);
        return {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          total: stats.totalEarnings
        };
      })
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        stats: {
          totalPaid: totalPaid._sum.amount || 0,
          totalPending: totalPending._sum.amount || 0,
          totalCommissions: (totalPaid._sum.amount || 0) + (totalPending._sum.amount || 0),
          byType: byType.reduce((acc, type) => {
            acc[type.type] = type._sum.amount || 0;
            return acc;
          }, {}),
          topEarners: formatId(formattedTopEarners)
        }
      })
    };
  } catch (error) {
    return handlePrismaError(error, 'getting commission stats');
  }
}

/**
 * Export the handler
 */
exports.handler = async (event, context) => {
  // Extract the HTTP method and resource path
  const method = event.httpMethod;
  const path = event.path;
  
  // Apply authentication middleware for all routes
  const authError = await authMiddleware(event);
  if (authError) return authError;
  
  // Route the request to the appropriate handler
  if (method === 'GET') {
    if (path.match(/\/api\/commissions\/user\/[^\/]+$/)) {
      return getUserCommissions(event);
    } else if (path === '/api/commissions/stats') {
      // Only admins can view overall stats
      const adminError = await requireAdmin(event);
      if (adminError) return adminError;
      
      return getCommissionStats(event);
    } else if (path === '/api/commissions') {
      // Only admins can list all commissions
      const adminError = await requireAdmin(event);
      if (adminError) return adminError;
      
      return getAllCommissions(event);
    }
  } else if (method === 'POST') {
    if (path === '/api/commissions/process-transaction') {
      // Only admins can process transactions
      const adminError = await requireAdmin(event);
      if (adminError) return adminError;
      
      return processTransaction(event);
    }
  } else if (method === 'PUT') {
    if (path === '/api/commissions/pay') {
      // Only admins can mark commissions as paid
      const adminError = await requireAdmin(event);
      if (adminError) return adminError;
      
      return payCommissions(event);
    }
  }
  
  // If no route matches, return 404
  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Not found' })
  };
}; 