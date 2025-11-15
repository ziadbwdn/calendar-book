import { Router } from 'express';
import { OrganizerController } from '../controllers/organizer.controller';
import { validateDto } from '../middleware/validate';
import { UpdateSettingsDto, UpdateBookingDto } from '../dto';
import { authMiddleware } from '../middleware/auth';
import { isOrganizer } from '../middleware/rbac';

const router = Router();
const controller = new OrganizerController();

router.use(authMiddleware);
router.use(isOrganizer);

/**
 * @swagger
 * /organizer/settings:
 *   get:
 *     summary: Get current availability settings
 *     tags: [Organizer]
 *     description: |
 *       Retrieves the organizer's current availability configuration including:
 *       - Timezone for slot calculation
 *       - Working hours (days and time ranges)
 *       - Meeting duration
 *       - Buffer times before/after meetings
 *       - Minimum notice period required for bookings
 *       - Blackout dates (holidays, vacation, etc.)
 *
 *       **Use case:** Display current settings in dashboard or before updating.
 *
 *       **Authentication:** Requires organizer role JWT token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizerSettings'
 *             example:
 *               id: "550e8400-e29b-41d4-a716-446655440000"
 *               timezone: "America/New_York"
 *               workingHours:
 *                 - day: 1
 *                   start: "09:00"
 *                   end: "17:00"
 *                 - day: 2
 *                   start: "09:00"
 *                   end: "17:00"
 *                 - day: 3
 *                   start: "09:00"
 *                   end: "17:00"
 *                 - day: 4
 *                   start: "09:00"
 *                   end: "17:00"
 *                 - day: 5
 *                   start: "09:00"
 *                   end: "12:00"
 *               meetingDuration: 30
 *               bufferBefore: 5
 *               bufferAfter: 10
 *               minimumNotice: 24
 *               blackoutDates:
 *                 - "2025-12-25"
 *                 - "2025-12-26"
 *               createdAt: "2025-11-15T10:00:00.000Z"
 *               updatedAt: "2025-11-15T14:30:00.000Z"
 *       401:
 *         description: Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Missing authorization header"
 *       403:
 *         description: User is not an organizer (role check failed)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Access denied. Organizer role required."
 *       404:
 *         description: Organizer has not configured settings yet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Settings not found. Please configure your availability first."
 */
router.get('/settings', controller.getSettings);

/**
 * @swagger
 * /organizer/settings:
 *   put:
 *     summary: Update availability settings
 *     tags: [Organizer]
 *     description: |
 *       Updates organizer's availability configuration. All fields are validated:
 *
 *       **Validation rules:**
 *       - Timezone must be valid IANA identifier
 *       - Working hours: start < end, day between 1-7
 *       - Meeting duration: 15-480 minutes
 *       - Buffer times: 0-240 minutes each
 *       - Minimum notice: 0-720 hours
 *       - Blackout dates: valid ISO 8601 dates
 *
 *       **Use case:** Configure when you're available for bookings.
 *
 *       **Important:** Changes affect future bookings only. Existing bookings unchanged.
 *
 *       **Authentication:** Requires organizer role JWT token.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [timezone, workingHours, meetingDuration]
 *             properties:
 *               timezone:
 *                 type: string
 *                 description: IANA timezone identifier
 *                 example: America/New_York
 *               workingHours:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 7
 *                 description: Working hours for each day you're available
 *                 items:
 *                   type: object
 *                   required: [day, start, end]
 *                   properties:
 *                     day:
 *                       type: number
 *                       minimum: 1
 *                       maximum: 7
 *                       description: 1=Monday, 2=Tuesday, ..., 7=Sunday
 *                       example: 1
 *                     start:
 *                       type: string
 *                       pattern: '^([0-1][0-9]|2[0-3]):([0-5][0-9])$'
 *                       description: Start time in HH:MM 24-hour format
 *                       example: "09:00"
 *                     end:
 *                       type: string
 *                       pattern: '^([0-1][0-9]|2[0-3]):([0-5][0-9])$'
 *                       description: End time in HH:MM 24-hour format (must be after start)
 *                       example: "17:00"
 *               meetingDuration:
 *                 type: number
 *                 minimum: 15
 *                 maximum: 480
 *                 description: Meeting duration in minutes (15-480)
 *                 example: 30
 *               bufferBefore:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 240
 *                 description: Buffer time before meetings in minutes (0-240)
 *                 example: 5
 *               bufferAfter:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 240
 *                 description: Buffer time after meetings in minutes (0-240)
 *                 example: 10
 *               minimumNotice:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 720
 *                 description: Minimum hours notice required (0-720)
 *                 example: 24
 *               blackoutDates:
 *                 type: array
 *                 description: Dates you're unavailable (ISO 8601 format)
 *                 items:
 *                   type: string
 *                   format: date
 *                   example: "2025-12-25"
 *           example:
 *             timezone: "America/New_York"
 *             workingHours:
 *               - day: 1
 *                 start: "09:00"
 *                 end: "17:00"
 *               - day: 2
 *                 start: "09:00"
 *                 end: "17:00"
 *               - day: 3
 *                 start: "09:00"
 *                 end: "17:00"
 *               - day: 4
 *                 start: "09:00"
 *                 end: "17:00"
 *               - day: 5
 *                 start: "09:00"
 *                 end: "12:00"
 *             meetingDuration: 30
 *             bufferBefore: 5
 *             bufferAfter: 10
 *             minimumNotice: 24
 *             blackoutDates:
 *               - "2025-12-25"
 *               - "2025-12-26"
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizerSettings'
 *             example:
 *               id: "550e8400-e29b-41d4-a716-446655440000"
 *               timezone: "America/New_York"
 *               workingHours:
 *                 - day: 1
 *                   start: "09:00"
 *                   end: "17:00"
 *                 - day: 2
 *                   start: "09:00"
 *                   end: "17:00"
 *               meetingDuration: 30
 *               bufferBefore: 5
 *               bufferAfter: 10
 *               minimumNotice: 24
 *               blackoutDates:
 *                 - "2025-12-25"
 *               createdAt: "2025-11-15T10:00:00.000Z"
 *               updatedAt: "2025-11-16T09:45:00.000Z"
 *       400:
 *         description: Validation error (invalid timezone, times, or constraints)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_timezone:
 *                 summary: Invalid timezone
 *                 value:
 *                   error: "Validation failed"
 *                   errors:
 *                     timezone: ["Invalid timezone identifier"]
 *               invalid_hours:
 *                 summary: Invalid working hours
 *                 value:
 *                   error: "Validation failed"
 *                   errors:
 *                     workingHours: ["Start time must be before end time"]
 *               invalid_duration:
 *                 summary: Duration out of range
 *                 value:
 *                   error: "Validation failed"
 *                   errors:
 *                     meetingDuration: ["Must be between 15 and 480 minutes"]
 *       401:
 *         description: Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Missing authorization header"
 *       403:
 *         description: User is not an organizer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Access denied. Organizer role required."
 */
router.put('/settings', validateDto(UpdateSettingsDto), controller.updateSettings);

/**
 * @swagger
 * /organizer/bookings:
 *   get:
 *     summary: List all bookings with pagination
 *     tags: [Organizer]
 *     description: |
 *       Retrieves paginated list of bookings for the authenticated organizer.
 *
 *       **Features:**
 *       - Pagination support (page/limit)
 *       - Filter by status (confirmed/cancelled)
 *       - Sorted by start time (newest first)
 *       - Includes invitee details (name, email)
 *       - Shows booking version for optimistic locking
 *
 *       **Use cases:**
 *       - Dashboard: Display upcoming meetings
 *       - History: Review past/cancelled bookings
 *       - Export: Get booking data for reporting
 *
 *       **Pagination:**
 *       - Default: 20 items per page
 *       - Max: 100 items per page
 *       - Page is 1-indexed (first page = 1)
 *
 *       **Authentication:** Requires organizer role JWT token.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-indexed)
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page (max 100)
 *         example: 20
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [confirmed, cancelled]
 *           default: confirmed
 *         description: Filter by booking status
 *         example: confirmed
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully with pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [data, metadata]
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 metadata:
 *                   $ref: '#/components/schemas/PaginationMetadata'
 *             example:
 *               data:
 *                 - id: "a7c3e8d0-f4b1-44e2-9f5a-1b2c3d4e5f6g"
 *                   organizerId: "550e8400-e29b-41d4-a716-446655440000"
 *                   inviteeName: "Jane Smith"
 *                   inviteeEmail: "jane.smith@example.com"
 *                   startTime: "2025-11-20T14:00:00.000Z"
 *                   endTime: "2025-11-20T14:30:00.000Z"
 *                   status: "confirmed"
 *                   version: 1
 *                   createdAt: "2025-11-15T10:30:00.000Z"
 *                   updatedAt: "2025-11-15T10:30:00.000Z"
 *                 - id: "b8d4f9e1-g5c2-55f3-0g6b-2c3d4e5f6g7h"
 *                   organizerId: "550e8400-e29b-41d4-a716-446655440000"
 *                   inviteeName: "Bob Johnson"
 *                   inviteeEmail: "bob@example.com"
 *                   startTime: "2025-11-21T10:00:00.000Z"
 *                   endTime: "2025-11-21T10:30:00.000Z"
 *                   status: "confirmed"
 *                   version: 1
 *                   createdAt: "2025-11-16T08:15:00.000Z"
 *                   updatedAt: "2025-11-16T08:15:00.000Z"
 *               metadata:
 *                 page: 1
 *                 limit: 20
 *                 total: 45
 *                 totalPages: 3
 *                 hasNextPage: true
 *                 hasPrevPage: false
 *       400:
 *         description: Invalid pagination parameters (page < 1, limit > 100, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Validation failed"
 *               errors:
 *                 limit: ["Must be between 1 and 100"]
 *       401:
 *         description: Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Missing authorization header"
 *       403:
 *         description: User is not an organizer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Access denied. Organizer role required."
 */
router.get('/bookings', controller.getBookings);

/**
 * @swagger
 * /organizer/bookings/{id}:
 *   patch:
 *     summary: Reschedule or cancel a booking
 *     tags: [Organizer]
 *     description: |
 *       Updates an existing booking. Supports two actions: reschedule or cancel.
 *
 *       **Reschedule:**
 *       - Moves booking to new time
 *       - newStartTime must be provided
 *       - Same validation as creating new booking (working hours, minimum notice, etc.)
 *       - New time must not conflict with other bookings
 *       - Version incremented for optimistic locking
 *
 *       **Cancel:**
 *       - Changes booking status to 'cancelled'
 *       - Does not delete the booking (history preserved)
 *       - Cannot be reversed (create new booking instead)
 *
 *       **Validation checks (for reschedule):**
 *       - New time is in the future
 *       - Within organizer's working hours
 *       - Respects minimum notice period
 *       - Not within blackout dates
 *       - No conflicts with other bookings
 *
 *       **Optimistic locking:** Uses version field to prevent concurrent modifications.
 *
 *       **Authentication:** Requires organizer role JWT token.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique booking ID
 *         example: "a7c3e8d0-f4b1-44e2-9f5a-1b2c3d4e5f6g"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [reschedule, cancel]
 *                 description: Action to perform on booking
 *                 example: reschedule
 *               newStartTime:
 *                 type: string
 *                 format: date-time
 *                 description: |
 *                   Required if action is 'reschedule'.
 *                   New start time in ISO 8601 UTC format.
 *                   Must meet all availability constraints.
 *                 example: "2025-11-22T15:00:00Z"
 *           examples:
 *             reschedule:
 *               summary: Reschedule to new time
 *               value:
 *                 action: reschedule
 *                 newStartTime: "2025-11-22T15:00:00Z"
 *             cancel:
 *               summary: Cancel booking
 *               value:
 *                 action: cancel
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *             examples:
 *               rescheduled:
 *                 summary: Booking rescheduled
 *                 value:
 *                   id: "a7c3e8d0-f4b1-44e2-9f5a-1b2c3d4e5f6g"
 *                   organizerId: "550e8400-e29b-41d4-a716-446655440000"
 *                   inviteeName: "Jane Smith"
 *                   inviteeEmail: "jane.smith@example.com"
 *                   startTime: "2025-11-22T15:00:00.000Z"
 *                   endTime: "2025-11-22T15:30:00.000Z"
 *                   status: "confirmed"
 *                   version: 2
 *                   createdAt: "2025-11-15T10:30:00.000Z"
 *                   updatedAt: "2025-11-16T11:20:00.000Z"
 *               cancelled:
 *                 summary: Booking cancelled
 *                 value:
 *                   id: "a7c3e8d0-f4b1-44e2-9f5a-1b2c3d4e5f6g"
 *                   organizerId: "550e8400-e29b-41d4-a716-446655440000"
 *                   inviteeName: "Jane Smith"
 *                   inviteeEmail: "jane.smith@example.com"
 *                   startTime: "2025-11-20T14:00:00.000Z"
 *                   endTime: "2025-11-20T14:30:00.000Z"
 *                   status: "cancelled"
 *                   version: 2
 *                   createdAt: "2025-11-15T10:30:00.000Z"
 *                   updatedAt: "2025-11-16T11:25:00.000Z"
 *       400:
 *         description: Validation error or business logic violation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_time:
 *                 summary: Missing newStartTime for reschedule
 *                 value:
 *                   error: "newStartTime is required when action is reschedule"
 *               outside_hours:
 *                 summary: New time outside working hours
 *                 value:
 *                   error: "Requested time is outside organizer's working hours"
 *               insufficient_notice:
 *                 summary: New time too soon
 *                 value:
 *                   error: "Booking requires 24 hours minimum notice"
 *       401:
 *         description: Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Missing authorization header"
 *       403:
 *         description: User is not an organizer or not owner of this booking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Access denied. You can only modify your own bookings."
 *       404:
 *         description: Booking not found or already deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Booking not found"
 *       409:
 *         description: Conflict - concurrent modification or slot already booked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               version_conflict:
 *                 summary: Concurrent modification detected
 *                 value:
 *                   error: "Booking was modified by another request. Please refresh and try again."
 *               slot_conflict:
 *                 summary: New time slot already booked
 *                 value:
 *                   error: "New time slot conflicts with another booking"
 */
router.patch('/bookings/:id', validateDto(UpdateBookingDto), controller.updateBooking);

export default router;
