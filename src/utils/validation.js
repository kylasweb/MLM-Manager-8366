import { ERROR_MESSAGES } from '../config/constants';

export class ValidationError extends Error {
  constructor(errors) {
    super(ERROR_MESSAGES.VALIDATION_ERROR);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export const validateInvestment = (amount) => {
  const errors = {};
  const minAmount = process.env.REACT_APP_MIN_INVESTMENT;
  const maxAmount = process.env.REACT_APP_MAX_INVESTMENT;

  if (!amount) {
    errors.amount = ['Investment amount is required'];
  } else if (amount < minAmount) {
    errors.amount = [`Minimum investment amount is $${minAmount}`];
  } else if (amount > maxAmount) {
    errors.amount = [`Maximum investment amount is $${maxAmount}`];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return true;
};

export const validateWithdrawal = (amount) => {
  const errors = {};
  const minAmount = process.env.REACT_APP_MIN_WITHDRAWAL;

  if (!amount) {
    errors.amount = ['Withdrawal amount is required'];
  } else if (amount < minAmount) {
    errors.amount = [`Minimum withdrawal amount is $${minAmount}`];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return true;
};

export const validateSponsorId = (sponsorId) => {
  const errors = {};

  if (!sponsorId) {
    errors.sponsorId = ['Sponsor ID is required'];
  } else if (!/^[A-Z0-9]{8}$/.test(sponsorId)) {
    errors.sponsorId = ['Invalid sponsor ID format'];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return true;
};

export const validateBusinessVolume = ({ type, amount }) => {
  const errors = {};

  if (!type) {
    errors.type = ['Business volume type is required'];
  } else if (!['product_sales', 'investment'].includes(type)) {
    errors.type = ['Invalid business volume type'];
  }

  if (!amount || amount <= 0) {
    errors.amount = ['Amount must be greater than 0'];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return true;
};

export const validateRegistration = (data) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  if (!data.username) {
    errors.username = ['Username is required'];
  } else if (data.username.length < 3) {
    errors.username = ['Username must be at least 3 characters long'];
  }

  if (!data.email) {
    errors.email = ['Email is required'];
  } else if (!emailRegex.test(data.email)) {
    errors.email = ['Invalid email format'];
  }

  if (!data.password) {
    errors.password = ['Password is required'];
  } else if (!passwordRegex.test(data.password)) {
    errors.password = [
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
    ];
  }

  if (data.password !== data.passwordConfirmation) {
    errors.passwordConfirmation = ['Passwords do not match'];
  }

  if (data.sponsorId && !/^[A-Z0-9]{8}$/.test(data.sponsorId)) {
    errors.sponsorId = ['Invalid sponsor ID format'];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return true;
};

export const validateProfile = (data) => {
  const errors = {};
  const phoneRegex = /^\+?[\d\s-]{10,}$/;

  if (!data.name) {
    errors.name = ['Name is required'];
  }

  if (data.phone && !phoneRegex.test(data.phone)) {
    errors.phone = ['Invalid phone number format'];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return true;
}; 