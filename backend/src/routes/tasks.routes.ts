import { Router } from 'express';
import {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskOrder,
    assignTask,
    getMyTasks
} from '../controllers/tasks.controller';
import { authenticate } from '../middleware/auth';
import { requireProjectAccess } from '../middleware/projectAccess';

const router = Router();

router.use(authenticate);

// Task routes often need project context
router.post('/projects/:projectId/tasks', requireProjectAccess, createTask);
router.get('/projects/:projectId/tasks', requireProjectAccess, getTasks);

// Direct task operations
router.get('/tasks', getMyTasks); // Get unnested my tasks
router.get('/tasks/:id', getTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);
router.put('/tasks/:id/status', updateTaskStatus); // For Kanban moves
router.put('/tasks/:id/order', updateTaskOrder);   // For reordering within column
router.put('/tasks/:id/assign', assignTask);

export default router;
