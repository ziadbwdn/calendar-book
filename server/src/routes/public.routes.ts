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
 *     summary: Get available booking slots
 *     tags: [Public Booking]
 *     description: Retrieve available time slots for an organizer over a 14-day period
 *     parameters:
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Organizer's ID
 *       - in: query
 *         name: timezone
 *         schema:
 *           type: string
 *           default: UTC
 *           example: America/New_York
 *         description: Timezone for slot display (IANA timezone identifier)
 *     responses:
 *       200:
 *         description: Available slots retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 slots:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date-time
 *                         description: Slot start time in ISO 8601 format
 *                       end:
 *                         type: string
 *                         format: date-time
 *                         description: Slot end time in ISO 8601 format
 *       404:
 *         description: Organizer settings not found
 *       400:
 *         description: Invalid timezone or parameters
 */
router.get('/:organizerId/slots', controller.getAvailableSlots);

/**
 * @swagger
 * /public/{organizerId}/book:
 *   post:
 *     summary: Create a booking
 *     tags: [Public Booking]
 *     description: Create a new booking for an available time slot
 *     parameters:
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Organizer's ID
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
 *                 description: Full name of the person being invited
 *                 example: John Doe
 *               inviteeEmail:
 *                 type: string
 *                 format: email
 *                 description: Email address of the invitee
 *                 example: john@example.com
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Requested start time in ISO 8601 format (UTC)
 *                 example: "2025-11-15T14:00:00Z"
 *               timezone:
 *                 type: string
 *                 description: Invitee's timezone (IANA timezone identifier)
 *                 example: America/New_York
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error (invalid time, outside working hours, etc.)
 *       409:
 *         description: Slot conflicts with existing booking
 *       404:
 *         description: Organizer settings not found
 */
router.post('/:organizerId/book', validateDto(CreateBookingDto), controller.createBooking);

export default router;
