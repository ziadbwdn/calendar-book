import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ error: 'Forbidden - insufficient permissions' });
    }

    next();
  };
};

export const isOrganizer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.role !== UserRole.ORGANIZER) {
    return res.status(403).json({ error: 'Forbidden - organizer role required' });
  }

  next();
};

export const isInviteeOrGuest = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    // Guests can access without auth
    return next();
  }

  if (![UserRole.INVITEE, UserRole.GUEST].includes(req.user.role as UserRole)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};
