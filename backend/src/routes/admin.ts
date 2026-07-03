import express from 'express';
import prisma from '../prismaClient';
import { authMiddleware, AuthRequest } from '../middlewares/auth';
import { handleSignal } from '../services/tradeExecutor';

const router = express.Router();

// Admin routes - require admin role
router.get('/overview', authMiddleware, async (req:AuthRequest,res)=>{
  if(req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  const totalUsers = await prisma.user.count();
  const totalTrades = await prisma.trade.count();
  const runningBots = await prisma.botInstance.count({ where: { status: 'running' } });
  res.json({ totalUsers, totalTrades, runningBots });
});

// Execute a signal (manual)
router.post('/execute-signal/:id', authMiddleware, async (req:AuthRequest,res)=>{
  try{
    if(req.user.role !== 'admin' && req.user.role !== 'user') return res.status(403).json({ error: 'forbidden' });
    const id = Number(req.params.id);
    const out = await handleSignal(id);
    res.json(out);
  }catch(e:any){ res.status(500).json({ error: e?.message || String(e) }); }
});

export default router;
