/**
 * LocalStorage management service
 */

import type { User } from '../types/auth';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

export class StorageService {
  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  static getCurrentUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  static removeCurrentUser(): void {
    localStorage.removeItem(USER_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  static logout(): void {
    this.removeToken();
    this.removeCurrentUser();
  }

  static clear(): void {
    localStorage.clear();
  }
}
