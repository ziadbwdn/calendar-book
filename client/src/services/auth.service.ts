/**
 * Authentication service
 * Handles user registration, login, logout, and current user retrieval
 */

import { ApiClient } from './api';
import { StorageService } from './storage.service';
import { ENDPOINTS } from '../utils/constants';
import type {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../types/auth';

export class AuthService {
  /**
   * Register a new user
   * Stores token and user data in localStorage on success
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await ApiClient.post<AuthResponse>(
      ENDPOINTS.AUTH_REGISTER,
      data,
      false // No auth required for registration
    );

    // Store token and user
    StorageService.setToken(response.token);
    StorageService.setCurrentUser(response.user);

    return response;
  }

  /**
   * Login an existing user
   * Stores token and user data in localStorage on success
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await ApiClient.post<AuthResponse>(
      ENDPOINTS.AUTH_LOGIN,
      data,
      false // No auth required for login
    );

    // Store token and user
    StorageService.setToken(response.token);
    StorageService.setCurrentUser(response.user);

    return response;
  }

  /**
   * Get current authenticated user profile
   * Requires valid JWT token
   */
  static async getCurrentUser(): Promise<User> {
    const user = await ApiClient.get<User>(
      ENDPOINTS.AUTH_ME,
      undefined,
      true // Auth required
    );

    // Update stored user data
    StorageService.setCurrentUser(user);

    return user;
  }

  /**
   * Logout current user
   * Clears token and user data from localStorage
   */
  static logout(): void {
    StorageService.logout();
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return StorageService.isAuthenticated();
  }

  /**
   * Get stored user without API call
   */
  static getStoredUser(): User | null {
    return StorageService.getCurrentUser();
  }

  /**
   * Get stored token without API call
   */
  static getStoredToken(): string | null {
    return StorageService.getToken();
  }
}
