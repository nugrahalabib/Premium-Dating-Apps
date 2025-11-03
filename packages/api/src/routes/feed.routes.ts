import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', FeedController.getFeed);

export default router;
