import { Router } from 'express';
import { IcebreakerController } from '../controllers/icebreaker.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// GET /api/v1/icebreakers/pending
router.get('/pending', IcebreakerController.getPendingIcebreakers);

// POST /api/v1/icebreakers/:icebreakerId/accept
router.post('/:icebreakerId/accept', IcebreakerController.acceptIcebreaker);

export default router;
