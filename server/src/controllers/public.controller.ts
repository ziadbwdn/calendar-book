import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';

export class PublicController {
  private service = new BookingService();

  getAvailableSlots = async (req: Request, res: Response) => {
    const { organizerId } = req.params;
    const timezone = (req.query.timezone as string) || 'UTC';

    const slots = await this.service.getAvailableSlots(organizerId, timezone);
    res.json({ slots });
  };

  createBooking = async (req: Request, res: Response) => {
    const { organizerId } = req.params;
    const booking = await this.service.createBooking(organizerId, req.body);
    res.status(201).json(booking);
  };
}
