import { jwtDecode } from 'jwt-decode';

export const isValidToken = (token) => {
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const setSession = (token) => {
  if (token) {
    localStorage.setItem('mlm_token', token);
  } else {
    localStorage.removeItem('mlm_token');
    localStorage.removeItem('mlm_user');
  }
};

export const getSession = () => {
  return localStorage.getItem('mlm_token');
};