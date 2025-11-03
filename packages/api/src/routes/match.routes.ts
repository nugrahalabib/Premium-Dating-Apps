import { Router } from 'express';
import { MatchController } from '../controllers/match.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// GET /api/v1/matches
router.get('/', MatchController.getActiveMatches);

// POST /api/v1/matches/:matchId/message
router.post('/:matchId/message', MatchController.sendMessage);

// POST /api/v1/matches/:matchId/unmatch
router.post('/:matchId/unmatch', MatchController.unmatch);

export default router;
