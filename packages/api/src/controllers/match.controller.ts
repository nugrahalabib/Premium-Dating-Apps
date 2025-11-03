import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { z } from 'zod';

const sendMessageSchema = z.object({
  content: z.string().min(1),
});

const GHOSTING_HOURS_LIMIT = 72;

export const MatchController = {
  // Get all active matches for the logged-in user
  getActiveMatches: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const matches = await prisma.match.findMany({
        where: {
          AND: [
            { isActive: true },
            { OR: [{ userAId: userId }, { userBId: userId }] },
          ]
        },
        include: {
          userA: { select: { id: true, firstName: true } },
          userB: { select: { id: true, firstName: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Get only the last message for preview
          },
        },
      });
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching matches' });
    }
  },

  // Send a message in a match
  sendMessage: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const senderId = req.user?.userId;
      const { matchId } = req.params;
      const { content } = sendMessageSchema.parse(req.body);

      // Verify the user is part of the match
      const match = await prisma.match.findFirst({
        where: {
          id: matchId,
          isActive: true,
          OR: [{ userAId: senderId }, { userBId: senderId }],
        },
        include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } }
      });

      if (!match) {
        return res.status(404).json({ message: 'Active match not found or you are not a participant' });
      }

      // --- Optional Anti-Ghosting Logic ---
      if (match.messages.length > 0) {
        const lastMessage = match.messages[0];
        if (lastMessage.senderId !== senderId) {
          const hoursSinceLastMessage = (new Date().getTime() - lastMessage.createdAt.getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastMessage > GHOSTING_HOURS_LIMIT) {
             // Here you could add a penalty, like reducing focus slots.
             // For now, we'll just log it.
             console.log(`User ${senderId} replied to a message in match ${matchId} after ${GHOSTING_HOURS_LIMIT} hours.`);
          }
        }
      }

      const newMessage = await prisma.message.create({
        data: {
          content,
          matchId,
          senderId: senderId!,
        },
      });

      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error sending message' });
    }
  },

  // Unmatch
  unmatch: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { matchId } = req.params;

       const match = await prisma.match.findFirst({
        where: {
          id: matchId,
          isActive: true,
          OR: [{ userAId: userId }, { userBId: userId }],
        },
      });

      if (!match) {
         return res.status(404).json({ message: 'Active match not found' });
      }

      await prisma.match.update({
        where: { id: matchId },
        data: { isActive: false },
      });

      res.status(200).json({ message: 'Match has been ended. Chat slot is now free.' });

    } catch (error) {
       res.status(500).json({ message: 'Server error during unmatch' });
    }
  }
};
