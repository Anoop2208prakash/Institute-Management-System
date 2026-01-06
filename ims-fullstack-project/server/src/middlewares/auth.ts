// server/src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// This interface allows us to attach 'user' to the Express Request object
export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

/**
 * NAMED EXPORT: protect
 * This MUST be named 'protect' to match your route imports.
 */
export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'Access Denied. No token provided.' });
    return;
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

/**
 * NAMED EXPORT: authorize
 * Handles Role-Based Access Control (RBAC).
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        message: `Forbidden: Access restricted to [${roles.join(', ')}]` 
      });
      return;
    }

    next();
  };
};