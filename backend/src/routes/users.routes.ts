import { Router } from 'express';
import { getProfile, updateProfile, updatePreferences, updateUserRole, searchUsers, updatePassword, inviteUser } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate); // Protect all user routes

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/me/preferences', updatePreferences);
router.put('/me/password', updatePassword);
router.put('/:id/role', updateUserRole); // Admin only check inside controller
router.post('/invite', inviteUser);
router.get('/', searchUsers);

export default router;
