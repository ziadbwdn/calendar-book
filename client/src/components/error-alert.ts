/**
 * Error Alert component
 * Displays error messages with optional dismiss button
 */

import { ApiError } from '../services/api';

export interface ErrorAlertOptions {
  message: string;
  errors?: Record<string, string[]>; // Validation errors
  dismissible?: boolean;
  autoDismiss?: number; // Auto-dismiss after N milliseconds
  onDismiss?: () => void;
}

/**
 * Create error alert element
 */
export function createErrorAlert(options: ErrorAlertOptions): HTMLElement {
  const { message, errors, dismissible = true, autoDismiss, onDismiss } = options;

  const alert = document.createElement('div');
  alert.className = 'alert alert-error';
  alert.setAttribute('role', 'alert');

  // Content container
  const content = document.createElement('div');
  content.style.flex = '1';

  // Main message
  const messageElement = document.createElement('div');
  messageElement.style.fontWeight = '500';
  messageElement.textContent = message;
  content.appendChild(messageElement);

  // Validation errors (if any)
  if (errors && Object.keys(errors).length > 0) {
    const errorList = document.createElement('ul');
    errorList.style.marginTop = '0.5rem';
    errorList.style.marginLeft = '1.25rem';
    errorList.style.fontSize = '0.875rem';

    Object.entries(errors).forEach(([field, messages]) => {
      messages.forEach((msg) => {
        const li = document.createElement('li');
        li.textContent = `${field}: ${msg}`;
        errorList.appendChild(li);
      });
    });

    content.appendChild(errorList);
  }

  alert.appendChild(content);

  // Dismiss button
  if (dismissible) {
    const dismissBtn = document.createElement('button');
    dismissBtn.innerHTML = '&times;';
    dismissBtn.style.background = 'none';
    dismissBtn.style.border = 'none';
    dismissBtn.style.fontSize = '1.5rem';
    dismissBtn.style.cursor = 'pointer';
    dismissBtn.style.color = 'inherit';
    dismissBtn.style.padding = '0';
    dismissBtn.style.marginLeft = '1rem';
    dismissBtn.style.lineHeight = '1';
    dismissBtn.setAttribute('aria-label', 'Dismiss');

    dismissBtn.onclick = () => {
      alert.remove();
      if (onDismiss) {
        onDismiss();
      }
    };

    alert.appendChild(dismissBtn);
  }

  // Auto-dismiss
  if (autoDismiss && autoDismiss > 0) {
    setTimeout(() => {
      if (alert.parentElement) {
        alert.remove();
        if (onDismiss) {
          onDismiss();
        }
      }
    }, autoDismiss);
  }

  return alert;
}

/**
 * Create error alert from ApiError
 */
export function createErrorAlertFromApiError(
  error: ApiError,
  options: Partial<ErrorAlertOptions> = {}
): HTMLElement {
  return createErrorAlert({
    message: error.message,
    errors: error.errors,
    ...options,
  });
}

/**
 * Create error alert from generic Error
 */
export function createErrorAlertFromError(
  error: Error,
  options: Partial<ErrorAlertOptions> = {}
): HTMLElement {
  return createErrorAlert({
    message: error.message || 'An unexpected error occurred',
    ...options,
  });
}

/**
 * Show error alert in a container
 */
export function showErrorAlert(
  container: HTMLElement,
  options: ErrorAlertOptions
): HTMLElement {
  // Remove existing alerts
  const existingAlerts = container.querySelectorAll('.alert-error');
  existingAlerts.forEach((alert) => alert.remove());

  const alert = createErrorAlert(options);
  container.insertBefore(alert, container.firstChild);

  // Scroll to top to show alert
  container.scrollTop = 0;

  return alert;
}
