import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// All routes in this file are protected
router.use(authMiddleware);

router.get('/me', ProfileController.getMe);
router.put('/me', ProfileController.updateMe);
router.post('/cards', ProfileController.createCard);
router.delete('/cards/:cardId', ProfileController.deleteCard);

export default router;
