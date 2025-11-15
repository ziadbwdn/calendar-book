import { DateTime } from 'luxon';
import { OrganizerSettings } from '../models/OrganizerSettings';
import { Booking } from '../models/Booking';

interface TimeSlot {
  start: string;
  end: string;
}

export class SlotGeneratorService {
  generateSlots(
    settings: OrganizerSettings,
    existingBookings: Booking[],
    targetTimezone: string
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const now = DateTime.now().setZone(settings.timezone);
    const endDate = now.plus({ days: 14 });

    for (let date = now.startOf('day'); date < endDate; date = date.plus({ days: 1 })) {
      const dateStr = date.toISODate()!;
      if (settings.blackoutDates?.includes(dateStr)) continue;

      const workingHour = settings.workingHours.find(wh => wh.day === date.weekday);
      if (!workingHour) continue;

      const [startHour, startMin] = (workingHour.start || '09:00').split(':').map(Number);
      const [endHour, endMin] = (workingHour.end || '17:00').split(':').map(Number);

      let slotStart = date.set({ hour: startHour, minute: startMin, second: 0 });
      const dayEnd = date.set({ hour: endHour, minute: endMin, second: 0 });

      while (slotStart.plus({ minutes: settings.meetingDuration }) <= dayEnd) {
        const slotEnd = slotStart.plus({ minutes: settings.meetingDuration });

        if (slotStart < now.plus({ hours: settings.minimumNotice })) {
          slotStart = slotStart.plus({ minutes: settings.meetingDuration });
          continue;
        }

        const hasConflict = existingBookings.some(booking => {
          const bookingStart = DateTime.fromJSDate(booking.startTime, { zone: settings.timezone });
          const bookingEnd = DateTime.fromJSDate(booking.endTime, { zone: settings.timezone });

          const slotStartWithBuffer = slotStart.minus({ minutes: settings.bufferBefore });
          const slotEndWithBuffer = slotEnd.plus({ minutes: settings.bufferAfter });

          return slotStartWithBuffer < bookingEnd && slotEndWithBuffer > bookingStart;
        });

        if (!hasConflict) {
          slots.push({
            start: slotStart.setZone(targetTimezone).toISO()!,
            end: slotEnd.setZone(targetTimezone).toISO()!,
          });
        }

        slotStart = slotStart.plus({ minutes: settings.meetingDuration });
      }
    }

    return slots;
  }
}
