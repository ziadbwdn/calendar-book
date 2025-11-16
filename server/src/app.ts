import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { swaggerSpec } from './swagger';

export const createApp = () => {
  const app = express();

  // CORS configuration with environment-based origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()).filter(Boolean) || [];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In development with no ALLOWED_ORIGINS set, allow all origins
      if (process.env.NODE_ENV !== 'production' && allowedOrigins.length === 0) {
        return callback(null, true);
      }

      // In production, check against whitelist
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
  app.use(express.json());

  // Health check endpoint (for Docker/Railway)
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.use('/api', routes);

  app.use(errorHandler);

  return app;
};
