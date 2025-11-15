/**
 * Organizer service
 * Handles organizer-specific operations: settings and bookings management
 */

import { ApiClient } from './api';
import { ENDPOINTS } from '../utils/constants';
import type {
  OrganizerSettings,
  UpdateSettingsRequest,
} from '../types/organizer';
import type {
  Booking,
  GetBookingsResponse,
  RescheduleBookingRequest,
  CancelBookingRequest,
} from '../types/booking';

export class OrganizerService {
  /**
   * Get organizer settings
   * Requires authentication
   */
  static async getSettings(): Promise<OrganizerSettings> {
    return ApiClient.get<OrganizerSettings>(
      ENDPOINTS.ORGANIZER_SETTINGS,
      undefined,
      true
    );
  }

  /**
   * Update organizer settings
   * Requires authentication
   */
  static async updateSettings(
    data: UpdateSettingsRequest
  ): Promise<OrganizerSettings> {
    return ApiClient.put<OrganizerSettings>(
      ENDPOINTS.ORGANIZER_SETTINGS,
      data,
      true
    );
  }

  /**
   * Get organizer bookings with pagination
   * Requires authentication
   */
  static async getBookings(
    page: number = 1,
    limit: number = 20
  ): Promise<GetBookingsResponse> {
    return ApiClient.get<GetBookingsResponse>(
      ENDPOINTS.ORGANIZER_BOOKINGS,
      { page, limit },
      true
    );
  }

  /**
   * Reschedule a booking
   * Requires authentication
   */
  static async rescheduleBooking(
    bookingId: string,
    newStartTime: string
  ): Promise<Booking> {
    const data: RescheduleBookingRequest = {
      action: 'reschedule',
      newStartTime,
    };

    return ApiClient.patch<Booking>(
      ENDPOINTS.ORGANIZER_BOOKING(bookingId),
      data,
      true
    );
  }

  /**
   * Cancel a booking
   * Requires authentication
   */
  static async cancelBooking(bookingId: string): Promise<Booking> {
    const data: CancelBookingRequest = {
      action: 'cancel',
    };

    return ApiClient.patch<Booking>(
      ENDPOINTS.ORGANIZER_BOOKING(bookingId),
      data,
      true
    );
  }
}
