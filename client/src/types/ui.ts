export interface AppState {
  currentRoute: string;
  isAuthenticated: boolean;
  currentUser: any | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

export type PageName = 'login' | 'register' | 'organizer-dashboard' | 'public-booking' | 'not-found';
