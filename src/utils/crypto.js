import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'MLM_SECURE_KEY_2024'; // In production, this should be an environment variable

/**
 * Encrypts data using AES encryption
 * @param {any} data - Data to encrypt
 * @returns {string} - Encrypted string
 */
export const encryptData = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts encrypted data
 * @param {string} encryptedData - Encrypted string to decrypt
 * @returns {any} - Decrypted data
 */
export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hashes a password using SHA-256
 * @param {string} password - Password to hash
 * @returns {string} - Hashed password
 */
export const hashPassword = (password) => {
  try {
    return CryptoJS.SHA256(password).toString();
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Generates a random salt
 * @param {number} length - Length of the salt
 * @returns {string} - Random salt
 */
export const generateSalt = (length = 16) => {
  try {
    return CryptoJS.lib.WordArray.random(length).toString();
  } catch (error) {
    console.error('Salt generation failed:', error);
    throw new Error('Failed to generate salt');
  }
};

/**
 * Verifies if a password matches its hash
 * @param {string} password - Password to verify
 * @param {string} hash - Hash to verify against
 * @returns {boolean} - Whether the password matches
 */
export const verifyPassword = (password, hash) => {
  try {
    const computedHash = CryptoJS.SHA256(password).toString();
    return computedHash === hash;
  } catch (error) {
    console.error('Password verification failed:', error);
    throw new Error('Failed to verify password');
  }
}; 