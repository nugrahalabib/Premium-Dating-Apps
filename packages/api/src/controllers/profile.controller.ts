import { Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schemas for validation
const updateProfileSchema = z.object({
  bio: z.string().optional(),
  jobTitle: z.string().optional(),
  education: z.string().optional(),
});

const createCardSchema = z.object({
  mediaUrl: z.string().url(),
  promptText: z.string().min(5),
});

export const ProfileController = {
  // Get current user's profile
  getMe: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { conversationCards: true },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Exclude password from the result
      const { password, ...userProfile } = user;
      res.json(userProfile);

    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update current user's profile
  updateMe: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const data = updateProfileSchema.parse(req.body);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
      });

      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);

    } catch (error) {
       if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Create a new conversation card
  createCard: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).send();
      }

      const { mediaUrl, promptText } = createCardSchema.parse(req.body);

      const newCard = await prisma.conversationCard.create({
        data: {
          mediaUrl,
          promptText,
          userId,
        },
      });

      res.status(201).json(newCard);
    } catch (error) {
       if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete a conversation card
  deleteCard: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const cardId = parseInt(req.params.cardId, 10);

      const card = await prisma.conversationCard.findUnique({ where: { id: cardId } });
      if (!card || card.userId !== userId) {
        return res.status(404).json({ message: 'Card not found or user unauthorized' });
      }

      await prisma.conversationCard.delete({ where: { id: cardId } });
      res.status(204).send(); // No content

    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },
};
