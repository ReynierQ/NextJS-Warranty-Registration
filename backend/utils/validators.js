// utils/validators.js

// Validate email format
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validate phone number (basic)
export const validatePhoneNumber = (phone) => {
  const regex = /^(09\d{9}|\+639\d{9})$/;
  return regex.test(phone);
};

// Validate date format
export const validateDate = (date) => {
  return !isNaN(Date.parse(date));
};
