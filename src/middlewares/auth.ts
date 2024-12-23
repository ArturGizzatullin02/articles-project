import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

const JWT_SECRET = 'secret_key';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | { id: number; role: string };
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Unauthorized access attempt');
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn(`Forbidden access attempt: ${err.message}`);
      res.sendStatus(403);
      return;
    }
    req.user = user as JwtPayload;
    next();
  });
}

export function authorizeRole(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user?.role !== role) {
      res.sendStatus(403);
      return;
    }
    next();
  };
}