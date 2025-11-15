import { DateTime } from 'luxon';
import { AppDataSource } from '../config/database';
import { OrganizerSettings } from '../models/OrganizerSettings';
import { Booking } from '../models/Booking';
import { SlotGeneratorService } from './slot-generator.service';
import { CreateBookingDto } from '../dto';

export class BookingService {
  private settingsRepo = AppDataSource.getRepository(OrganizerSettings);
  private bookingRepo = AppDataSource.getRepository(Booking);
  private slotGenerator = new SlotGeneratorService();

  async getAvailableSlots(organizerId: string, timezone: string) {
    const settings = await this.settingsRepo.findOne({ where: { userId: organizerId } });
    if (!settings) throw new Error('Organizer not found');

    const bookings = await this.bookingRepo.find({
      where: { organizerId, status: 'confirmed' },
    });

    return this.slotGenerator.generateSlots(settings, bookings, timezone);
  }

  async createBooking(organizerId: string, dto: CreateBookingDto): Promise<Booking> {
    const settings = await this.settingsRepo.findOne({ where: { userId: organizerId } });
    if (!settings) throw new Error('Organizer not found');

    const startTimeUtc = DateTime.fromISO(dto.startTime, { zone: dto.timezone }).toUTC();
    const endTimeUtc = startTimeUtc.plus({ minutes: settings.meetingDuration });

    await this.validateSlot(organizerId, settings, startTimeUtc.toJSDate(), endTimeUtc.toJSDate());

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const booking = this.bookingRepo.create({
        organizerId,
        inviteeName: dto.inviteeName,
        inviteeEmail: dto.inviteeEmail,
        startTime: startTimeUtc.toJSDate(),
        endTime: endTimeUtc.toJSDate(),
        status: 'confirmed',
      });

      const result = await queryRunner.manager.save(booking);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if ((error as any).code === '23505') {
        throw new Error('Slot already booked');
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async validateSlot(
    organizerId: string,
    settings: OrganizerSettings,
    startTime: Date,
    endTime: Date
  ): Promise<void> {
    const startDt = DateTime.fromJSDate(startTime, { zone: settings.timezone });
    const now = DateTime.now().setZone(settings.timezone);

    if (startDt < now.plus({ hours: settings.minimumNotice })) {
      throw new Error('Booking violates minimum notice requirement');
    }

    const dateStr = startDt.toISODate()!;
    if (settings.blackoutDates?.includes(dateStr)) {
      throw new Error('Date is blocked');
    }

    const workingHour = settings.workingHours?.find(wh => wh.day === startDt.weekday);
    if (!workingHour) {
      throw new Error('Outside working hours');
    }

    const overlapping = await this.bookingRepo
      .createQueryBuilder('booking')
      .where('booking.organizerId = :organizerId', { organizerId })
      .andWhere('booking.status = :status', { status: 'confirmed' })
      .andWhere('booking.startTime < :endTime', { endTime })
      .andWhere('booking.endTime > :startTime', { startTime })
      .getCount();

    if (overlapping > 0) {
      throw new Error('Slot conflicts with existing booking');
    }
  }
}
