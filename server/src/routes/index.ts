import express from 'express';
import authRoutes from './auth.routes';
import organizerRoutes from './organizer.routes';
import publicRoutes from './public.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/organizer', organizerRoutes);
router.use('/public', publicRoutes);

export default router;
