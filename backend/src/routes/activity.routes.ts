import { Router } from 'express';
import { getProjectActivity, getUserActivity } from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth';
import { requireProjectAccess } from '../middleware/projectAccess';

const router = Router();

router.use(authenticate);

// We'll expose project activity under the projects route mostly, but standalone routes are good
router.get('/projects/:projectId', requireProjectAccess, getProjectActivity);
router.get('/me', getUserActivity);

export default router;
