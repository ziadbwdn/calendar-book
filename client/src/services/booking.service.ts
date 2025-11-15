/**
 * Booking service
 * Handles public booking operations: available slots and booking creation
 */

import { ApiClient } from './api';
import { ENDPOINTS } from '../utils/constants';
import type {
  Booking,
  GetSlotsResponse,
  CreateBookingRequest,
} from '../types/booking';

export class BookingService {
  /**
   * Get available time slots for an organizer
   * Public endpoint - no authentication required
   */
  static async getAvailableSlots(
    organizerId: string,
    timezone: string
  ): Promise<GetSlotsResponse> {
    return ApiClient.get<GetSlotsResponse>(
      ENDPOINTS.PUBLIC_SLOTS(organizerId),
      { timezone },
      false // No auth required
    );
  }

  /**
   * Create a new booking
   * Public endpoint - no authentication required
   */
  static async createBooking(
    organizerId: string,
    data: CreateBookingRequest
  ): Promise<Booking> {
    return ApiClient.post<Booking>(
      ENDPOINTS.PUBLIC_BOOK(organizerId),
      data,
      false // No auth required
    );
  }
}
