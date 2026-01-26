// server/src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface for Express Request object to include the user payload
export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

/**
 * NAMED EXPORT: authenticate
 * FIXED: Renamed from 'protect' to 'authenticate' to resolve route import errors
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'Access Denied. No token provided.' });
    return;
  }

  try {
    // Verifies the token using the secret from your .env file
    const verified = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
    
    // Attach user payload (id and role) to the request
    req.user = verified;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

/**
 * NAMED EXPORT: authorize
 * FIXED: Changed parameter to a single array 'roles: string[]' to resolve 
 * "Expected 1 argument, but got 6" IDE errors
 */
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(403).json({ message: 'Forbidden: No role assigned to user.' });
      return;
    }

    // Normalize user role (e.g., "super_admin" -> "SUPER ADMIN")
    const userRole = req.user.role.toUpperCase().replace(/_/g, ' ').trim();

    // Normalize input roles from the route definition
    const normalizedAllowedRoles = roles.map(r => r.toUpperCase().replace(/_/g, ' ').trim());

    if (!normalizedAllowedRoles.includes(userRole)) {
      res.status(403).json({ 
        message: `Forbidden: Access restricted. Your role: ${userRole}` 
      });
      return;
    }

    next();
  };
};

/**
 * NAMED EXPORT: adminOnly
 * Quick middleware for general administrative access.
 */
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.role) {
    res.status(403).json({ message: "Access denied. Authentication required." });
    return;
  }

  const userRole = req.user.role.toUpperCase().replace(/_/g, ' ').trim();
  const allowedAdmins = ['ADMIN', 'WARDEN', 'SUPER ADMIN', 'ADMINISTRATOR'];

  if (allowedAdmins.includes(userRole)) {
    next();
  } else {
    res.status(403).json({ message: `Forbidden: ${userRole} lacks administrative privileges.` });
  }
};