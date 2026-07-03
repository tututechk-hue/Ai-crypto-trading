import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request{
  user?: any
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction){
  const header = req.headers['authorization'];
  if(!header) return res.status(401).json({ error: 'missing token' });
  const parts = String(header).split(' ');
  if(parts.length !== 2) return res.status(401).json({ error: 'invalid token' });
  const token = parts[1];
  const payload = verifyToken(token as string);
  if(!payload) return res.status(401).json({ error: 'invalid or expired token' });
  req.user = payload;
  next();
}
