// Prisma client utility for Netlify Functions
const { PrismaClient } = require('@prisma/client');

// Single instance of PrismaClient to be reused across function invocations
let prisma;

/**
 * Get or initialize Prisma client
 */
function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      // Log queries only in development
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

/**
 * Disconnect Prisma client
 * Only use in development or testing - in production, the connection is reused
 */
async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

/**
 * Format ID fields in responses
 * Converts internal IDs to string format for consistent API responses
 */
function formatId(model) {
  if (!model) return model;
  
  // If it's an array, map over each item
  if (Array.isArray(model)) {
    return model.map(formatId);
  }
  
  // Handle single object
  if (typeof model === 'object' && model !== null) {
    const formatted = { ...model };
    
    // Format the id field
    if (formatted.id !== undefined) {
      formatted.id = String(formatted.id);
    }
    
    // Format any foreignKey fields ending with "Id"
    Object.keys(formatted).forEach(key => {
      if (key.endsWith('Id') && formatted[key] !== null) {
        formatted[key] = String(formatted[key]);
      }
      
      // Recursively format nested objects
      if (typeof formatted[key] === 'object' && formatted[key] !== null) {
        formatted[key] = formatId(formatted[key]);
      }
    });
    
    return formatted;
  }
  
  return model;
}

/**
 * Paginate query results
 * @param {Function} query - Prisma query function returning count and data
 * @param {Object} options - Pagination options
 * @returns {Object} - Results with pagination metadata
 */
async function paginate(query, options = {}) {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Execute query with count
  const [total, results] = await query(skip, limit);
  
  // Format IDs in results
  const formattedResults = formatId(results);
  
  return {
    results: formattedResults,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Handle Prisma errors consistently
 */
function handlePrismaError(error, operation = 'database operation') {
  console.error(`Error during ${operation}:`, error);
  
  // Determine the type of error
  if (error.code === 'P2002') {
    return {
      statusCode: 409,
      body: JSON.stringify({
        message: 'A record with this unique constraint already exists',
        error: `Duplicate value for ${error.meta?.target?.join(', ')}`
      })
    };
  }
  
  if (error.code === 'P2025') {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Record not found',
        error: error.message
      })
    };
  }
  
  // Default error response
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: `An error occurred during ${operation}`,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  };
}

module.exports = {
  prisma: getPrismaClient(),
  getPrismaClient,
  disconnectPrisma,
  formatId,
  paginate,
  handlePrismaError
}; 