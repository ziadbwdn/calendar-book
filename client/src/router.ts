/**
 * Client-side router
 * Handles SPA navigation and route matching
 */

import { AuthService } from './services/auth.service';

export interface Route {
  path: string;
  name: string;
  handler: (params: RouteParams) => HTMLElement | Promise<HTMLElement>;
  requiresAuth?: boolean;
  allowedRoles?: string[];
}

export interface RouteParams {
  [key: string]: string;
}

export class Router {
  private routes: Route[] = [];
  private currentPath: string = '';
  private notFoundHandler: (() => HTMLElement) | null = null;

  /**
   * Register a route
   */
  register(route: Route): void {
    this.routes.push(route);
  }

  /**
   * Register 404 handler
   */
  setNotFoundHandler(handler: () => HTMLElement): void {
    this.notFoundHandler = handler;
  }

  /**
   * Navigate to a path
   */
  async navigate(path: string): Promise<void> {
    // Update browser history
    if (path !== this.currentPath) {
      window.history.pushState({}, '', path);
    }
    this.currentPath = path;

    // Match route
    const match = this.matchRoute(path);

    if (!match) {
      // No route found - render 404
      this.render404();
      return;
    }

    const { route, params } = match;

    // Check authentication
    if (route.requiresAuth) {
      const isAuthenticated = AuthService.isAuthenticated();
      if (!isAuthenticated) {
        // Redirect to login
        this.navigate('/login');
        return;
      }
    }

    // Check role-based access
    if (route.allowedRoles && route.allowedRoles.length > 0) {
      const user = AuthService.getStoredUser();
      if (!user || !route.allowedRoles.includes(user.role)) {
        // Redirect to appropriate page based on authentication
        if (AuthService.isAuthenticated()) {
          this.navigate('/');
        } else {
          this.navigate('/login');
        }
        return;
      }
    }

    // Render route
    try {
      const element = await route.handler(params);
      this.renderElement(element);
    } catch (error) {
      console.error('Error rendering route:', error);
      this.render404();
    }
  }

  /**
   * Match a path to a route
   */
  private matchRoute(path: string): { route: Route; params: RouteParams } | null {
    for (const route of this.routes) {
      const params = this.matchPath(route.path, path);
      if (params !== null) {
        return { route, params };
      }
    }
    return null;
  }

  /**
   * Match a path pattern to an actual path
   * Returns params if matched, null otherwise
   */
  private matchPath(pattern: string, path: string): RouteParams | null {
    // Exact match
    if (pattern === path) {
      return {};
    }

    // Pattern with params (e.g., /book/:organizerId)
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params: RouteParams = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(':')) {
        // This is a parameter
        const paramName = patternPart.slice(1);
        params[paramName] = pathPart;
      } else if (patternPart !== pathPart) {
        // Parts don't match
        return null;
      }
    }

    return params;
  }

  /**
   * Render an element to the root
   */
  private renderElement(element: HTMLElement): void {
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = '';
      root.appendChild(element);
    }
  }

  /**
   * Render 404 page
   */
  private render404(): void {
    if (this.notFoundHandler) {
      const element = this.notFoundHandler();
      this.renderElement(element);
    } else {
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = '<div style="padding: 2rem; text-align: center;"><h1>404 - Page Not Found</h1></div>';
      }
    }
  }

  /**
   * Initialize router - set up popstate listener
   */
  init(): void {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname);
    });

    // Handle link clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Check if clicked element or its parent is an anchor
      let anchor: HTMLAnchorElement | null = null;
      if (target.tagName === 'A') {
        anchor = target as HTMLAnchorElement;
      } else if (target.closest('a')) {
        anchor = target.closest('a');
      }

      if (anchor && anchor.href) {
        const url = new URL(anchor.href);

        // Only handle same-origin links
        if (url.origin === window.location.origin) {
          e.preventDefault();
          this.navigate(url.pathname);
        }
      }
    });

    // Navigate to current path
    this.navigate(window.location.pathname);
  }

  /**
   * Get current path
   */
  getCurrentPath(): string {
    return this.currentPath;
  }
}

// Export singleton instance
export const router = new Router();
