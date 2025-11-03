import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

// Extend the Request interface to include the user property
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = AuthService.verifyToken(token);

  if (!decoded || typeof decoded === 'string' || !('userId' in decoded)) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  // Attach user information to the request object
  req.user = {
    userId: decoded.userId,
    email: decoded.email,
  };

  next();
};
