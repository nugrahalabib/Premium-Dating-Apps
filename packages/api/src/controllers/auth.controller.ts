import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthService } from '../services/auth.service';
import { z } from 'zod';

// Input validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthDate: z.string().datetime(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const AuthController = {
  // Register a new user
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, birthDate } = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }

      const hashedPassword = await AuthService.hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          birthDate: new Date(birthDate),
        },
      });

      res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error during registration' });
    }
  },

  // Login a user
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await AuthService.comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const accessToken = AuthService.generateAccessToken(user.id, user.email);
      const refreshToken = AuthService.generateRefreshToken(user.id);

      res.json({ accessToken, refreshToken });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error during login' });
    }
  },
};
