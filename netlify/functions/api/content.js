// Contentful Content Management API with Prisma
const { 
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  formatContentfulResponse
} = require('../utils/contentful');
const { prisma, formatId, handlePrismaError } = require('../utils/prisma');
const { authMiddleware, requireAdmin, withAuth, withAdmin } = require('../utils/auth');

/**
 * GET /api/content - Get all content entries by content type
 */
async function getContentEntries(event) {
  try {
    const queryParams = event.queryStringParameters || {};
    
    // Validate content type
    if (!queryParams.contentType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Content type is required' })
      };
    }
    
    // Build query
    const query = {
      content_type: queryParams.contentType,
      limit: parseInt(queryParams.limit) || 100,
      skip: parseInt(queryParams.skip) || 0,
      order: queryParams.order || '-sys.createdAt'
    };
    
    // Add search term if provided
    if (queryParams.search) {
      query.query = queryParams.search;
    }
    
    // Get entries from Contentful
    const entries = await getEntries(query, {
      preview: queryParams.preview === 'true'
    });
    
    // Format the response
    const formattedEntries = entries.map(formatContentfulResponse);
    
    // Store content references in database if this is content we track locally
    if (queryParams.storeReferences === 'true') {
      await storeContentReferences(formattedEntries, queryParams.contentType);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        entries: formattedEntries,
        total: entries.length,
        page: Math.floor(query.skip / query.limit) + 1,
        limit: query.limit
      })
    };
  } catch (error) {
    console.error('Error getting content entries:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error retrieving content',
        error: error.message
      })
    };
  }
}

/**
 * GET /api/content/:id - Get single content entry by ID
 */
async function getContentEntry(event) {
  try {
    const entryId = event.path.split('/').pop();
    const queryParams = event.queryStringParameters || {};
    
    if (!entryId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Entry ID is required' })
      };
    }
    
    // First try to find the entry in our local reference database
    let contentReference = null;
    try {
      contentReference = await prisma.contentReference.findUnique({
        where: { contentfulId: entryId }
      });
    } catch (error) {
      // If error, just continue with direct Contentful fetch
      console.warn('Error fetching content reference:', error);
    }
    
    // Get entry from Contentful
    const entry = await getEntry(entryId, {
      preview: queryParams.preview === 'true'
    });
    
    if (!entry) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Content entry not found' })
      };
    }
    
    // Format the response
    const formattedEntry = formatContentfulResponse(entry);
    
    // Store reference if it's new or changed
    if (queryParams.storeReference === 'true' || !contentReference) {
      await storeContentReference(formattedEntry);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(formattedEntry)
    };
  } catch (error) {
    console.error(`Error getting content entry: ${error}`);
    
    if (error.message.includes('404')) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Content entry not found' })
      };
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error retrieving content entry',
        error: error.message
      })
    };
  }
}

/**
 * POST /api/content - Create a new content entry (admin only)
 */
async function createContentEntry(event) {
  try {
    const body = JSON.parse(event.body);
    
    // Validate required fields
    if (!body.contentType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Content type is required' })
      };
    }
    
    // Create entry in Contentful
    const contentType = body.contentType;
    delete body.contentType;
    
    const entry = await createEntry(contentType, body);
    
    // Format the response
    const formattedEntry = formatContentfulResponse(entry);
    
    // Store reference in database
    await storeContentReference({
      ...formattedEntry,
      contentType
    });
    
    return {
      statusCode: 201,
      body: JSON.stringify(formattedEntry)
    };
  } catch (error) {
    console.error(`Error creating content entry: ${error}`);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error creating content entry',
        error: error.message
      })
    };
  }
}

/**
 * PUT /api/content/:id - Update an existing content entry (admin only)
 */
async function updateContentEntry(event) {
  try {
    const entryId = event.path.split('/').pop();
    const body = JSON.parse(event.body);
    
    if (!entryId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Entry ID is required' })
      };
    }
    
    // Determine if we should publish after update
    const shouldPublish = body.publish === true;
    delete body.publish;
    
    // Update entry in Contentful
    const entry = await updateEntry(entryId, body, shouldPublish);
    
    // Format the response
    const formattedEntry = formatContentfulResponse(entry);
    
    // Update reference in database
    await updateContentReference(formattedEntry);
    
    return {
      statusCode: 200,
      body: JSON.stringify(formattedEntry)
    };
  } catch (error) {
    console.error(`Error updating content entry: ${error}`);
    
    if (error.message.includes('404')) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Content entry not found' })
      };
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error updating content entry',
        error: error.message
      })
    };
  }
}

/**
 * DELETE /api/content/:id - Delete a content entry (admin only)
 */
async function deleteContentEntry(event) {
  try {
    const entryId = event.path.split('/').pop();
    
    if (!entryId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Entry ID is required' })
      };
    }
    
    // Delete entry from Contentful
    await deleteEntry(entryId);
    
    // Delete reference from database if exists
    try {
      await prisma.contentReference.delete({
        where: { contentfulId: entryId }
      });
    } catch (error) {
      // If no reference exists, just continue
      console.warn('Error deleting content reference:', error);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Content entry deleted successfully',
        id: entryId
      })
    };
  } catch (error) {
    console.error(`Error deleting content entry: ${error}`);
    
    if (error.message.includes('404')) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Content entry not found' })
      };
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error deleting content entry',
        error: error.message
      })
    };
  }
}

/**
 * GET /api/content/:id/publish - Publish a content entry (admin only)
 */
async function publishContentEntry(event) {
  try {
    const entryId = event.path.split('/')[3]; // Extract ID from path
    
    if (!entryId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Entry ID is required' })
      };
    }
    
    // Update entry with publish flag
    const entry = await updateEntry(entryId, {}, true);
    
    // Format the response
    const formattedEntry = formatContentfulResponse(entry);
    
    // Update reference in database
    await updateContentReference(formattedEntry);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Content entry published successfully',
        entry: formattedEntry
      })
    };
  } catch (error) {
    console.error(`Error publishing content entry: ${error}`);
    
    if (error.message.includes('404')) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Content entry not found' })
      };
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error publishing content entry',
        error: error.message
      })
    };
  }
}

/**
 * Get MLM content for a specific section
 * Wrapper around standard content API that filters and formats for MLM manager needs
 */
async function getMlmContent(event) {
  try {
    const section = event.queryStringParameters?.section || 'default';
    const locale = event.queryStringParameters?.locale || 'en-US';
    
    // Try to get content references from database first for faster response
    try {
      const contentReferences = await prisma.contentReference.findMany({
        where: {
          section,
          locale
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      
      // If we have local references, we can return those immediately
      if (contentReferences.length > 0) {
        // Format for client use
        const formattedContent = contentReferences.reduce((result, ref) => {
          if (ref.title) {
            result[ref.title] = ref.description || '';
          }
          
          return result;
        }, {
          section,
          locale,
          lastUpdated: contentReferences[0].updatedAt.toISOString()
        });
        
        return {
          statusCode: 200,
          body: JSON.stringify(formattedContent)
        };
      }
    } catch (error) {
      // If error accessing database, fall back to Contentful
      console.warn('Error fetching content references from database:', error);
    }
    
    // Build query to get MLM content for this section from Contentful
    const query = {
      content_type: 'mlmContent',
      'fields.section': section,
      'fields.locale': locale,
      order: '-sys.updatedAt'
    };
    
    // Get entries from Contentful
    const entries = await getEntries(query);
    
    // Format for client use
    const formattedContent = entries.reduce((result, entry) => {
      const formatted = formatContentfulResponse(entry);
      
      // Add content to result by key
      if (formatted.key) {
        result[formatted.key] = formatted.content;
      }
      
      return result;
    }, {
      // Default content
      section,
      locale,
      lastUpdated: new Date().toISOString()
    });
    
    // Store references for future quick access
    await storeContentReferences(entries.map(formatContentfulResponse), 'mlmContent', section, locale);
    
    return {
      statusCode: 200,
      body: JSON.stringify(formattedContent)
    };
  } catch (error) {
    console.error(`Error getting MLM content: ${error}`);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error retrieving MLM content',
        error: error.message
      })
    };
  }
}

/**
 * Store a content reference in the database
 */
async function storeContentReference(contentEntry, specificContentType = null, section = null, locale = null) {
  try {
    if (!contentEntry || !contentEntry.id) return null;
    
    // Check if reference already exists
    const existingReference = await prisma.contentReference.findUnique({
      where: { contentfulId: contentEntry.id }
    });
    
    const contentType = specificContentType || contentEntry.contentType;
    if (!contentType) return null;
    
    // Extract title and description from the content entry
    const title = contentEntry.title || contentEntry.key || contentEntry.name || '';
    const description = contentEntry.description || contentEntry.content || JSON.stringify(contentEntry);
    
    if (existingReference) {
      // Update existing reference
      return await prisma.contentReference.update({
        where: { contentfulId: contentEntry.id },
        data: {
          title,
          description,
          contentType,
          section: section || existingReference.section,
          locale: locale || existingReference.locale,
        }
      });
    } else {
      // Create new reference
      return await prisma.contentReference.create({
        data: {
          contentfulId: contentEntry.id,
          contentType,
          title,
          description,
          section: section || 'default',
          locale: locale || 'en-US'
        }
      });
    }
  } catch (error) {
    console.error('Error storing content reference:', error);
    return null;
  }
}

/**
 * Update an existing content reference in the database
 */
async function updateContentReference(contentEntry) {
  return storeContentReference(contentEntry);
}

/**
 * Store multiple content references in the database
 */
async function storeContentReferences(contentEntries, contentType, section = 'default', locale = 'en-US') {
  if (!contentEntries || !contentEntries.length || !contentType) return;
  
  try {
    await Promise.all(contentEntries.map(entry => 
      storeContentReference(entry, contentType, section, locale)
    ));
  } catch (error) {
    console.error('Error storing content references:', error);
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
    if (path.match(/\/api\/content\/mlm$/)) {
      // Get MLM-specific content
      return getMlmContent(event);
    } else if (path.match(/\/api\/content\/[^\/]+\/publish$/)) {
      // Only admins can publish content
      const adminError = await requireAdmin(event);
      if (adminError) return adminError;
      
      return publishContentEntry(event);
    } else if (path.match(/\/api\/content\/[^\/]+$/)) {
      return getContentEntry(event);
    } else if (path === '/api/content') {
      return getContentEntries(event);
    }
  } else if (method === 'POST' && path === '/api/content') {
    // Only admins can create content
    const adminError = await requireAdmin(event);
    if (adminError) return adminError;
    
    return createContentEntry(event);
  } else if (method === 'PUT' && path.match(/\/api\/content\/[^\/]+$/)) {
    // Only admins can update content
    const adminError = await requireAdmin(event);
    if (adminError) return adminError;
    
    return updateContentEntry(event);
  } else if (method === 'DELETE' && path.match(/\/api\/content\/[^\/]+$/)) {
    // Only admins can delete content
    const adminError = await requireAdmin(event);
    if (adminError) return adminError;
    
    return deleteContentEntry(event);
  }
  
  // If no route matches, return 404
  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Not found' })
  };
}; 