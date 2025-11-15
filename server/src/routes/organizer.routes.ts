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
 *     summary: Get organizer settings
 *     tags: [Organizer]
 *     description: Retrieve organizer's availability settings (timezone, working hours, buffers)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizerSettings'
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Not an organizer
 */
router.get('/settings', controller.getSettings);

/**
 * @swagger
 * /organizer/settings:
 *   put:
 *     summary: Update organizer settings
 *     tags: [Organizer]
 *     description: Update availability settings (timezone, working hours, buffers, minimum notice)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timezone:
 *                 type: string
 *                 example: America/New_York
 *               workingHours:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: number
 *                       description: 0=Sunday, 1=Monday, ..., 6=Saturday
 *                     start:
 *                       type: string
 *                       format: time
 *                       example: "09:00"
 *                     end:
 *                       type: string
 *                       format: time
 *                       example: "17:00"
 *               meetingDuration:
 *                 type: number
 *                 description: Duration in minutes
 *                 example: 30
 *               bufferBefore:
 *                 type: number
 *                 description: Minutes before each meeting
 *                 example: 0
 *               bufferAfter:
 *                 type: number
 *                 description: Minutes after each meeting
 *                 example: 0
 *               minimumNotice:
 *                 type: number
 *                 description: Hours notice required before booking
 *                 example: 24
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizerSettings'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Not an organizer
 */
router.put('/settings', validateDto(UpdateSettingsDto), controller.updateSettings);

/**
 * @swagger
 * /organizer/bookings:
 *   get:
 *     summary: List bookings
 *     tags: [Organizer]
 *     description: Get list of bookings with pagination support
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (1-indexed)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [confirmed, cancelled]
 *           default: confirmed
 *         description: Filter by booking status
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 metadata:
 *                   $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Not an organizer
 */
router.get('/bookings', controller.getBookings);

/**
 * @swagger
 * /organizer/bookings/{id}:
 *   patch:
 *     summary: Update booking (reschedule or cancel)
 *     tags: [Organizer]
 *     description: Reschedule or cancel an existing booking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
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
 *               newStartTime:
 *                 type: string
 *                 format: date-time
 *                 description: Required if action is 'reschedule'
 *                 example: "2025-11-15T10:00:00Z"
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error or invalid action
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Not an organizer
 *       404:
 *         description: Booking not found
 */
router.patch('/bookings/:id', validateDto(UpdateBookingDto), controller.updateBooking);

export default router;
