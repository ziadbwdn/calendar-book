export interface Booking {
  id: string;
  organizerId: string;
  inviteeName: string;
  inviteeEmail: string;
  startTime: string; // ISO 8601 UTC
  endTime: string;
  status: 'confirmed' | 'cancelled';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  start: string; // ISO 8601 with timezone
  end: string;
}

export interface GetSlotsResponse {
  slots: TimeSlot[];
}

export interface CreateBookingRequest {
  startTime: string; // ISO 8601 with timezone
  inviteeName: string;
  inviteeEmail: string;
  timezone: string;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetBookingsResponse {
  data: Booking[];
  metadata: PaginationMetadata;
}

export interface RescheduleBookingRequest {
  action: 'reschedule';
  newStartTime: string; // ISO 8601 with timezone
}

export interface CancelBookingRequest {
  action: 'cancel';
}

export type UpdateBookingRequest = RescheduleBookingRequest | CancelBookingRequest;
