// server/src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// This interface allows us to attach 'user' to the Express Request object
export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

/**
 * NAMED EXPORT: protect
 * Verifies the JWT token and attaches the user payload to the request object.
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
 * NAMED EXPORT: adminOnly
 * Specific middleware to restrict access to Admins or Wardens.
 * Resolves the "Cannot find name 'adminOnly'" error in routes.
 */
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Ensure 'WARDEN' is included if that is the role of your logged-in user
  if (req.user && (req.user.role === 'admin' || req.user.role === 'warden')) {
    next();
  } else {
    // This is the source of your 403 error
    res.status(403).json({ message: "Access denied. Admin or Warden privileges required." });
  }
};

/**
 * NAMED EXPORT: authorize
 * Generic handler for Role-Based Access Control (RBAC).
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