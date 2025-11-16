/**
 * Base HTTP client for API requests
 * Handles JWT token injection, error handling, and JSON parsing
 */

import { API_BASE_URL } from '../utils/constants';
import { StorageService } from './storage.service';

export class ApiError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export class ApiClient {
  private static baseURL = API_BASE_URL;

  /**
   * Build request headers with JWT token if available
   */
  private static getHeaders(includeAuth = true): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (includeAuth) {
      const token = StorageService.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  /**
   * Handle API response and errors
   */
  private static async handleResponse<T>(response: Response): Promise<T> {
    // Handle success responses (2xx)
    if (response.ok) {
      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }
      return response.json() as Promise<T>;
    }

    // Handle error responses
    let errorMessage = 'An error occurred';
    let errorData: any = null;

    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If response body is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }

    // Handle specific error codes
    switch (response.status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        StorageService.logout();
        window.location.href = '/login';
        throw new ApiError(401, 'Unauthorized. Please login again.');

      case 403:
        throw new ApiError(403, 'Access denied. You do not have permission.');

      case 404:
        throw new ApiError(404, errorMessage || 'Resource not found.');

      case 409:
        // Conflict - e.g., slot already booked, duplicate email
        throw new ApiError(409, errorMessage, errorData?.errors);

      case 400:
        // Bad Request - validation errors
        throw new ApiError(400, errorMessage, errorData?.errors);

      case 422:
        // Unprocessable Entity - validation errors
        throw new ApiError(422, errorMessage, errorData?.errors);

      case 500:
      case 502:
      case 503:
      case 504:
        throw new ApiError(
          response.status,
          'Server error. Please try again later.'
        );

      default:
        throw new ApiError(response.status, errorMessage);
    }
  }

  /**
   * GET request
   */
  static async get<T>(
    endpoint: string,
    params?: Record<string, string | number>,
    includeAuth = true
  ): Promise<T> {
    let url = `${this.baseURL}${endpoint}`;

    // Add query parameters if provided
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      ).toString();
      url += `?${queryString}`;
    }

    console.log(`[API GET] ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(includeAuth),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Network error. Please check your connection.');
    }
  }

  /**
   * POST request
   */
  static async post<T>(
    endpoint: string,
    data?: any,
    includeAuth = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    console.log(`[API POST] ${url}`, data);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(includeAuth),
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Network error. Please check your connection.');
    }
  }

  /**
   * PUT request
   */
  static async put<T>(
    endpoint: string,
    data?: any,
    includeAuth = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(includeAuth),
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Network error. Please check your connection.');
    }
  }

  /**
   * PATCH request
   */
  static async patch<T>(
    endpoint: string,
    data?: any,
    includeAuth = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(includeAuth),
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Network error. Please check your connection.');
    }
  }

  /**
   * DELETE request
   */
  static async delete<T>(
    endpoint: string,
    includeAuth = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(includeAuth),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Network error. Please check your connection.');
    }
  }
}
