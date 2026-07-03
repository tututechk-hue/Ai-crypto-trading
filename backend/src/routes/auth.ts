import express from 'express';
import prisma from '../prismaClient';
import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt';

const router = express.Router();

// Register (basic)
router.post('/register', async (req,res)=>{
  try{
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error: 'missing fields' });
    const exists = await prisma.user.findUnique({ where: { email } });
    if(exists) return res.status(409).json({ error: 'email exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hash } });
    const token = signToken({ userId: user.id, role: user.role });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  }catch(e:any){ res.status(500).json({ error: String(e) }); }
});

// Login
router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error: 'missing fields' });
    const user = await prisma.user.findUnique({ where: { email } });
    if(!user) return res.status(401).json({ error: 'invalid' });
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(401).json({ error: 'invalid' });
    const token = signToken({ userId: user.id, role: user.role });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  }catch(e:any){ res.status(500).json({ error: String(e) }); }
});

export default router;
