import { Router } from 'express';
import { PublicController } from '../controllers/public.controller';
import { validateDto } from '../middleware/validate';
import { CreateBookingDto } from '../dto';
import { optionalAuthMiddleware } from '../middleware/auth';
import { isInviteeOrGuest } from '../middleware/rbac';

const router = Router();
const controller = new PublicController();

router.use(optionalAuthMiddleware);
router.use(isInviteeOrGuest);

/**
 * @swagger
 * /public/{organizerId}/slots:
 *   get:
 *     summary: Get available booking slots for organizer
 *     tags: [Public Booking]
 *     description: |
 *       Retrieves all available time slots for an organizer over the next 14 days.
 *
 *       **How it works:**
 *       1. Returns organizer's working hours for each day
 *       2. Excludes organizer's blackout dates
 *       3. Respects minimum notice period (e.g., can't book if < 24 hours away)
 *       4. Calculates slots based on meeting duration
 *       5. Excludes already booked slots
 *       6. Respects buffer times before/after meetings
 *
 *       **Timezone handling:**
 *       - All times returned in requested timezone with offset
 *       - Default is UTC if not specified
 *       - Use IANA timezone identifiers (e.g., America/New_York, Europe/London, Asia/Tokyo)
 *
 *       **Example workflow:**
 *       1. Call this endpoint to get available slots
 *       2. User selects a slot
 *       3. POST to /public/{organizerId}/book with selected startTime
 *     parameters:
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique organizer ID
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *       - in: query
 *         name: timezone
 *         required: false
 *         schema:
 *           type: string
 *           default: UTC
 *         description: |
 *           IANA timezone for slot times (e.g., America/New_York, Europe/London, Asia/Tokyo).
 *           If not provided, defaults to UTC.
 *         example: America/New_York
 *     responses:
 *       200:
 *         description: |
 *           Available slots successfully retrieved.
 *           Each slot respects organizer's working hours, meeting duration, and buffers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 slots:
 *                   type: array
 *                   description: Available time slots for next 14 days
 *                   items:
 *                     $ref: '#/components/schemas/TimeSlot'
 *             example:
 *               slots:
 *                 - start: "2025-11-20T14:00:00-05:00"
 *                   end: "2025-11-20T14:30:00-05:00"
 *                 - start: "2025-11-20T15:00:00-05:00"
 *                   end: "2025-11-20T15:30:00-05:00"
 *                 - start: "2025-11-21T09:00:00-05:00"
 *                   end: "2025-11-21T09:30:00-05:00"
 *       404:
 *         description: Organizer not found or has no availability settings configured
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Organizer not found or has no availability settings"
 *       400:
 *         description: Invalid timezone identifier or malformed request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Invalid timezone: InvalidZone/BadFormat"
 */
router.get('/:organizerId/slots', controller.getAvailableSlots);

/**
 * @swagger
 * /public/{organizerId}/book:
 *   post:
 *     summary: Create a new booking
 *     tags: [Public Booking]
 *     description: |
 *       Creates a new meeting booking with an organizer.
 *
 *       **Pre-requisites:**
 *       - Call /public/{organizerId}/slots first to get available slots
 *       - Select a slot returned from that endpoint
 *       - Use the startTime from the selected slot for this request
 *
 *       **Validation checks:**
 *       - Email format is valid
 *       - Full name is not empty
 *       - Start time is in the future
 *       - Start time is within organizer's working hours
 *       - Start time respects minimum notice period
 *       - Start time is not within a blackout date
 *       - Slot is not already booked (concurrent booking prevention)
 *       - Respects buffer times before/after meetings
 *
 *       **Important timezone notes:**
 *       - startTime must be ISO 8601 UTC format (e.g., 2025-11-20T14:00:00Z or 2025-11-20T14:00:00+00:00)
 *       - timezone field is the invitee's local timezone (for email/confirmation display)
 *       - Server converts times between UTC and organizer's timezone internally
 *
 *       **After booking:**
 *       - Booking is immediately confirmed (no approval step)
 *       - Invitee receives confirmation details
 *       - Returns booking details including confirmation ID
 *     parameters:
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique organizer ID (from booking link)
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [inviteeName, inviteeEmail, startTime, timezone]
 *             properties:
 *               inviteeName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Full name of person booking the meeting
 *                 example: Jane Smith
 *               inviteeEmail:
 *                 type: string
 *                 format: email
 *                 minLength: 5
 *                 maxLength: 100
 *                 description: Email address for booking confirmation
 *                 example: jane.smith@example.com
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: |
 *                   Meeting start time in ISO 8601 UTC format.
 *                   Must match a slot from /public/{organizerId}/slots endpoint.
 *                   Must be in future, within working hours, and respect minimum notice.
 *                 example: "2025-11-20T14:00:00Z"
 *               timezone:
 *                 type: string
 *                 description: |
 *                   Invitee's local timezone (IANA identifier).
 *                   Used for confirmation email and display purposes.
 *                 example: America/New_York
 *     responses:
 *       201:
 *         description: |
 *           Booking created and confirmed successfully.
 *           Confirmation details have been saved. Email sent to invitee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *             example:
 *               id: "a7c3e8d0-f4b1-44e2-9f5a-1b2c3d4e5f6g"
 *               organizerId: "550e8400-e29b-41d4-a716-446655440000"
 *               inviteeName: "Jane Smith"
 *               inviteeEmail: "jane.smith@example.com"
 *               startTime: "2025-11-20T14:00:00.000Z"
 *               endTime: "2025-11-20T14:30:00.000Z"
 *               status: "confirmed"
 *               version: 1
 *               createdAt: "2025-11-15T10:30:00.000Z"
 *               updatedAt: "2025-11-15T10:30:00.000Z"
 *       400:
 *         description: Validation error - invalid data or business logic violation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_email:
 *                 summary: Invalid email format
 *                 value:
 *                   error: "Validation failed"
 *                   errors:
 *                     inviteeEmail: ["Email must be valid"]
 *               outside_hours:
 *                 summary: Time outside working hours
 *                 value:
 *                   error: "Requested time is outside organizer's working hours"
 *               insufficient_notice:
 *                 summary: Insufficient notice (too soon)
 *                 value:
 *                   error: "Booking requires 24 hours minimum notice"
 *               blackout_date:
 *                 summary: Organizer unavailable (blackout date)
 *                 value:
 *                   error: "Organizer is unavailable on this date"
 *       409:
 *         description: |
 *           Conflict - slot already booked by another user or concurrent booking attempt.
 *           This can happen if two people try to book the same slot simultaneously.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Slot already booked"
 *       404:
 *         description: Organizer not found or has no availability settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Organizer not found"
 *       422:
 *         description: Unprocessable entity - semantic error (e.g., startTime format wrong)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Validation failed"
 *               errors:
 *                 startTime: ["Must be valid ISO 8601 datetime"]
 */
router.post('/:organizerId/book', validateDto(CreateBookingDto), controller.createBooking);

export default router;
