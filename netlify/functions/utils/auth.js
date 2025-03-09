// Auth0 authentication middleware for Netlify Functions
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { prisma } = require('./prisma');

// Set up the JWT validation client
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

/**
 * Get the Auth0 signing key
 */
function getSigningKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

/**
 * Verify and decode the JWT token
 */
async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getSigningKey,
      {
        audience: process.env.AUTH0_AUDIENCE || process.env.AUTH0_CLIENT_ID,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ['RS256']
      },
      (err, decoded) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded);
      }
    );
  });
}

/**
 * Auth middleware for Netlify Functions
 * Verifies the JWT token and adds the decoded token to the event object
 */
async function authMiddleware(event) {
  // Check for Authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Missing or invalid authorization header' })
    };
  }

  // Extract the token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify and decode the token
    const decodedToken = await verifyToken(token);
    
    // Add the decoded token to the event object
    event.auth = {
      userId: decodedToken.sub,
      token: decodedToken
    };
    
    // Success - continue with the function
    return null;
  } catch (error) {
    console.error('JWT verification error:', error);
    
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Invalid token', error: error.message })
    };
  }
}

/**
 * Get the MLM user profile from Prisma
 */
async function getMlmUserProfile(auth0Id) {
  try {
    // Find the user by Auth0 ID
    const user = await prisma.user.findUnique({
      where: { auth0Id },
      include: {
        sponsor: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        _count: {
          select: {
            downline: true
          }
        }
      }
    });
    
    if (!user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error fetching MLM user profile:', error);
    return null;
  }
}

/**
 * Check if the user has the required role
 */
async function requireRole(event, requiredRole) {
  // First check authentication
  const authError = await authMiddleware(event);
  if (authError) return authError;
  
  try {
    // Get user from database
    const user = await getMlmUserProfile(event.auth.userId);
    
    // Check if user exists and has the required role
    if (!user || !user.roles || !user.roles.includes(requiredRole)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Insufficient permissions' })
      };
    }
    
    // Add the MLM user to the event object
    event.mlmUser = user;
    
    // Success - continue with the function
    return null;
  } catch (error) {
    console.error('Role check error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error checking permissions' })
    };
  }
}

/**
 * Check if user is an admin
 */
async function requireAdmin(event) {
  return requireRole(event, 'admin');
}

/**
 * Helper to wrap a function with auth middleware
 */
function withAuth(handler) {
  return async (event, context) => {
    const authError = await authMiddleware(event);
    if (authError) return authError;
    
    // Call the original handler
    return handler(event, context);
  };
}

/**
 * Helper to wrap a function with role requirement
 */
function withRole(handler, role) {
  return async (event, context) => {
    const roleError = await requireRole(event, role);
    if (roleError) return roleError;
    
    // Call the original handler
    return handler(event, context);
  };
}

/**
 * Helper to wrap a function with admin requirement
 */
function withAdmin(handler) {
  return withRole(handler, 'admin');
}

module.exports = {
  authMiddleware,
  requireRole,
  requireAdmin,
  getMlmUserProfile,
  withAuth,
  withRole,
  withAdmin
}; 