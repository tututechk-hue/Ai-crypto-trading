import express from 'express';
import { scanner } from '../services/scanner';
import prisma from '../prismaClient';
import { openTrade, closeTrade } from '../services/orderManager';

const router = express.Router();

// Start bot for user
router.post('/start', async (req,res)=>{
  try{
    const { userId } = req.body;
    if(!userId) return res.status(400).json({ error: 'missing userId' });
    // create bot instance
    await prisma.botInstance.create({ data: { userId: Number(userId), status: 'running', mode: 'testnet', startedAt: new Date() } });
    scanner.start(Number(userId));
    res.json({ ok: true });
  }catch(e:any){ res.status(500).json({ error: e?.message || String(e) }); }
});

// Stop bot
router.post('/stop', async (req,res)=>{
  try{
    const { userId } = req.body;
    if(!userId) return res.status(400).json({ error: 'missing userId' });
    await prisma.botInstance.create({ data: { userId: Number(userId), status: 'stopped', mode: 'testnet', stoppedAt: new Date() } });
    scanner.stop();
    res.json({ ok: true });
  }catch(e:any){ res.status(500).json({ error: e?.message || String(e) }); }
});

// open trade (manual)
router.post('/open', async (req,res)=>{
  try{
    const { userId, accountId, symbol, side, quantity } = req.body;
    if(!userId || !accountId || !symbol || !side || !quantity) return res.status(400).json({ error: 'missing params' });
    const result = await openTrade(Number(userId), Number(accountId), symbol, side === 'BUY' ? 'BUY' : 'SELL', Number(quantity));
    res.json({ ok: true, result });
  }catch(e:any){ res.status(500).json({ error: e?.message || String(e) }); }
});

// close trade (manual)
router.post('/close', async (req,res)=>{
  try{
    const { tradeId } = req.body;
    if(!tradeId) return res.status(400).json({ error: 'missing tradeId' });
    const result = await closeTrade(Number(tradeId));
    res.json({ ok: true, result });
  }catch(e:any){ res.status(500).json({ error: e?.message || String(e) }); }
});

// list signals
router.get('/signals/:userId', async (req,res)=>{
  const userId = Number(req.params.userId);
  const signals = await prisma.signal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
  res.json(signals);
});

export default router;
