import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { z } from 'zod';

const createIcebreakerSchema = z.object({
  content: z.string().min(50),
});

export const IcebreakerController = {
  // Create a new icebreaker for a specific card
  createIcebreaker: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const senderId = req.user?.userId;
      if (!senderId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { cardId: targetCardId } = req.params;
      const { content } = createIcebreakerSchema.parse(req.body);

      // Find the target card and its owner
      const targetCard = await prisma.conversationCard.findUnique({
        where: { id: targetCardId },
      });

      if (!targetCard) {
        return res.status(404).json({ message: 'Target card not found' });
      }

      const receiverId = targetCard.userId;

      // User cannot send an icebreaker to themselves
      if (senderId === receiverId) {
        return res.status(400).json({ message: 'You cannot send an icebreaker to yourself' });
      }

      // Check if an icebreaker already exists
      const existingIcebreaker = await prisma.icebreaker.findFirst({
        where: { senderId, targetCardId },
      });

      if (existingIcebreaker) {
        return res.status(409).json({ message: 'You have already sent an icebreaker for this card' });
      }

      const newIcebreaker = await prisma.icebreaker.create({
        data: {
          content,
          senderId,
          receiverId,
          targetCardId,
        },
      });

      res.status(201).json(newIcebreaker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error creating icebreaker' });
    }
  },

  // Get pending icebreakers for the logged-in user
  getPendingIcebreakers: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const pendingIcebreakers = await prisma.icebreaker.findMany({
        where: {
          receiverId: userId,
          status: 'PENDING',
        },
        include: {
          sender: {
             select: { id: true, firstName: true, lastName: true }
          },
          targetCard: true,
        },
      });
      res.json(pendingIcebreakers);
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching pending icebreakers' });
    }
  },

  // Accept an icebreaker and create a match
  acceptIcebreaker: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { icebreakerId } = req.params;

      const icebreaker = await prisma.icebreaker.findUnique({
        where: { id: icebreakerId },
        include: { sender: true, receiver: true },
      });

      // Validation
      if (!icebreaker || icebreaker.receiverId !== userId) {
        return res.status(404).json({ message: 'Icebreaker not found or you are not the receiver' });
      }
      if (icebreaker.status !== 'PENDING') {
        return res.status(400).json({ message: 'This icebreaker has already been handled' });
      }

      const { sender, receiver } = icebreaker;

      // CRITICAL LOGIC: Check focus slots for both users
      const [senderMatches, receiverMatches] = await Promise.all([
        prisma.match.count({ where: { OR: [{ userAId: sender.id }, { userBId: sender.id }], isActive: true } }),
        prisma.match.count({ where: { OR: [{ userAId: receiver.id }, { userBId: receiver.id }], isActive: true } })
      ]);

      if (senderMatches >= sender.focusSlotsLimit) {
        return res.status(409).json({ message: `${sender.firstName}'s chat slots are full.` });
      }
      if (receiverMatches >= receiver.focusSlotsLimit) {
        return res.status(409).json({ message: 'Your chat slots are full.' });
      }

      // Create the match
      const newMatch = await prisma.match.create({
        data: {
          userAId: sender.id,
          userBId: receiver.id,
        },
      });

      // Update icebreaker status
      await prisma.icebreaker.update({
        where: { id: icebreakerId },
        data: { status: 'ACCEPTED' },
      });

      res.status(201).json({ message: 'Icebreaker accepted! You have a new match.', match: newMatch });

    } catch (error) {
      res.status(500).json({ message: 'Server error accepting icebreaker' });
    }
  },
};
