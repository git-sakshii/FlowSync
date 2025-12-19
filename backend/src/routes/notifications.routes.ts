import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, clearNotifications } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', clearNotifications);

export default router;
