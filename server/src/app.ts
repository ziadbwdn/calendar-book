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

  app.use(cors());
  app.use(express.json());

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
