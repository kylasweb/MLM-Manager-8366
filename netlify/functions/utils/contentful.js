// Contentful integration utility for Netlify Functions
const contentful = require('contentful');
const contentfulManagement = require('contentful-management');

// Cache client instances
let deliveryClient = null;
let previewClient = null;
let managementClient = null;

/**
 * Get Contentful delivery client (for published content)
 */
function getDeliveryClient() {
  if (deliveryClient) return deliveryClient;
  
  if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_DELIVERY_TOKEN) {
    throw new Error('Missing Contentful environment variables');
  }
  
  deliveryClient = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
    environment: process.env.CONTENTFUL_ENVIRONMENT || 'master'
  });
  
  return deliveryClient;
}

/**
 * Get Contentful preview client (for draft content)
 */
function getPreviewClient() {
  if (previewClient) return previewClient;
  
  if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_PREVIEW_TOKEN) {
    throw new Error('Missing Contentful environment variables');
  }
  
  previewClient = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN,
    environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
    host: 'preview.contentful.com'
  });
  
  return previewClient;
}

/**
 * Get Contentful management client (for CRUD operations)
 */
function getManagementClient() {
  if (managementClient) return managementClient;
  
  if (!process.env.CONTENTFUL_MANAGEMENT_TOKEN) {
    throw new Error('Missing CONTENTFUL_MANAGEMENT_TOKEN environment variable');
  }
  
  managementClient = contentfulManagement.createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
  });
  
  return managementClient;
}

/**
 * Get an environment instance for management operations
 */
async function getEnvironment() {
  const client = getManagementClient();
  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
  return space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');
}

/**
 * Get entries with caching options
 * 
 * @param {Object} query - Query parameters following the Contentful API
 * @param {Object} options - Additional options
 * @param {boolean} options.preview - Whether to use the preview API
 * @param {boolean} options.includeUnpublished - Whether to include unpublished entries
 * @param {number} options.cacheTtl - Cache TTL in seconds (default: 3600)
 * @returns {Promise<Array>} Array of entries
 */
async function getEntries(query, options = {}) {
  // Determine which client to use
  const client = options.preview ? getPreviewClient() : getDeliveryClient();
  
  try {
    const response = await client.getEntries({
      ...query,
      include: query.include || 2 // Default include depth
    });
    
    return response.items;
  } catch (error) {
    console.error('Contentful getEntries error:', error);
    throw error;
  }
}

/**
 * Get a single entry by ID
 * 
 * @param {string} entryId - Contentful Entry ID
 * @param {Object} options - Additional options
 * @param {boolean} options.preview - Whether to use the preview API
 * @returns {Promise<Object>} Entry object
 */
async function getEntry(entryId, options = {}) {
  // Determine which client to use
  const client = options.preview ? getPreviewClient() : getDeliveryClient();
  
  try {
    return await client.getEntry(entryId, {
      include: options.include || 2
    });
  } catch (error) {
    console.error(`Contentful getEntry error for ID ${entryId}:`, error);
    throw error;
  }
}

/**
 * Create a new entry
 * 
 * @param {string} contentTypeId - Content type ID
 * @param {Object} fields - Entry fields
 * @returns {Promise<Object>} Created entry
 */
async function createEntry(contentTypeId, fields) {
  try {
    const environment = await getEnvironment();
    
    const entry = await environment.createEntry(contentTypeId, {
      fields: formatFieldsForContentful(fields)
    });
    
    // Publish the entry immediately if specified
    if (fields.publish) {
      await entry.publish();
    }
    
    return entry;
  } catch (error) {
    console.error('Contentful createEntry error:', error);
    throw error;
  }
}

/**
 * Update an existing entry
 * 
 * @param {string} entryId - Entry ID to update
 * @param {Object} fields - Updated fields
 * @param {boolean} publish - Whether to publish after updating
 * @returns {Promise<Object>} Updated entry
 */
async function updateEntry(entryId, fields, publish = false) {
  try {
    const environment = await getEnvironment();
    const entry = await environment.getEntry(entryId);
    
    // Update fields
    Object.entries(formatFieldsForContentful(fields)).forEach(([key, value]) => {
      entry.fields[key] = value;
    });
    
    // Save changes
    const updatedEntry = await entry.update();
    
    // Publish if requested
    if (publish) {
      await updatedEntry.publish();
    }
    
    return updatedEntry;
  } catch (error) {
    console.error(`Contentful updateEntry error for ID ${entryId}:`, error);
    throw error;
  }
}

/**
 * Delete an entry
 * 
 * @param {string} entryId - Entry ID to delete
 * @returns {Promise<void>}
 */
async function deleteEntry(entryId) {
  try {
    const environment = await getEnvironment();
    const entry = await environment.getEntry(entryId);
    
    // Unpublish first if published
    if (entry.isPublished()) {
      await entry.unpublish();
    }
    
    // Delete the entry
    await entry.delete();
  } catch (error) {
    console.error(`Contentful deleteEntry error for ID ${entryId}:`, error);
    throw error;
  }
}

/**
 * Format fields for Contentful (handling localization)
 * 
 * @param {Object} fields - Regular fields object
 * @returns {Object} Contentful formatted fields
 */
function formatFieldsForContentful(fields) {
  const locale = 'en-US'; // Default locale
  const formattedFields = {};
  
  Object.entries(fields).forEach(([key, value]) => {
    // Skip special flags like 'publish'
    if (key === 'publish') return;
    
    // Format the field with locale
    formattedFields[key] = {
      [locale]: value
    };
  });
  
  return formattedFields;
}

/**
 * Format Contentful response to a simpler structure
 * 
 * @param {Object} entry - Contentful entry
 * @returns {Object} Simplified entry
 */
function formatContentfulResponse(entry) {
  if (!entry) return null;
  
  // Extract basic fields
  const formatted = {
    id: entry.sys.id,
    contentType: entry.sys.contentType?.sys?.id,
    createdAt: entry.sys.createdAt,
    updatedAt: entry.sys.updatedAt,
  };
  
  // Extract fields (removing locale)
  if (entry.fields) {
    Object.entries(entry.fields).forEach(([key, value]) => {
      const locale = Object.keys(value)[0]; // Get first locale
      formatted[key] = value[locale];
    });
  }
  
  return formatted;
}

module.exports = {
  getDeliveryClient,
  getPreviewClient,
  getManagementClient,
  getEnvironment,
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  formatFieldsForContentful,
  formatContentfulResponse
}; 