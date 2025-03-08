import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const JWT_SECRET = 'MLM_JWT_SECRET_2024'; // In production, this should be an environment variable
const JWT_REFRESH_SECRET = 'MLM_JWT_REFRESH_SECRET_2024'; // In production, this should be an environment variable
const TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Generates a JWT token
 * @param {Object} payload - Data to encode in the token
 * @returns {string} - Generated token
 */
export const generateToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  } catch (error) {
    console.error('Token generation failed:', error);
    throw new Error('Failed to generate token');
  }
};

/**
 * Generates a refresh token
 * @param {Object} payload - Data to encode in the token
 * @returns {string} - Generated refresh token
 */
export const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  } catch (error) {
    console.error('Refresh token generation failed:', error);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Verifies a JWT token
 * @param {string} token - Token to verify
 * @returns {Object} - Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid token');
  }
};

/**
 * Verifies a refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} - Decoded token payload
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    throw new Error('Invalid refresh token');
  }
};

/**
 * Checks if a token is valid
 * @param {string} token - Token to check
 * @returns {boolean} - Whether the token is valid
 */
export const isValidToken = (token) => {
  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decoded.exp <= currentTime) {
      return false;
    }

    // Check if token was issued in the future
    if (decoded.iat > currentTime) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Sets the session token in localStorage and axios headers
 * @param {string} token - Token to set
 */
export const setSession = (token) => {
  if (token) {
    localStorage.setItem('mlm_token', token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('mlm_token');
    delete axios.defaults.headers.common.Authorization;
  }
};

/**
 * Gets the current session token
 * @returns {string|null} - Current session token
 */
export const getSession = () => {
  return localStorage.getItem('mlm_token');
};

/**
 * Decodes a JWT token without verifying
 * @param {string} token - Token to decode
 * @returns {Object|null} - Decoded token payload
 */
export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

/**
 * Gets the remaining time until token expiration
 * @param {string} token - Token to check
 * @returns {number} - Seconds until expiration
 */
export const getTokenExpiryTime = (token) => {
  try {
    const decoded = jwtDecode(token);
    if (!decoded) return 0;
    
    const currentTime = Date.now() / 1000;
    return Math.max(0, decoded.exp - currentTime);
  } catch {
    return 0;
  }
};