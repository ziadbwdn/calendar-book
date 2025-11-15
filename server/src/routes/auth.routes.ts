import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateDto } from '../middleware/validate';
import { RegisterDto, LoginDto } from '../dto/AuthDto';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const controller = new AuthController();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Authentication]
 *     description: |
 *       Creates a new user account. Role determines access level:
 *       - **organizer**: Can manage availability and view bookings
 *       - **invitee**: Can book meetings with organizers
 *       - **guest**: Can book meetings without account
 *
 *       Email must be unique across system. Password must be at least 6 characters.
 *       Token expires in 24 hours.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, fullName]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 minLength: 5
 *                 maxLength: 100
 *                 description: Must be unique across system
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 50
 *                 description: Will be hashed using bcrypt
 *                 example: SecurePass123!
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: John Doe
 *               role:
 *                 type: string
 *                 enum: [organizer, invitee, guest]
 *                 default: invitee
 *                 description: Account type (optional, defaults to invitee)
 *                 example: organizer
 *     responses:
 *       201:
 *         description: User created successfully. JWT token valid for 24 hours.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT Bearer token (include in Authorization header as "Bearer <token>")
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             example:
 *               user:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 email: "john.doe@example.com"
 *                 fullName: "John Doe"
 *                 role: "organizer"
 *                 isVerified: true
 *                 createdAt: "2025-11-15T10:00:00.000Z"
 *                 updatedAt: "2025-11-15T10:00:00.000Z"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAifQ..."
 *       400:
 *         description: Validation error (invalid email format, password too short, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Validation failed"
 *               errors:
 *                 email: ["Email must be valid", "Must be unique"]
 *                 password: ["Password must be at least 6 characters"]
 *       409:
 *         description: Email already registered in system
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Email already registered"
 *       500:
 *         description: Server error (database, hashing failure)
 */
router.post('/register', validateDto(RegisterDto), controller.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and obtain JWT token
 *     tags: [Authentication]
 *     description: |
 *       Authenticates user with email and password. Returns JWT token valid for 24 hours.
 *
 *       **Important**: Always include token in subsequent requests:
 *       ```
 *       Authorization: Bearer <token>
 *       ```
 *
 *       Use this token until it expires or login again.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Registered email address
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 description: Account password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful. Token valid for 24 hours.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT Bearer token for authenticated requests
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             example:
 *               user:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 email: "john.doe@example.com"
 *                 fullName: "John Doe"
 *                 role: "organizer"
 *                 isVerified: true
 *                 createdAt: "2025-11-15T10:00:00.000Z"
 *                 updatedAt: "2025-11-15T10:00:00.000Z"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3MzE2NTMyMDAsImV4cCI6MTczMTczOTYwMH0..."
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Invalid email or password"
 *       400:
 *         description: Validation error (missing fields, invalid format)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Validation failed"
 *               errors:
 *                 email: ["Email is required"]
 *                 password: ["Password is required"]
 */
router.post('/login', validateDto(LoginDto), controller.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Authentication]
 *     description: |
 *       Returns profile information of the currently authenticated user.
 *       Requires valid JWT token in Authorization header.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: "550e8400-e29b-41d4-a716-446655440000"
 *               email: "john.doe@example.com"
 *               fullName: "John Doe"
 *               role: "organizer"
 *               isVerified: true
 *               createdAt: "2025-11-15T10:00:00.000Z"
 *               updatedAt: "2025-11-15T10:00:00.000Z"
 *       401:
 *         description: Missing, invalid, or expired authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Missing authorization header"
 *       403:
 *         description: Token is valid but user account has been deleted/disabled
 */
router.get('/me', authMiddleware, controller.me);

export default router;
