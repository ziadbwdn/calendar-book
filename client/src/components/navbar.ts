/**
 * Navbar component
 * Displays top navigation with user info and logout button
 */

import type { User } from '../types/auth';
import { AuthService } from '../services/auth.service';

export interface NavbarOptions {
  user?: User | null;
  onLogout?: () => void;
}

/**
 * Create navbar element
 */
export function createNavbar(options: NavbarOptions = {}): HTMLElement {
  const { user, onLogout } = options;

  const navbar = document.createElement('nav');
  navbar.className = 'app-navbar';

  // Left side - brand/title
  const left = document.createElement('div');
  left.innerHTML = `
    <h2 style="margin: 0; font-size: 1.25rem; color: #2c3e50;">
      Calendar Booking System
    </h2>
  `;

  // Right side - user info and actions
  const right = document.createElement('div');
  right.style.display = 'flex';
  right.style.alignItems = 'center';
  right.style.gap = '1rem';

  if (user) {
    // User info
    const userInfo = document.createElement('div');
    userInfo.style.textAlign = 'right';
    userInfo.innerHTML = `
      <div style="font-weight: 500; color: #333;">${user.fullName}</div>
      <div style="font-size: 0.875rem; color: #666;">${user.role.toUpperCase()}</div>
    `;
    right.appendChild(userInfo);

    // Logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn btn-secondary';
    logoutBtn.textContent = 'Logout';
    logoutBtn.onclick = () => {
      AuthService.logout();
      if (onLogout) {
        onLogout();
      }
    };
    right.appendChild(logoutBtn);
  } else {
    // Login/Register links
    const loginLink = document.createElement('a');
    loginLink.href = '/login';
    loginLink.className = 'btn btn-primary';
    loginLink.textContent = 'Login';
    loginLink.onclick = (e) => {
      e.preventDefault();
      window.location.href = '/login';
    };
    right.appendChild(loginLink);
  }

  navbar.appendChild(left);
  navbar.appendChild(right);

  return navbar;
}

/**
 * Update navbar with new user
 */
export function updateNavbar(navbar: HTMLElement, user: User | null, onLogout?: () => void): void {
  const newNavbar = createNavbar({ user, onLogout });
  navbar.innerHTML = newNavbar.innerHTML;

  // Re-attach event listeners
  const logoutBtn = navbar.querySelector('button');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      AuthService.logout();
      if (onLogout) {
        onLogout();
      }
    };
  }
}
