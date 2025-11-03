import { Router } from 'express';
import { IcebreakerController } from '../controllers/icebreaker.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// POST /api/v1/cards/:cardId/icebreaker
router.post('/:cardId/icebreaker', IcebreakerController.createIcebreaker);

export default router;
