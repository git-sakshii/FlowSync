import { Router } from 'express';
import {
    inviteToProject,
    getInviteDetails,
    acceptInvite,
    getProjectInvites
} from '../controllers/invite.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public route — no auth needed (used by invite landing page)
router.get('/invite/:token', getInviteDetails);

// Auth required routes
router.post('/invite/:token/accept', authenticate, acceptInvite);
router.post('/projects/:id/invite', authenticate, inviteToProject);
router.get('/projects/:id/invites', authenticate, getProjectInvites);

export default router;
