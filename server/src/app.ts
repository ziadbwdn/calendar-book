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
  const allowedOriginsList = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()).filter(Boolean) || [];

  // If no allowed origins specified, allow all origins (useful for development)
  // If allowed origins are specified, only allow those origins
  const corsOptions = allowedOriginsList.length > 0
    ? {
        origin: allowedOriginsList,
        credentials: true
      }
    : {
        origin: true, // Allow all origins
        credentials: true
      };

  app.use(cors(corsOptions));
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
