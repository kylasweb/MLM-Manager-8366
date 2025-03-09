// MongoDB connection utility for Netlify Functions
const { MongoClient } = require('mongodb');

// Connection variables
let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB Atlas
 */
async function connectToDatabase() {
  // If we already have a connection, use it
  if (cachedClient && cachedDb) {
    return {
      client: cachedClient,
      db: cachedDb
    };
  }

  // Check environment variables
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  // Connect to the MongoDB cluster
  const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  
  // Get the database
  const dbName = process.env.MONGODB_DB_NAME || 'mlm_manager';
  const db = client.db(dbName);

  // Cache the connection
  cachedClient = client;
  cachedDb = db;

  return {
    client,
    db,
  };
}

/**
 * Get a collection from the database
 * @param {string} collectionName - The name of the collection
 * @returns {Promise<Collection>} MongoDB collection
 */
async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

/**
 * Close database connection
 */
async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}

/**
 * Generate a MongoDB ObjectId
 * @param {string} id - Optional id string
 * @returns {ObjectId} MongoDB ObjectId
 */
function createObjectId(id) {
  const { ObjectId } = require('mongodb');
  return id ? new ObjectId(id) : new ObjectId();
}

/**
 * Convert string IDs to ObjectIds in query
 * Recursively processes an object and converts any field named "_id" or ending with "_id" 
 * to an ObjectId if it's a valid ObjectId string
 */
function prepareQuery(query) {
  const { ObjectId } = require('mongodb');
  
  if (!query) return query;
  
  // Handle array
  if (Array.isArray(query)) {
    return query.map(item => prepareQuery(item));
  }
  
  // Handle object
  if (typeof query === 'object' && query !== null) {
    const processed = {};
    
    for (const [key, value] of Object.entries(query)) {
      if ((key === '_id' || key.endsWith('_id')) && typeof value === 'string' && ObjectId.isValid(value)) {
        processed[key] = new ObjectId(value);
      } else if (typeof value === 'object' && value !== null) {
        processed[key] = prepareQuery(value);
      } else {
        processed[key] = value;
      }
    }
    
    return processed;
  }
  
  return query;
}

/**
 * Paginates a MongoDB query
 */
async function paginateQuery(collection, query = {}, options = {}) {
  // Prepare query (convert string IDs to ObjectIds)
  const preparedQuery = prepareQuery(query);
  
  // Defaults
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sortField = options.sortField || '_id';
  const sortOrder = options.sortOrder || -1;
  
  // Execute query with pagination
  const [results, totalCount] = await Promise.all([
    collection.find(preparedQuery)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(preparedQuery)
  ]);
  
  // Return both the results and pagination info
  return {
    results,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    }
  };
}

/**
 * Create MongoDB indexes for MLM models if they don't exist
 */
async function ensureIndexes() {
  const { db } = await connectToDatabase();
  
  // Users collection indexes
  const usersCollection = db.collection('users');
  await usersCollection.createIndex({ auth0Id: 1 }, { unique: true });
  await usersCollection.createIndex({ sponsorId: 1 });
  await usersCollection.createIndex({ email: 1 });
  await usersCollection.createIndex({ username: 1 });
  
  // Orders collection indexes
  const ordersCollection = db.collection('orders');
  await ordersCollection.createIndex({ userId: 1 });
  await ordersCollection.createIndex({ createdAt: 1 });
  await ordersCollection.createIndex({ status: 1 });
  
  // Commissions collection indexes
  const commissionsCollection = db.collection('commissions');
  await commissionsCollection.createIndex({ userId: 1 });
  await commissionsCollection.createIndex({ orderId: 1 });
  await commissionsCollection.createIndex({ status: 1 });
  await commissionsCollection.createIndex({ createdAt: 1 });
  
  // Ranks history collection indexes
  const ranksCollection = db.collection('rankHistory');
  await ranksCollection.createIndex({ userId: 1 });
  await ranksCollection.createIndex({ effectiveDate: 1 });
  
  console.log('MongoDB indexes have been ensured');
}

/**
 * Common error handler for MongoDB operations
 */
function handleMongoError(error, operation = 'database operation') {
  console.error(`Error during ${operation}:`, error);
  
  if (error.name === 'MongoServerError' && error.code === 11000) {
    // Duplicate key error
    return { 
      statusCode: 409, 
      body: JSON.stringify({ message: 'This record already exists.' }) 
    };
  }
  
  if (error.name === 'ValidationError') {
    // Mongoose validation error (if using Mongoose)
    return { 
      statusCode: 400, 
      body: JSON.stringify({ message: error.message }) 
    };
  }
  
  // Default error response
  return { 
    statusCode: 500, 
    body: JSON.stringify({ message: 'Internal server error.' }) 
  };
}

module.exports = {
  connectToDatabase,
  getCollection,
  closeConnection,
  ensureIndexes,
  handleMongoError,
  createObjectId,
  prepareQuery,
  paginateQuery
}; 