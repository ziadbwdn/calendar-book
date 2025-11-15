/**
 * Authentication page
 * Handles both login and registration
 */

import { AuthService } from '../services/auth.service';
import { ApiError } from '../services/api';
import { createErrorAlertFromApiError } from '../components/error-alert';
import {
  validateLoginForm,
  validateRegisterForm,
  hasErrors,
} from '../utils/validation';
import type { ValidationErrors } from '../utils/validation';
import type { UserRole } from '../types/auth';

export type AuthPageMode = 'login' | 'register';

export interface AuthPageOptions {
  mode?: AuthPageMode;
  onSuccess?: (role: UserRole) => void;
}

/**
 * Create authentication page
 */
export function createAuthPage(options: AuthPageOptions = {}): HTMLElement {
  const { mode = 'login', onSuccess } = options;

  const page = document.createElement('div');
  page.className = 'auth-page';
  page.style.minHeight = '100vh';
  page.style.display = 'flex';
  page.style.alignItems = 'center';
  page.style.justifyContent = 'center';
  page.style.backgroundColor = '#f5f5f5';
  page.style.padding = '2rem';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.width = '100%';
  card.style.maxWidth = '400px';

  // Header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '2rem';

  const title = document.createElement('h1');
  title.style.fontSize = '1.75rem';
  title.style.marginBottom = '0.5rem';
  title.textContent = 'Calendar Booking System';

  const subtitle = document.createElement('p');
  subtitle.style.color = '#666';
  subtitle.textContent = mode === 'login' ? 'Login to your account' : 'Create a new account';

  header.appendChild(title);
  header.appendChild(subtitle);
  card.appendChild(header);

  // Error container
  const errorContainer = document.createElement('div');
  errorContainer.id = 'auth-error-container';
  card.appendChild(errorContainer);

  // Form container
  const formContainer = document.createElement('div');
  formContainer.id = 'auth-form-container';

  if (mode === 'login') {
    formContainer.appendChild(createLoginForm(errorContainer, onSuccess));
  } else {
    formContainer.appendChild(createRegisterForm(errorContainer, onSuccess));
  }

  card.appendChild(formContainer);
  page.appendChild(card);

  return page;
}

/**
 * Create login form
 */
function createLoginForm(
  errorContainer: HTMLElement,
  onSuccess?: (role: UserRole) => void
): HTMLElement {
  const form = document.createElement('form');
  form.id = 'login-form';

  // Email field
  const emailGroup = createFormGroup('email', 'Email', 'email', 'email');
  form.appendChild(emailGroup);

  // Password field
  const passwordGroup = createFormGroup('password', 'Password', 'password', 'password');
  form.appendChild(passwordGroup);

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary btn-block';
  submitBtn.textContent = 'Login';
  submitBtn.style.marginBottom = '1rem';
  form.appendChild(submitBtn);

  // Switch to register link
  const switchText = document.createElement('p');
  switchText.style.textAlign = 'center';
  switchText.style.color = '#666';
  switchText.innerHTML = `
    Don't have an account?
    <a href="/register" style="color: #2c3e50; font-weight: 500; text-decoration: none;">Register here</a>
  `;

  const switchLink = switchText.querySelector('a');
  if (switchLink) {
    switchLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/register';
    });
  }

  form.appendChild(switchText);

  // Form submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    errorContainer.innerHTML = '';
    clearFormErrors(form);

    // Get form values
    const email = (form.querySelector('#email') as HTMLInputElement).value.trim();
    const password = (form.querySelector('#password') as HTMLInputElement).value;

    // Validate
    const errors = validateLoginForm(email, password);
    if (hasErrors(errors)) {
      displayFormErrors(form, errors);
      return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      const response = await AuthService.login({ email, password });

      // Success - redirect based on role
      if (onSuccess) {
        onSuccess(response.user.role);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        errorContainer.appendChild(createErrorAlertFromApiError(error));
      } else {
        errorContainer.appendChild(
          createErrorAlertFromApiError(
            new ApiError(0, 'An unexpected error occurred. Please try again.')
          )
        );
      }

      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  });

  return form;
}

/**
 * Create register form
 */
function createRegisterForm(
  errorContainer: HTMLElement,
  onSuccess?: (role: UserRole) => void
): HTMLElement {
  const form = document.createElement('form');
  form.id = 'register-form';

  // Email field
  const emailGroup = createFormGroup('email', 'Email', 'email', 'email');
  form.appendChild(emailGroup);

  // Password field
  const passwordGroup = createFormGroup('password', 'Password', 'password', 'password');
  const passwordHint = document.createElement('small');
  passwordHint.style.color = '#666';
  passwordHint.style.fontSize = '0.875rem';
  passwordHint.textContent = 'Minimum 6 characters';
  passwordGroup.appendChild(passwordHint);
  form.appendChild(passwordGroup);

  // Full Name field
  const nameGroup = createFormGroup('fullName', 'Full Name', 'text', 'fullName');
  form.appendChild(nameGroup);

  // Role selector
  const roleGroup = document.createElement('div');
  roleGroup.className = 'form-group';

  const roleLabel = document.createElement('label');
  roleLabel.htmlFor = 'role';
  roleLabel.textContent = 'I am a...';

  const roleSelect = document.createElement('select');
  roleSelect.id = 'role';
  roleSelect.name = 'role';

  const optionOrganizer = document.createElement('option');
  optionOrganizer.value = 'organizer';
  optionOrganizer.textContent = 'Organizer (I want to accept bookings)';

  const optionInvitee = document.createElement('option');
  optionInvitee.value = 'invitee';
  optionInvitee.textContent = 'Invitee (I want to book meetings)';

  roleSelect.appendChild(optionOrganizer);
  roleSelect.appendChild(optionInvitee);

  const roleError = document.createElement('div');
  roleError.className = 'form-error';
  roleError.id = 'role-error';

  roleGroup.appendChild(roleLabel);
  roleGroup.appendChild(roleSelect);
  roleGroup.appendChild(roleError);
  form.appendChild(roleGroup);

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary btn-block';
  submitBtn.textContent = 'Create Account';
  submitBtn.style.marginBottom = '1rem';
  form.appendChild(submitBtn);

  // Switch to login link
  const switchText = document.createElement('p');
  switchText.style.textAlign = 'center';
  switchText.style.color = '#666';
  switchText.innerHTML = `
    Already have an account?
    <a href="/login" style="color: #2c3e50; font-weight: 500; text-decoration: none;">Login here</a>
  `;

  const switchLink = switchText.querySelector('a');
  if (switchLink) {
    switchLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/login';
    });
  }

  form.appendChild(switchText);

  // Form submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    errorContainer.innerHTML = '';
    clearFormErrors(form);

    // Get form values
    const email = (form.querySelector('#email') as HTMLInputElement).value.trim();
    const password = (form.querySelector('#password') as HTMLInputElement).value;
    const fullName = (form.querySelector('#fullName') as HTMLInputElement).value.trim();
    const role = (form.querySelector('#role') as HTMLSelectElement).value as UserRole;

    // Validate
    const errors = validateRegisterForm(email, password, fullName, role);
    if (hasErrors(errors)) {
      displayFormErrors(form, errors);
      return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const response = await AuthService.register({
        email,
        password,
        fullName,
        role,
      });

      // Success - redirect based on role
      if (onSuccess) {
        onSuccess(response.user.role);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        errorContainer.appendChild(createErrorAlertFromApiError(error));
      } else {
        errorContainer.appendChild(
          createErrorAlertFromApiError(
            new ApiError(0, 'An unexpected error occurred. Please try again.')
          )
        );
      }

      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });

  return form;
}

/**
 * Helper: Create form group with label and input
 */
function createFormGroup(
  id: string,
  label: string,
  type: string,
  name: string
): HTMLElement {
  const group = document.createElement('div');
  group.className = 'form-group';

  const labelElement = document.createElement('label');
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  // For password fields, create a wrapper with toggle button
  if (type === 'password') {
    const inputWrapper = document.createElement('div');
    inputWrapper.style.position = 'relative';

    const input = document.createElement('input');
    input.type = 'password';
    input.id = id;
    input.name = name;
    input.style.paddingRight = '3rem';

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.textContent = '○';
    toggleBtn.style.position = 'absolute';
    toggleBtn.style.right = '0.5rem';
    toggleBtn.style.top = '50%';
    toggleBtn.style.transform = 'translateY(-50%)';
    toggleBtn.style.border = 'none';
    toggleBtn.style.background = 'none';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.fontSize = '1.25rem';
    toggleBtn.style.padding = '0.25rem';
    toggleBtn.style.color = '#2c3e50';
    toggleBtn.setAttribute('aria-label', 'Toggle password visibility');

    toggleBtn.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.textContent = '⊗';
      } else {
        input.type = 'password';
        toggleBtn.textContent = '○';
      }
    });

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(toggleBtn);

    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.id = `${id}-error`;

    group.appendChild(labelElement);
    group.appendChild(inputWrapper);
    group.appendChild(errorElement);
  } else {
    // Regular input field
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.name = name;

    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.id = `${id}-error`;

    group.appendChild(labelElement);
    group.appendChild(input);
    group.appendChild(errorElement);
  }

  return group;
}

/**
 * Display form validation errors
 */
function displayFormErrors(form: HTMLFormElement, errors: ValidationErrors): void {
  Object.entries(errors).forEach(([field, message]) => {
    const errorElement = form.querySelector(`#${field}-error`);
    if (errorElement) {
      errorElement.textContent = message;
    }
  });
}

/**
 * Clear all form errors
 */
function clearFormErrors(form: HTMLFormElement): void {
  const errorElements = form.querySelectorAll('.form-error');
  errorElements.forEach((element) => {
    element.textContent = '';
  });
}
