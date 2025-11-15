/**
 * Form validation utilities
 */

export interface ValidationErrors {
  [key: string]: string;
}

export function validateEmail(email: string): string | null {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!regex.test(email)) return 'Invalid email format';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export function validateFullName(name: string): string | null {
  if (!name) return 'Full name is required';
  if (name.trim().length < 2) return 'Full name must be at least 2 characters';
  return null;
}

export function validateLoginForm(email: string, password: string): ValidationErrors {
  const errors: ValidationErrors = {};

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  return errors;
}

export function validateRegisterForm(
  email: string,
  password: string,
  fullName: string,
  role?: string
): ValidationErrors {
  const errors: ValidationErrors = {};

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  const nameError = validateFullName(fullName);
  if (nameError) errors.fullName = nameError;

  if (role && !['organizer', 'invitee', 'guest'].includes(role)) {
    errors.role = 'Invalid role selected';
  }

  return errors;
}

export function validateBookingForm(
  name: string,
  email: string
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!name || name.trim().length < 2) {
    errors.name = 'Please enter your full name';
  }

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function getErrorMessage(errors: ValidationErrors, field: string): string {
  return errors[field] || '';
}
