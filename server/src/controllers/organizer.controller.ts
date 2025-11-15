import { Request, Response } from 'express';
import { OrganizerService } from '../services/organizer.service';

export class OrganizerController {
  private service = new OrganizerService();

  getSettings = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const settings = await this.service.getSettings(req.user.userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  updateSettings = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const settings = await this.service.updateSettings(req.user.userId, req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getBookings = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { bookings, total } = await this.service.getUpcomingBookings(
        req.user.userId,
        req.query
      );

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const totalPages = Math.ceil(total / limit);

      res.json({
        data: bookings,
        metadata: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  updateBooking = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { id } = req.params;
      const booking = await this.service.updateBooking(id, req.body);
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
