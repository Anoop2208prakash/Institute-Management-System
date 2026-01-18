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
    // FIXED: Corrected catch variable logic for linting
    console.error("Token verification failed:", err);
    res.status(400).json({ message: 'Invalid Token' });
  }
};

/**
 * NAMED EXPORT: adminOnly
 * Restricts access to Admins, Wardens, or Super Admins using normalized role checks.
 */
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.role) {
    res.status(403).json({ message: "Access denied. Authentication required." });
    return;
  }

  // FIXED: Normalize role to handle spaces and underscores
  // Converts "super_admin" or "SUPER ADMIN" into "SUPER ADMIN"
  const userRole = req.user.role.toUpperCase().replace(/_/g, ' ').trim();

  // Define allowed admin roles in normalized format
  const allowedAdmins = ['ADMIN', 'WARDEN', 'SUPER ADMIN', 'ADMINISTRATOR'];

  if (allowedAdmins.includes(userRole)) {
    next();
  } else {
    // Log the attempted role to help debug future console errors
    console.warn(`Unauthorized role attempted admin route: ${userRole}`);
    res.status(403).json({ message: `Forbidden: ${userRole} does not have administrative privileges.` });
  }
};

/**
 * NAMED EXPORT: authorize
 * Generic handler for Role-Based Access Control (RBAC) with string normalization.
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // FIXED: Normalize user role
    const userRole = req.user.role.toUpperCase().replace(/_/g, ' ').trim();

    // FIXED: Normalize all allowed roles provided in the arguments
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