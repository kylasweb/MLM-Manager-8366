import { ERROR_MESSAGES, HTTP_STATUS } from '../config/constants';
import { toast } from 'react-toastify';

export class ApiError extends Error {
  constructor(message, status, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const handleApiError = (error) => {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      errors: error.errors
    };
  }

  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    const message = error.response.data?.message || getDefaultErrorMessage(status);
    const errors = error.response.data?.errors;

    return { status, message, errors };
  }

  if (error.request) {
    // Request made but no response
    return {
      status: HTTP_STATUS.SERVICE_UNAVAILABLE,
      message: ERROR_MESSAGES.NETWORK_ERROR
    };
  }

  // Error in request setup
  return {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: ERROR_MESSAGES.SERVER_ERROR
  };
};

export const showErrorToast = (error) => {
  const { message, errors } = handleApiError(error);
  
  if (errors) {
    // Show validation errors
    Object.values(errors).forEach(error => {
      toast.error(error[0]);
    });
  } else {
    toast.error(message);
  }
};

export const getDefaultErrorMessage = (status) => {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case HTTP_STATUS.FORBIDDEN:
      return 'Access denied.';
    case HTTP_STATUS.NOT_FOUND:
      return 'Resource not found.';
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return ERROR_MESSAGES.SERVER_ERROR;
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return ERROR_MESSAGES.NETWORK_ERROR;
    default:
      return ERROR_MESSAGES.SERVER_ERROR;
  }
};

export const validateResponse = (response) => {
  if (!response.success) {
    throw new ApiError(
      response.message || ERROR_MESSAGES.SERVER_ERROR,
      response.status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      response.errors
    );
  }
  return response.data;
};

export const handleFormErrors = (errors) => {
  const formattedErrors = {};
  
  if (typeof errors === 'string') {
    return { general: [errors] };
  }

  if (Array.isArray(errors)) {
    return { general: errors };
  }

  Object.entries(errors).forEach(([field, messages]) => {
    formattedErrors[field] = Array.isArray(messages) ? messages : [messages];
  });

  return formattedErrors;
}; 