/**
 * Main application controller
 * Initializes routes and manages app state
 */

import { router } from './router';
import { AuthService } from './services/auth.service';
import { createAuthPage } from './pages/auth-page';
import { createOrganizerDashboard } from './pages/organizer-dashboard';
import { createPublicBookingPage } from './pages/public-booking';
import { createNotFoundPage } from './pages/not-found';
import { createHomePage } from './pages/home-page';
import { createNavbar } from './components/navbar';
import { createSidebar } from './components/sidebar';

export class App {
  /**
   * Initialize the application
   */
  init(): void {
    // Register routes
    this.registerRoutes();

    // Set 404 handler
    router.setNotFoundHandler(() => createNotFoundPage());

    // Initialize router
    router.init();
  }

  /**
   * Register all application routes
   */
  private registerRoutes(): void {
    // Root path - redirect based on authentication
    router.register({
      path: '/',
      name: 'home',
      handler: () => {
        const isAuthenticated = AuthService.isAuthenticated();
        const user = AuthService.getStoredUser();

        if (isAuthenticated && user) {
          // Redirect based on role
          if (user.role === 'organizer') {
            router.navigate('/dashboard');
          } else {
            // For invitees, redirect to home page
            router.navigate('/home');
          }
        } else {
          // Not authenticated - redirect to login
          router.navigate('/login');
        }

        // Return empty element since we're redirecting
        const element = document.createElement('div');
        element.textContent = 'Redirecting...';
        return element;
      },
    });

    // Home page for invitees
    router.register({
      path: '/home',
      name: 'invitee-home',
      requiresAuth: true,
      handler: () => {
        const user = AuthService.getStoredUser();
        if (!user) {
          router.navigate('/login');
          const element = document.createElement('div');
          element.textContent = 'Redirecting...';
          return element;
        }

        // Create page with navbar
        const page = document.createElement('div');

        const navbar = createNavbar({
          user,
          onLogout: () => {
            router.navigate('/login');
          },
        });
        page.appendChild(navbar);

        const homePage = createHomePage(user);
        page.appendChild(homePage);

        return page;
      },
    });

    // Login page
    router.register({
      path: '/login',
      name: 'login',
      handler: () => {
        // If already authenticated, redirect to dashboard
        if (AuthService.isAuthenticated()) {
          const user = AuthService.getStoredUser();
          if (user?.role === 'organizer') {
            router.navigate('/dashboard');
          } else {
            router.navigate('/home');
          }

          const element = document.createElement('div');
          element.textContent = 'Redirecting...';
          return element;
        }

        return createAuthPage({
          mode: 'login',
          onSuccess: (role) => {
            if (role === 'organizer') {
              router.navigate('/dashboard');
            } else {
              router.navigate('/home');
            }
          },
        });
      },
    });

    // Register page
    router.register({
      path: '/register',
      name: 'register',
      handler: () => {
        // If already authenticated, redirect to dashboard
        if (AuthService.isAuthenticated()) {
          const user = AuthService.getStoredUser();
          if (user?.role === 'organizer') {
            router.navigate('/dashboard');
          } else {
            router.navigate('/home');
          }

          const element = document.createElement('div');
          element.textContent = 'Redirecting...';
          return element;
        }

        return createAuthPage({
          mode: 'register',
          onSuccess: (role) => {
            if (role === 'organizer') {
              router.navigate('/dashboard');
            } else {
              router.navigate('/home');
            }
          },
        });
      },
    });

    // Organizer dashboard
    router.register({
      path: '/dashboard',
      name: 'dashboard',
      requiresAuth: true,
      allowedRoles: ['organizer'],
      handler: () => {
        return this.createDashboardLayout('settings');
      },
    });

    // Organizer settings (same as dashboard for now)
    router.register({
      path: '/dashboard/settings',
      name: 'dashboard-settings',
      requiresAuth: true,
      allowedRoles: ['organizer'],
      handler: () => {
        return this.createDashboardLayout('settings');
      },
    });

    // Organizer bookings
    router.register({
      path: '/dashboard/bookings',
      name: 'dashboard-bookings',
      requiresAuth: true,
      allowedRoles: ['organizer'],
      handler: () => {
        return this.createDashboardLayout('bookings');
      },
    });

    // Organizer share link
    router.register({
      path: '/dashboard/share',
      name: 'dashboard-share',
      requiresAuth: true,
      allowedRoles: ['organizer'],
      handler: () => {
        return this.createDashboardLayout('share');
      },
    });

    // Public booking page (no auth required)
    router.register({
      path: '/book/:organizerId',
      name: 'public-booking',
      handler: (params) => {
        const { organizerId } = params;

        if (!organizerId) {
          return createNotFoundPage();
        }

        // Create simple layout with just navbar
        const page = document.createElement('div');

        // Navbar
        const navbar = createNavbar({
          user: AuthService.getStoredUser(),
          onLogout: () => {
            router.navigate('/login');
          },
        });
        page.appendChild(navbar);

        // Public booking page
        const bookingPage = createPublicBookingPage({ organizerId });
        page.appendChild(bookingPage);

        return page;
      },
    });
  }

  /**
   * Create dashboard layout with navbar and sidebar
   */
  private createDashboardLayout(tab: 'settings' | 'bookings' | 'share'): HTMLElement {
    const layout = document.createElement('div');
    layout.className = 'app-layout';

    // Sidebar
    const sidebar = createSidebar({
      links: [
        {
          label: 'Settings',
          href: '/dashboard/settings',
          active: tab === 'settings',
        },
        {
          label: 'Bookings',
          href: '/dashboard/bookings',
          active: tab === 'bookings',
        },
        {
          label: 'Share Link',
          href: '/dashboard/share',
          active: tab === 'share',
        },
      ],
      onNavigate: (href) => {
        router.navigate(href);
      },
    });
    layout.appendChild(sidebar);

    // Main content area
    const main = document.createElement('div');
    main.className = 'app-main';

    // Navbar
    const navbar = createNavbar({
      user: AuthService.getStoredUser(),
      onLogout: () => {
        router.navigate('/login');
      },
    });
    main.appendChild(navbar);

    // Content
    const content = document.createElement('div');
    content.className = 'app-content';

    // Dashboard
    const dashboard = createOrganizerDashboard({ initialTab: tab });
    content.appendChild(dashboard);

    main.appendChild(content);
    layout.appendChild(main);

    return layout;
  }
}
