/**
 * Success Alert component
 * Displays success messages with optional dismiss button
 */

export interface SuccessAlertOptions {
  message: string;
  details?: string[]; // Additional details
  dismissible?: boolean;
  autoDismiss?: number; // Auto-dismiss after N milliseconds
  onDismiss?: () => void;
}

/**
 * Create success alert element
 */
export function createSuccessAlert(options: SuccessAlertOptions): HTMLElement {
  const { message, details, dismissible = true, autoDismiss = 5000, onDismiss } = options;

  const alert = document.createElement('div');
  alert.className = 'alert alert-success';
  alert.setAttribute('role', 'alert');

  // Content container
  const content = document.createElement('div');
  content.style.flex = '1';

  // Main message
  const messageElement = document.createElement('div');
  messageElement.style.fontWeight = '500';
  messageElement.textContent = message;
  content.appendChild(messageElement);

  // Details (if any)
  if (details && details.length > 0) {
    const detailsList = document.createElement('ul');
    detailsList.style.marginTop = '0.5rem';
    detailsList.style.marginLeft = '1.25rem';
    detailsList.style.fontSize = '0.875rem';

    details.forEach((detail) => {
      const li = document.createElement('li');
      li.textContent = detail;
      detailsList.appendChild(li);
    });

    content.appendChild(detailsList);
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
 * Show success alert in a container
 */
export function showSuccessAlert(
  container: HTMLElement,
  options: SuccessAlertOptions
): HTMLElement {
  // Remove existing success alerts
  const existingAlerts = container.querySelectorAll('.alert-success');
  existingAlerts.forEach((alert) => alert.remove());

  const alert = createSuccessAlert(options);
  container.insertBefore(alert, container.firstChild);

  // Scroll to top to show alert
  container.scrollTop = 0;

  return alert;
}

/**
 * Create simple success message
 */
export function showSuccessMessage(
  container: HTMLElement,
  message: string,
  autoDismiss = 5000
): HTMLElement {
  return showSuccessAlert(container, {
    message,
    autoDismiss,
  });
}
