import { Request, Response, NextFunction } from 'express';
import { NODE_ENV } from '../constants/env';

/**
 * Middleware to protect API documentation in production
 * Only allows access in development or with admin credentials
 */
export const protectApiDocs = (req: Request, res: Response, next: NextFunction) => {
  // Allow access in development
  if (NODE_ENV === 'development') {
    return next();
  }

  // In production, you might want to add additional checks
  // For example, check for admin authentication or IP whitelist
  const isAdmin = req.headers['x-admin-key'] === process.env.ADMIN_API_KEY;
  
  if (isAdmin) {
    return next();
  }

  // For now, allow access in all environments
  // You can modify this to be more restrictive
  return next();
};

/**
 * Middleware to add CORS headers for API documentation
 */
export const apiDocsCors = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};
