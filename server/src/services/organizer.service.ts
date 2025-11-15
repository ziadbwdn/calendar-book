import { DateTime } from 'luxon';
import { AppDataSource } from '../config/database';
import { OrganizerSettings } from '../models/OrganizerSettings';
import { Booking } from '../models/Booking';
import { UpdateSettingsDto, UpdateBookingDto } from '../dto';

export class OrganizerService {
  private settingsRepo = AppDataSource.getRepository(OrganizerSettings);
  private bookingRepo = AppDataSource.getRepository(Booking);

  async getSettings(organizerId: string): Promise<OrganizerSettings | null> {
    return this.settingsRepo.findOne({ where: { userId: organizerId } });
  }

  async updateSettings(organizerId: string, dto: UpdateSettingsDto): Promise<OrganizerSettings> {
    let settings = await this.settingsRepo.findOne({ where: { userId: organizerId } });

    if (!settings) {
      settings = this.settingsRepo.create({ userId: organizerId, ...dto });
    } else {
      Object.assign(settings, dto);
    }

    return this.settingsRepo.save(settings);
  }

  async getUpcomingBookings(
    organizerId: string,
    query: any = {}
  ): Promise<{ bookings: Booking[]; total: number }> {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const status = query.status || 'confirmed';

    const [bookings, total] = await this.bookingRepo.findAndCount({
      where: {
        organizerId,
        status,
      },
      order: { startTime: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { bookings, total };
  }

  async updateBooking(bookingId: string, dto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
    if (!booking) throw new Error('Booking not found');

    if (dto.action === 'cancel') {
      booking.status = 'cancelled';
      return this.bookingRepo.save(booking);
    }

    if (dto.action === 'reschedule' && dto.newStartTime) {
      const settings = await this.settingsRepo.findOne({
        where: { userId: booking.organizerId }
      });
      if (!settings) throw new Error('Settings not found');

      const newStartTime = new Date(dto.newStartTime);
      const newEndTime = new Date(newStartTime.getTime() + settings.meetingDuration * 60000);

      // Validate the new slot
      await this.validateSlot(booking.organizerId, settings, newStartTime, newEndTime, bookingId);

      booking.startTime = newStartTime;
      booking.endTime = newEndTime;
      return this.bookingRepo.save(booking);
    }

    throw new Error('Invalid action');
  }

  private async validateSlot(
    organizerId: string,
    settings: OrganizerSettings,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
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

    const startTimeStr = startDt.toFormat('HH:mm');
    const endTimeStr = startDt.plus({ minutes: settings.meetingDuration }).toFormat('HH:mm');
    const [startHour, startMin] = startTimeStr.split(':').map(Number);
    const [endHour, endMin] = endTimeStr.split(':').map(Number);
    const [whStartHour, whStartMin] = workingHour.start.split(':').map(Number);
    const [whEndHour, whEndMin] = workingHour.end.split(':').map(Number);

    if (startHour * 60 + startMin < whStartHour * 60 + whStartMin ||
        endHour * 60 + endMin > whEndHour * 60 + whEndMin) {
      throw new Error('Outside working hours');
    }

    let query = this.bookingRepo
      .createQueryBuilder('booking')
      .where('booking.organizerId = :organizerId', { organizerId })
      .andWhere('booking.status = :status', { status: 'confirmed' })
      .andWhere('booking.startTime < :endTime', { endTime })
      .andWhere('booking.endTime > :startTime', { startTime });

    if (excludeBookingId) {
      query = query.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
    }

    const overlapping = await query.getCount();

    if (overlapping > 0) {
      throw new Error('Slot conflicts with existing booking');
    }
  }
}
