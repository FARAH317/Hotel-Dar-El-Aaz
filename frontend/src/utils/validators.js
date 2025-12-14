/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate phone number (Algerian format)
 */
export const isValidPhone = (phone) => {
  // Algerian phone: +213 followed by 9 digits
  const regex = /^(\+213|0)[5-7]\d{8}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate password strength
 */
export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

/**
 * Validate date range
 */
export const isValidDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  return new Date(endDate) > new Date(startDate);
};

/**
 * Validate required field
 */
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validate number range
 */
export const isInRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Calculate nights between dates
 */
export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Form validation helper
 */
export const validateForm = (values, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = values[field];
    const fieldRules = rules[field];
    
    // Check required
    if (fieldRules.required && !isRequired(value)) {
      errors[field] = fieldRules.requiredMessage || 'Ce champ est requis';
      return;
    }
    
    // Check email
    if (fieldRules.email && value && !isValidEmail(value)) {
      errors[field] = 'Email invalide';
      return;
    }
    
    // Check phone
    if (fieldRules.phone && value && !isValidPhone(value)) {
      errors[field] = 'Numéro de téléphone invalide';
      return;
    }
    
    // Check password
    if (fieldRules.password && value && !isValidPassword(value)) {
      errors[field] = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre';
      return;
    }
    
    // Check min length
    if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      errors[field] = `Minimum ${fieldRules.minLength} caractères`;
      return;
    }
    
    // Check max length
    if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
      errors[field] = `Maximum ${fieldRules.maxLength} caractères`;
      return;
    }
    
    // Check custom validator
    if (fieldRules.validator && value) {
      const error = fieldRules.validator(value, values);
      if (error) {
        errors[field] = error;
      }
    }
  });
  
  return errors;
};