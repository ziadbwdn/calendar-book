/**
 * 404 Not Found page
 */

export function createNotFoundPage(): HTMLElement {
  const page = document.createElement('div');
  page.style.minHeight = '100vh';
  page.style.display = 'flex';
  page.style.alignItems = 'center';
  page.style.justifyContent = 'center';
  page.style.backgroundColor = '#f5f5f5';
  page.style.padding = '2rem';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.maxWidth = '500px';
  card.style.textAlign = 'center';

  // 404 icon/number
  const errorCode = document.createElement('div');
  errorCode.style.fontSize = '6rem';
  errorCode.style.fontWeight = '700';
  errorCode.style.color = '#2c3e50';
  errorCode.style.marginBottom = '1rem';
  errorCode.textContent = '404';

  // Title
  const title = document.createElement('h1');
  title.style.fontSize = '2rem';
  title.style.marginBottom = '1rem';
  title.textContent = 'Page Not Found';

  // Message
  const message = document.createElement('p');
  message.style.color = '#666';
  message.style.fontSize = '1.125rem';
  message.style.marginBottom = '2rem';
  message.textContent = "The page you're looking for doesn't exist or has been moved.";

  // Home button
  const homeBtn = document.createElement('a');
  homeBtn.href = '/';
  homeBtn.className = 'btn btn-primary';
  homeBtn.textContent = 'Go to Home';
  homeBtn.style.textDecoration = 'none';

  card.appendChild(errorCode);
  card.appendChild(title);
  card.appendChild(message);
  card.appendChild(homeBtn);

  page.appendChild(card);

  return page;
}
