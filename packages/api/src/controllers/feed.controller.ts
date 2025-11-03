import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const FeedController = {
  // Get the feed of conversation cards from other users
  getFeed: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;

      // For now, a simple feed: Get all cards not belonging to the current user.
      // A more advanced implementation would exclude users the current user has already
      // interacted with (sent/received icebreakers, matched).
      const cards = await prisma.conversationCard.findMany({
        where: {
          NOT: {
            userId: userId,
          },
        },
        include: {
          user: {
            select: { // Only select public user info
              id: true,
              firstName: true,
              lastName: true,
              jobTitle: true,
              education: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc', // Show newest cards first
        },
        take: 50, // Paginate
      });

      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching feed' });
    }
  },
};
