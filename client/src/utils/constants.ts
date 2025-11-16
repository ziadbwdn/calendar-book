// API Base URL - from environment variable or fallback to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Debug: Log API configuration on app start
if (typeof window !== 'undefined') {
  console.log('%c[API Configuration]', 'color: #0066cc; font-weight: bold', {
    'VITE_API_BASE_URL env': import.meta.env.VITE_API_BASE_URL || '(not set)',
    'Resolved API_BASE_URL': API_BASE_URL,
    'Environment': import.meta.env.MODE,
    'Build time': new Date().toISOString(),
  });
}

export const ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',

  // Organizer
  ORGANIZER_SETTINGS: '/organizer/settings',
  ORGANIZER_BOOKINGS: '/organizer/bookings',
  ORGANIZER_BOOKING: (id: string) => `/organizer/bookings/${id}`,

  // Public
  PUBLIC_SLOTS: (organizerId: string) => `/public/${organizerId}/slots`,
  PUBLIC_BOOK: (organizerId: string) => `/public/${organizerId}/book`,
};

export const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
];

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'current_user';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  ORGANIZER_DASHBOARD: '/dashboard',
  ORGANIZER_SETTINGS: '/dashboard/settings',
  ORGANIZER_BOOKINGS: '/dashboard/bookings',
  PUBLIC_BOOKING: '/book/:organizerId',
  NOT_FOUND: '/404',
};
