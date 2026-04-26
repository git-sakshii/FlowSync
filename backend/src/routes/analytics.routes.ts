import { Router } from 'express';
import {
    getTaskCompletionTrend,
    getProjectProgressAnalytics,
    getTaskDistribution,
    getTeamWorkload,
    getDashboardStats
} from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/tasks/completion', getTaskCompletionTrend);
router.get('/projects/progress', getProjectProgressAnalytics);
router.get('/tasks/distribution', getTaskDistribution);
router.get('/team/workload', getTeamWorkload);

export default router;
