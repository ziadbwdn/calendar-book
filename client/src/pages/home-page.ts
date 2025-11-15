/**
 * Home page for invitees
 * Shows welcome message and allows them to book with an organizer
 */

import type { User } from '../types/auth';
import { router } from '../router';
import { AuthService } from '../services/auth.service';

export function createHomePage(user: User): HTMLElement {
  const page = document.createElement('div');
  page.style.minHeight = '100vh';
  page.style.display = 'flex';
  page.style.alignItems = 'center';
  page.style.justifyContent = 'center';
  page.style.backgroundColor = '#f5f5f5';
  page.style.padding = '2rem';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.maxWidth = '600px';
  card.style.textAlign = 'center';

  // Welcome message
  const title = document.createElement('h1');
  title.style.fontSize = '2rem';
  title.style.marginBottom = '1rem';
  title.textContent = `Welcome, ${user.fullName}!`;

  const subtitle = document.createElement('p');
  subtitle.style.color = '#666';
  subtitle.style.fontSize = '1.125rem';
  subtitle.style.marginBottom = '2rem';
  subtitle.textContent = 'Book a meeting with an organizer';

  // Instructions
  const instructions = document.createElement('div');
  instructions.style.backgroundColor = '#f5f5f5';
  instructions.style.padding = '1.5rem';
  instructions.style.borderRadius = '4px';
  instructions.style.marginBottom = '2rem';
  instructions.style.textAlign = 'left';

  instructions.innerHTML = `
    <p style="margin-bottom: 1rem; font-weight: 500;">To book a meeting:</p>
    <ol style="margin-left: 1.5rem; color: #666;">
      <li style="margin-bottom: 0.5rem;">Get the booking link from your organizer</li>
      <li style="margin-bottom: 0.5rem;">Click the link to view available time slots</li>
      <li style="margin-bottom: 0.5rem;">Select a time that works for you</li>
      <li>Enter your details and confirm the booking</li>
    </ol>
  `;

  // Organizer ID input form
  const form = document.createElement('form');
  form.style.marginTop = '2rem';

  const formGroup = document.createElement('div');
  formGroup.className = 'form-group';
  formGroup.style.textAlign = 'left';

  const label = document.createElement('label');
  label.htmlFor = 'organizer-id';
  label.textContent = 'Or enter Organizer ID:';

  const inputWrapper = document.createElement('div');
  inputWrapper.style.display = 'flex';
  inputWrapper.style.gap = '0.5rem';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'organizer-id';
  input.placeholder = 'e.g., 123e4567-e89b-12d3-a456-426614174000';
  input.style.flex = '1';

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = 'Go';

  inputWrapper.appendChild(input);
  inputWrapper.appendChild(submitBtn);

  formGroup.appendChild(label);
  formGroup.appendChild(inputWrapper);
  form.appendChild(formGroup);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const organizerId = input.value.trim();
    if (organizerId) {
      router.navigate(`/book/${organizerId}`);
    }
  });

  // Logout button
  const logoutButtonContainer = document.createElement('div');
  logoutButtonContainer.style.marginTop = '2rem';
  logoutButtonContainer.style.display = 'flex';
  logoutButtonContainer.style.justifyContent = 'center';

  const logoutBtn = document.createElement('button');
  logoutBtn.type = 'button';
  logoutBtn.className = 'btn btn-secondary';
  logoutBtn.textContent = 'Logout';
  logoutBtn.addEventListener('click', () => {
    AuthService.logout();
    router.navigate('/login');
  });

  logoutButtonContainer.appendChild(logoutBtn);

  card.appendChild(title);
  card.appendChild(subtitle);
  card.appendChild(instructions);
  card.appendChild(form);
  card.appendChild(logoutButtonContainer);

  page.appendChild(card);

  return page;
}
