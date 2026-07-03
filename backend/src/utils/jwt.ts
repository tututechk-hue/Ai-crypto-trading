import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const EXPIRES_IN = '12h';

export function signToken(payload: any){
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string){
  try{
    return jwt.verify(token, JWT_SECRET);
  }catch(e){
    return null;
  }
}
