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
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            fullName: { type: 'string' },
            role: { type: 'string', enum: ['organizer', 'invitee', 'guest'] },
          },
        },
        OrganizerSettings: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            timezone: { type: 'string' },
            workingHours: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'number' },
                  start: { type: 'string' },
                  end: { type: 'string' },
                },
              },
            },
            meetingDuration: { type: 'number' },
            bufferBefore: { type: 'number' },
            bufferAfter: { type: 'number' },
            minimumNotice: { type: 'number' },
            blackoutDates: { type: 'array', items: { type: 'string' } },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            organizerId: { type: 'string', format: 'uuid' },
            inviteeName: { type: 'string' },
            inviteeEmail: { type: 'string' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['confirmed', 'cancelled'] },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: { type: 'array' },
            metadata: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                totalPages: { type: 'number' },
                hasNextPage: { type: 'boolean' },
                hasPrevPage: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
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
