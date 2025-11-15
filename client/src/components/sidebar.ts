/**
 * Sidebar component
 * Displays left sidebar navigation for organizer dashboard
 */

export interface SidebarLink {
  label: string;
  href: string;
  active?: boolean;
}

export interface SidebarOptions {
  links: SidebarLink[];
  onNavigate?: (href: string) => void;
}

/**
 * Create sidebar element
 */
export function createSidebar(options: SidebarOptions): HTMLElement {
  const { links, onNavigate } = options;

  const sidebar = document.createElement('aside');
  sidebar.className = 'app-sidebar';

  // Sidebar header
  const header = document.createElement('div');
  header.style.padding = '1.5rem';
  header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
  header.innerHTML = `
    <h3 style="margin: 0; color: white; font-size: 1.25rem;">Dashboard</h3>
  `;

  // Navigation list
  const nav = document.createElement('nav');
  const navList = document.createElement('ul');
  navList.className = 'sidebar-nav';

  links.forEach((link) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.label;

    if (link.active) {
      a.classList.add('active');
    }

    a.onclick = (e) => {
      e.preventDefault();
      if (onNavigate) {
        onNavigate(link.href);
      }
    };

    li.appendChild(a);
    navList.appendChild(li);
  });

  nav.appendChild(navList);

  sidebar.appendChild(header);
  sidebar.appendChild(nav);

  return sidebar;
}

/**
 * Update sidebar active link
 */
export function updateSidebarActiveLink(sidebar: HTMLElement, activeHref: string): void {
  const links = sidebar.querySelectorAll('.sidebar-nav a');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === activeHref) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
