import { Router } from 'express';
import {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    addTeamMember,
    removeTeamMember,
    getProjectProgress
} from '../controllers/projects.controller';
import { authenticate } from '../middleware/auth';
import { requireProjectAccess, requireProjectOwner } from '../middleware/projectAccess';

const router = Router();

router.use(authenticate);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', requireProjectAccess, getProject);
router.put('/:id', requireProjectOwner, updateProject); // Only owner/admin can update typically
router.delete('/:id', requireProjectOwner, deleteProject);

router.post('/:id/members', requireProjectOwner, addTeamMember);
router.delete('/:id/members/:userId', requireProjectOwner, removeTeamMember);

router.get('/:id/progress', requireProjectAccess, getProjectProgress);

export default router;
