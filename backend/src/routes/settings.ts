import express from 'express';
import prisma from '../prismaClient';
import { authMiddleware, AuthRequest } from '../middlewares/auth';

const router = express.Router();

router.get('/me', authMiddleware, async (req:AuthRequest,res)=>{
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  res.json(user);
});

router.get('/settings', authMiddleware, async (req:AuthRequest,res)=>{
  const settings = await prisma.setting.findMany();
  res.json(settings);
});

router.post('/settings', authMiddleware, async (req:AuthRequest,res)=>{
  if(req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  const { key, value } = req.body;
  if(!key) return res.status(400).json({ error: 'key required' });
  const s = await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  res.json(s);
});

export default router;
