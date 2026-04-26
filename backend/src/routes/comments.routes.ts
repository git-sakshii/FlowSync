import { Router } from 'express';
import { addComment, getComments, deleteComment } from '../controllers/comments.controller';
import { authenticate } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(authenticate);

// These routes will be mounted at /api/tasks/:id/comments in tasks.routes.ts
// or directly in server.ts
router.post('/', addComment);
router.get('/', getComments);

export default router;
