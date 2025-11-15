import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private service = new AuthService();

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.service.register(req.body);
      res.status(201).json({
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
          role: result.user.role,
        },
        token: result.token,
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.service.login(req.body);
      res.json({
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
          role: result.user.role,
        },
        token: result.token,
      });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  };

  me = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const user = await this.service.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
