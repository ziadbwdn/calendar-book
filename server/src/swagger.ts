import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Calendar Booking System API',
      version: '1.0.0',
      description: 'API for managing organizer schedules and booking appointments',
      contact: {
        name: 'API Support',
        url: 'https://github.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://calendar-book-production.up.railway.app/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token obtained from /auth/login or /auth/register. Token expires in 24 hours.',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'email', 'fullName', 'role'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address (unique across system)',
              example: 'john@example.com',
            },
            fullName: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['organizer', 'invitee', 'guest'],
              description: 'User role - organizer manages availability, invitee/guest books meetings',
              example: 'organizer',
            },
            isVerified: {
              type: 'boolean',
              description: 'Whether user email is verified',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User account creation timestamp',
              example: '2025-11-15T10:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last user profile update timestamp',
              example: '2025-11-15T10:00:00.000Z',
            },
          },
        },
        WorkingHour: {
          type: 'object',
          required: ['day', 'start', 'end'],
          properties: {
            day: {
              type: 'number',
              minimum: 1,
              maximum: 7,
              description: 'Day of week: 1=Monday, 2=Tuesday, ..., 7=Sunday',
              example: 1,
            },
            start: {
              type: 'string',
              pattern: '^([0-1][0-9]|2[0-3]):([0-5][0-9])$',
              description: 'Working hours start time in HH:MM format (24-hour)',
              example: '09:00',
            },
            end: {
              type: 'string',
              pattern: '^([0-1][0-9]|2[0-3]):([0-5][0-9])$',
              description: 'Working hours end time in HH:MM format (24-hour). Must be after start time',
              example: '17:00',
            },
          },
        },
        OrganizerSettings: {
          type: 'object',
          required: ['id', 'timezone', 'workingHours', 'meetingDuration'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Settings unique identifier',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            timezone: {
              type: 'string',
              description: 'IANA timezone identifier for organizer (e.g., America/New_York, Europe/London, Asia/Tokyo)',
              example: 'America/New_York',
            },
            workingHours: {
              type: 'array',
              minItems: 1,
              maxItems: 7,
              description: 'List of working hour ranges for each day. Only include days organizer works',
              items: { $ref: '#/components/schemas/WorkingHour' },
            },
            meetingDuration: {
              type: 'number',
              minimum: 15,
              maximum: 480,
              description: 'Duration of each meeting in minutes (15-480)',
              example: 30,
            },
            bufferBefore: {
              type: 'number',
              minimum: 0,
              maximum: 240,
              description: 'Buffer time in minutes before each meeting (for setup/transition)',
              example: 0,
            },
            bufferAfter: {
              type: 'number',
              minimum: 0,
              maximum: 240,
              description: 'Buffer time in minutes after each meeting (for wrap-up)',
              example: 0,
            },
            minimumNotice: {
              type: 'number',
              minimum: 0,
              maximum: 720,
              description: 'Minimum hours notice required before booking (0-720 hours)',
              example: 24,
            },
            blackoutDates: {
              type: 'array',
              description: 'ISO 8601 dates when organizer is unavailable (e.g., holidays, vacation)',
              items: { type: 'string', format: 'date', example: '2025-12-25' },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Settings creation timestamp',
              example: '2025-11-15T10:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last settings update timestamp',
              example: '2025-11-15T14:30:00.000Z',
            },
          },
        },
        Booking: {
          type: 'object',
          required: ['id', 'organizerId', 'inviteeName', 'inviteeEmail', 'startTime', 'endTime', 'status'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Booking unique identifier',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            organizerId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of organizer who owns this booking slot',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            inviteeName: {
              type: 'string',
              description: 'Full name of person booking the meeting',
              example: 'Jane Smith',
            },
            inviteeEmail: {
              type: 'string',
              format: 'email',
              description: 'Email address of person booking the meeting',
              example: 'jane@example.com',
            },
            startTime: {
              type: 'string',
              format: 'date-time',
              description: 'Meeting start time in UTC ISO 8601 format',
              example: '2025-11-20T14:00:00.000Z',
            },
            endTime: {
              type: 'string',
              format: 'date-time',
              description: 'Meeting end time in UTC ISO 8601 format (automatically calculated from meeting duration)',
              example: '2025-11-20T14:30:00.000Z',
            },
            status: {
              type: 'string',
              enum: ['confirmed', 'cancelled'],
              description: 'Current booking status',
              example: 'confirmed',
            },
            version: {
              type: 'number',
              description: 'Version for optimistic locking (prevents concurrent modification conflicts)',
              example: 1,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Booking creation timestamp',
              example: '2025-11-15T10:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last booking update timestamp',
              example: '2025-11-15T10:30:00.000Z',
            },
          },
        },
        TimeSlot: {
          type: 'object',
          required: ['start', 'end'],
          properties: {
            start: {
              type: 'string',
              format: 'date-time',
              description: 'Slot start time in ISO 8601 format with timezone offset',
              example: '2025-11-20T14:00:00-05:00',
            },
            end: {
              type: 'string',
              format: 'date-time',
              description: 'Slot end time in ISO 8601 format with timezone offset',
              example: '2025-11-20T14:30:00-05:00',
            },
          },
        },
        PaginationMetadata: {
          type: 'object',
          required: ['page', 'limit', 'total', 'totalPages'],
          properties: {
            page: {
              type: 'number',
              description: 'Current page number (1-indexed)',
              example: 1,
            },
            limit: {
              type: 'number',
              description: 'Number of items per page',
              example: 20,
            },
            total: {
              type: 'number',
              description: 'Total number of items across all pages',
              example: 150,
            },
            totalPages: {
              type: 'number',
              description: 'Total number of pages',
              example: 8,
            },
            hasNextPage: {
              type: 'boolean',
              description: 'Whether there are more pages after current',
              example: true,
            },
            hasPrevPage: {
              type: 'boolean',
              description: 'Whether there are pages before current',
              example: false,
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message describing what went wrong',
              example: 'Email already registered',
            },
            errors: {
              type: 'object',
              description: 'Validation errors by field (for 400/422 responses)',
              example: { email: ['Email must be valid'], password: ['Password must be at least 6 characters'] },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    // In development: TypeScript source files
    './src/routes/*.ts',
    // In production: Compiled JavaScript files
    './dist/routes/*.js',
  ],
};

// Add manual paths for non-route endpoints
const baseSpec = swaggerJsdoc(options) as any;
const swaggerSpecWithPaths: any = {
  ...baseSpec,
  paths: {
    ...(baseSpec?.paths || {}),
    '/health': {
      get: {
        summary: 'Health check endpoint',
        tags: ['System'],
        description: 'Returns the health status of the API server',
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok',
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                      description: 'ISO 8601 timestamp of health check',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerSpecWithPaths;
