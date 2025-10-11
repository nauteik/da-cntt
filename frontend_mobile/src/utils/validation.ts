import { ValidationError } from '../types';

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string): ValidationError | null => {
  if (!value || value.trim().length === 0) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
    };
  }
  return null;
};

/**
 * Validate minimum length
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): ValidationError | null => {
  if (value.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${minLength} characters`,
    };
  }
  return null;
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters long',
    });
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one uppercase letter',
    });
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one lowercase letter',
    });
  }
  
  if (!/\d/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one number',
    });
  }
  
  return errors;
};

/**
 * Validate employee ID format
 */
export const validateEmployeeId = (employeeId: string): ValidationError | null => {
  if (!employeeId) {
    return {
      field: 'employeeId',
      message: 'Employee ID is required',
    };
  }
  
  if (employeeId.length < 3) {
    return {
      field: 'employeeId',
      message: 'Employee ID must be at least 3 characters',
    };
  }
  
  return null;
};

/**
 * Validate patient ID format
 */
export const validatePatientId = (patientId: string): ValidationError | null => {
  if (!patientId) {
    return {
      field: 'patientId',
      message: 'Patient ID is required',
    };
  }
  
  if (patientId.length < 3) {
    return {
      field: 'patientId',
      message: 'Patient ID must be at least 3 characters',
    };
  }
  
  return null;
};

/**
 * Validate time format (HH:MM)
 */
export const validateTimeFormat = (time: string, fieldName: string): ValidationError | null => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!time) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
    };
  }
  
  if (!timeRegex.test(time)) {
    return {
      field: fieldName,
      message: `${fieldName} must be in HH:MM format`,
    };
  }
  
  return null;
};

/**
 * Validate form data
 */
export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, (value: any) => ValidationError | ValidationError[] | null>
): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = data[field];
    const result = rule(value);
    
    if (result) {
      if (Array.isArray(result)) {
        errors.push(...result);
      } else {
        errors.push(result);
      }
    }
  });
  
  return errors;
};