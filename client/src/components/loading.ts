/**
 * Loading component
 * Displays loading spinner
 */

export interface LoadingOptions {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  fullPage?: boolean;
}

/**
 * Create loading spinner element
 */
export function createLoadingSpinner(options: LoadingOptions = {}): HTMLElement {
  const { text = 'Loading...', size = 'medium', fullPage = false } = options;

  const container = document.createElement('div');
  container.className = 'loading-container';

  // Sizing
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px',
  };

  if (fullPage) {
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.minHeight = '400px';
    container.style.gap = '1rem';
  } else {
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '0.75rem';
    container.style.padding = '1rem';
  }

  // Spinner
  const spinner = document.createElement('div');
  spinner.className = 'loading';
  spinner.style.width = sizeMap[size];
  spinner.style.height = sizeMap[size];

  // Text
  const textElement = document.createElement('span');
  textElement.textContent = text;
  textElement.style.color = '#666';
  textElement.style.fontSize = size === 'small' ? '0.875rem' : '1rem';

  container.appendChild(spinner);
  container.appendChild(textElement);

  return container;
}

/**
 * Create inline loading spinner (just the spinner, no text)
 */
export function createInlineSpinner(size: 'small' | 'medium' | 'large' = 'small'): HTMLElement {
  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '32px',
  };

  const spinner = document.createElement('div');
  spinner.className = 'loading';
  spinner.style.width = sizeMap[size];
  spinner.style.height = sizeMap[size];

  return spinner;
}

/**
 * Show loading overlay on entire page
 */
export function showLoadingOverlay(text = 'Loading...'): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = 'loading-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.right = '0';
  overlay.style.bottom = '0';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '9999';

  const content = document.createElement('div');
  content.style.backgroundColor = 'white';
  content.style.padding = '2rem';
  content.style.borderRadius = '8px';
  content.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.alignItems = 'center';
  content.style.gap = '1rem';

  const spinner = document.createElement('div');
  spinner.className = 'loading';
  spinner.style.width = '48px';
  spinner.style.height = '48px';

  const textElement = document.createElement('div');
  textElement.textContent = text;
  textElement.style.fontSize = '1.125rem';
  textElement.style.color = '#333';

  content.appendChild(spinner);
  content.appendChild(textElement);
  overlay.appendChild(content);

  document.body.appendChild(overlay);

  return overlay;
}

/**
 * Hide loading overlay
 */
export function hideLoadingOverlay(): void {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}
