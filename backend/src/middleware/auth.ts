import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key') as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error: any) {
    // Log error details for debugging (but don't expose sensitive info to client)
    if (error.name === 'TokenExpiredError') {
      console.log('Token expired for request:', req.path);
    } else if (error.name === 'JsonWebTokenError') {
      console.log('Invalid token signature for request:', req.path);
    } else {
      console.log('Token verification error:', error.message);
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};