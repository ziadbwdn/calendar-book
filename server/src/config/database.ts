import 'dotenv/config';
import { DataSource } from 'typeorm';
import { OrganizerSettings } from '../models/OrganizerSettings';
import { Booking } from '../models/Booking';
import { User } from '../models/User';

// Parse DATABASE_URL from Railway, fallback to individual env vars for local dev
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    // Railway provides DATABASE_URL - parse it
    return {
      type: 'postgres' as const,
      url: process.env.DATABASE_URL,
    };
  }

  // Local development
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'meeting_scheduler',
  };
};

export const AppDataSource = new DataSource({
  ...getDatabaseConfig(),
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [OrganizerSettings, Booking, User],
  migrations: ['src/migrations/*.ts'],
});
