// MLM User Management API with Prisma
const { prisma, formatId, paginate, handlePrismaError } = require('../utils/prisma');
const { authMiddleware, requireAdmin, withAuth, withAdmin } = require('../utils/auth');

/**
 * GET /api/users - Get all users (admin only)
 */
async function getUsers(event) {
  try {
    const queryParams = event.queryStringParameters || {};
    
    // Build query filters
    const where = {};
    
    // Filter by status if provided
    if (queryParams.status) {
      where.status = queryParams.status;
    }
    
    // Filter by role if provided
    if (queryParams.role) {
      where.roles = {
        has: queryParams.role
      };
    }
    
    // Filter by search term if provided
    if (queryParams.search) {
      where.OR = [
        { fullName: { contains: queryParams.search, mode: 'insensitive' } },
        { email: { contains: queryParams.search, mode: 'insensitive' } },
        { username: { contains: queryParams.search, mode: 'insensitive' } }
      ];
    }
    
    // Define sort order
    const orderBy = {};
    orderBy[queryParams.sortField || 'createdAt'] = queryParams.sortOrder === 'asc' ? 'asc' : 'desc';
    
    // Use the paginate helper
    const { results, pagination } = await paginate(
      async (skip, take) => {
        const total = await prisma.user.count({ where });
        const users = await prisma.user.findMany({
          where,
          orderBy,
          skip,
          take,
          select: {
            id: true,
            auth0Id: true,
            email: true,
            username: true,
            fullName: true,
            profilePicture: true,
            phoneNumber: true,
            address: true,
            bio: true,
            status: true,
            roles: true,
            level: true,
            referralCode: true,
            sponsorId: true,
            directCommission: true,
            levelCommissions: true,
            payoutThreshold: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                downline: true
              }
            }
          }
        });
        
        return [total, users];
      },
      {
        page: queryParams.page,
        limit: queryParams.limit || 20
      }
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        users: results,
        pagination
      })
    };
  } catch (error) {
    return handlePrismaError(error, 'getting users');
  }
}

/**
 * GET /api/users/:id - Get user by ID
 */
async function getUserById(event) {
  try {
    const userId = event.path.split('/').pop();
    
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'User ID is required' })
      };
    }
    
    let user;
    
    // Try to find user by various fields
    if (userId.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
      // It's a UUID
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else if (userId.includes('auth0|')) {
      // It's an Auth0 ID
      user = await prisma.user.findUnique({ where: { auth0Id: userId } });
    } else {
      // Try username
      user = await prisma.user.findUnique({ where: { username: userId } });
    }
    
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' })
      };
    }
    
    // Determine if the requester can see full user details
    const isAdmin = event.mlmUser && event.mlmUser.roles && event.mlmUser.roles.includes('admin');
    const isOwnProfile = event.auth.userId === user.auth0Id;
    
    // Get additional data for admins or own profile
    if (isAdmin || isOwnProfile) {
      // Get downline count and sponsor info for complete profile
      const enrichedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          sponsor: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profilePicture: true
            }
          },
          _count: {
            select: {
              downline: true,
              transactions: true,
              commissions: true
            }
          }
        }
      });
      
      // Format and return full user data
      return {
        statusCode: 200,
        body: JSON.stringify(formatId(enrichedUser))
      };
    } else {
      // For other users, only return public information
      return {
        statusCode: 200,
        body: JSON.stringify(formatId({
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          profilePicture: user.profilePicture,
          level: user.level,
          status: user.status,
          roles: user.roles,
          joinedDate: user.createdAt
        }))
      };
    }
  } catch (error) {
    return handlePrismaError(error, 'getting user by ID');
  }
}

/**
 * POST /api/users - Create a new user
 */
async function createUser(event) {
  try {
    // Parse request body
    const body = JSON.parse(event.body);
    
    // Validate required fields
    if (!body.email || !body.auth0Id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email and auth0Id are required' })
      };
    }
    
    // Check sponsor if provided
    let sponsorId = null;
    if (body.sponsorId) {
      const sponsor = await prisma.user.findUnique({
        where: { id: body.sponsorId },
        select: { id: true }
      });
      
      if (!sponsor) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Sponsor not found' })
        };
      }
      
      sponsorId = sponsor.id;
    }
    
    // Generate referral code if not provided
    const referralCode = body.referralCode || generateReferralCode(body.username || body.email.split('@')[0]);
    
    // Parse level commissions if provided as string
    let levelCommissions = body.levelCommissions || [5, 3, 1];
    if (typeof levelCommissions === 'string') {
      try {
        levelCommissions = JSON.parse(levelCommissions);
      } catch (e) {
        levelCommissions = [5, 3, 1]; // Default if parsing fails
      }
    }
    
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        auth0Id: body.auth0Id,
        email: body.email,
        fullName: body.fullName || body.name || body.email.split('@')[0],
        username: body.username || body.email.split('@')[0],
        roles: body.roles || ['member'],
        status: body.status || 'active',
        level: body.level || 'starter',
        profilePicture: body.picture || null,
        phoneNumber: body.phoneNumber || null,
        address: body.address || null,
        bio: body.bio || null,
        sponsorId: sponsorId,
        referralCode: referralCode,
        directCommission: body.directCommission || 10,
        levelCommissions: levelCommissions,
        payoutThreshold: body.payoutThreshold || 50
      }
    });
    
    return {
      statusCode: 201,
      body: JSON.stringify(formatId(newUser))
    };
  } catch (error) {
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: 'User already exists',
          field: error.meta?.target?.join(', ')
        })
      };
    }
    
    return handlePrismaError(error, 'creating user');
  }
}

/**
 * PUT /api/users/:id - Update user
 */
async function updateUser(event) {
  try {
    const userId = event.path.split('/').pop();
    const body = JSON.parse(event.body);
    
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'User ID is required' })
      };
    }
    
    // Find the user first
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
    
    // Check permission - only admins can update other users
    const isAdmin = event.mlmUser && event.mlmUser.roles && event.mlmUser.roles.includes('admin');
    const isOwnProfile = event.auth.userId === user.auth0Id;
    
    if (!isAdmin && !isOwnProfile) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'You do not have permission to update this user' })
      };
    }
    
    // Build update data based on permissions
    const updateData = {};
    
    if (isAdmin) {
      // Admins can update all fields except auth0Id
      const allowedFields = [
        'email', 'fullName', 'username', 'roles', 'status', 'level',
        'profilePicture', 'phoneNumber', 'address', 'bio', 'sponsorId',
        'directCommission', 'payoutThreshold'
      ];
      
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }
      
      // Handle level commissions specifically due to JSON format
      if (body.levelCommissions !== undefined) {
        updateData.levelCommissions = typeof body.levelCommissions === 'string'
          ? JSON.parse(body.levelCommissions)
          : body.levelCommissions;
      }
      
    } else {
      // Regular users can only update their profile information
      const allowedFields = [
        'fullName', 'username', 'profilePicture', 'phoneNumber', 
        'address', 'bio'
      ];
      
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }
    }
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify(formatId(updatedUser))
    };
  } catch (error) {
    return handlePrismaError(error, 'updating user');
  }
}

/**
 * DELETE /api/users/:id - Delete user (admin only)
 */
async function deleteUser(event) {
  try {
    const userId = event.path.split('/').pop();
    
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'User ID is required' })
      };
    }
    
    // Find the user first
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' })
      };
    }
    
    // Delete the user
    await prisma.user.delete({
      where: { id: user.id }
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'User deleted successfully',
        userId: userId
      })
    };
  } catch (error) {
    // Special case: Cannot delete a user who has downlines (due to foreign key constraints)
    if (error.code === 'P2003') {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: 'Cannot delete this user because they have downlines or related records',
          error: 'Foreign key constraint violation'
        })
      };
    }
    
    return handlePrismaError(error, 'deleting user');
  }
}

/**
 * GET /api/users/:id/downline - Get user's downline/team
 */
async function getUserDownline(event) {
  try {
    const userId = event.path.split('/')[3]; // Extract user ID from path
    const queryParams = event.queryStringParameters || {};
    
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'User ID is required' })
      };
    }
    
    // Find the user first
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
    
    // Determine if this is authorized: admin or own downline
    const isAdmin = event.mlmUser && event.mlmUser.roles && event.mlmUser.roles.includes('admin');
    const isOwnDownline = event.auth.userId === user.auth0Id;
    
    if (!isAdmin && !isOwnDownline) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'You do not have permission to view this downline' })
      };
    }
    
    // Build query for downline
    const where = { sponsorId: user.id };
    
    // Filter by status if provided
    if (queryParams.status) {
      where.status = queryParams.status;
    }
    
    // Define sort order
    const orderBy = {};
    orderBy[queryParams.sortField || 'createdAt'] = queryParams.sortOrder === 'asc' ? 'asc' : 'desc';
    
    // Use the paginate helper
    const { results, pagination } = await paginate(
      async (skip, take) => {
        const total = await prisma.user.count({ where });
        const downline = await prisma.user.findMany({
          where,
          orderBy,
          skip,
          take,
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            profilePicture: true,
            status: true,
            level: true,
            createdAt: true,
            _count: {
              select: {
                downline: true
              }
            }
          }
        });
        
        return [total, downline];
      },
      {
        page: queryParams.page,
        limit: queryParams.limit || 20
      }
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        downline: results,
        pagination
      })
    };
  } catch (error) {
    return handlePrismaError(error, 'getting user downline');
  }
}

/**
 * Generate a referral code based on username or email
 */
function generateReferralCode(base) {
  // Clean up the base string
  const cleaned = base.replace(/[^a-zA-Z0-9]/g, '');
  
  // Generate a 6-character random alphanumeric string
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Combine with up to 6 characters from the base
  const prefix = cleaned.substring(0, 6).toUpperCase();
  
  return `${prefix}-${randomPart}`;
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
    if (path.match(/\/api\/users\/[^\/]+\/downline$/)) {
      return getUserDownline(event);
    } else if (path.match(/\/api\/users\/[^\/]+$/)) {
      return getUserById(event);
    } else if (path === '/api/users') {
      // Only admins can list all users
      const adminError = await requireAdmin(event);
      if (adminError) return adminError;
      
      return getUsers(event);
    }
  } else if (method === 'POST' && path === '/api/users') {
    // Creating users requires admin privileges
    const adminError = await requireAdmin(event);
    if (adminError) return adminError;
    
    return createUser(event);
  } else if (method === 'PUT' && path.match(/\/api\/users\/[^\/]+$/)) {
    return updateUser(event);
  } else if (method === 'DELETE' && path.match(/\/api\/users\/[^\/]+$/)) {
    // Deleting users requires admin privileges
    const adminError = await requireAdmin(event);
    if (adminError) return adminError;
    
    return deleteUser(event);
  }
  
  // If no route matches, return 404
  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Not found' })
  };
}; 
}; 