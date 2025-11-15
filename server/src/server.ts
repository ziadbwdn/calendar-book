import { AppDataSource } from './config/database';
import { createApp } from './app';
import { config } from './config/env';
import { User, UserRole } from './models/User';
import { OrganizerSettings } from './models/OrganizerSettings';

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    // Create seed organizer user if it doesn't exist
    const userRepo = AppDataSource.getRepository(User);
    const seedUserId = '00000000-0000-0000-0000-000000000001';

    let seedUser = await userRepo.findOne({
      where: { email: 'organizer@example.com' }
    });

    if (!seedUser) {
      seedUser = userRepo.create({
        id: seedUserId,
        email: 'organizer@example.com',
        password: 'hashed_password_placeholder',
        fullName: 'Seed Organizer',
        role: UserRole.ORGANIZER,
        isVerified: true,
      });
      await userRepo.save(seedUser);
      console.log('Seed organizer user created');
    } else {
      console.log('Seed organizer user already exists');
    }

    // Create seed organizer settings
    const settingsRepo = AppDataSource.getRepository(OrganizerSettings);
    const settingsId = '00000000-0000-0000-0000-000000000001';

    const existingSettings = await settingsRepo.findOne({
      where: { id: settingsId }
    });

    if (!existingSettings) {
      await settingsRepo.save({
        id: settingsId,
        userId: seedUser.id,
        timezone: 'America/New_York',
        workingHours: [
          { day: 1, start: '09:00', end: '17:00' },
          { day: 2, start: '09:00', end: '17:00' },
          { day: 3, start: '09:00', end: '17:00' },
          { day: 4, start: '09:00', end: '17:00' },
          { day: 5, start: '09:00', end: '17:00' },
        ],
        meetingDuration: 30,
        bufferBefore: 0,
        bufferAfter: 0,
        minimumNotice: 24,
        blackoutDates: [],
      });
      console.log('Seed organizer settings created');
    } else {
      console.log('Seed organizer settings already exist');
    }

    const app = createApp();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
