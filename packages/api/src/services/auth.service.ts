import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL_ERROR: JWT_SECRET is not defined in the environment variables.');
}
const JWT_SECRET = process.env.JWT_SECRET;

// WARNING: This is a basic in-memory store for refresh tokens and is not suitable for production.
// All user sessions will be lost on server restart.
// Replace with a persistent store like Redis in a real application.
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
  generateAccessToken: (userId: string, email: string): string => {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '15m' });
  },

  // Generate JWT Refresh Token
  generateRefreshToken: (userId: string): string => {
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
  invalidateRefreshToken: (userId: string) => {
    delete tokenStore[userId];
  }
};
