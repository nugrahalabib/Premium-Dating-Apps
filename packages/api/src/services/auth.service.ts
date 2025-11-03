import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

// Basic in-memory store for refresh tokens for simplicity
const tokenStore: { [key: string]: string } = {};

export const AuthService = {
  // Hash password
  hashPassword: async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
  },

  // Compare password with hash
  comparePassword: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },

  // Generate JWT Access Token
  generateAccessToken: (userId: number, email: string): string => {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '15m' });
  },

  // Generate JWT Refresh Token
  generateRefreshToken: (userId: number): string => {
    const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    tokenStore[userId] = refreshToken;
    return refreshToken;
  },

  // Verify JWT Token
  verifyToken: (token: string) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  },

  // Invalidate refresh token
  invalidateRefreshToken: (userId: number) => {
    delete tokenStore[userId];
  }
};
