// add klines route to binance routes
import express from 'express';
import prisma from '../prismaClient';
import { encrypt } from '../utils/crypto';
import { BinanceClient } from '../services/binanceClient';

const router = express.Router();

// Connect Binance account - store encrypted keys and verify
router.post('/connect', async (req, res) => {
  try {
    const { userId, name, apiKey, apiSecret, isTestnet } = req.body;
    if(!userId || !apiKey || !apiSecret) return res.status(400).json({ error: 'missing parameters' });

    const encKey = process.env.ENCRYPTION_KEY;
    if(!encKey) return res.status(500).json({ error: 'server missing ENCRYPTION_KEY' });

    const encryptedApiKey = encrypt(apiKey, encKey);
    const encryptedApiSecret = encrypt(apiSecret, encKey);

    const account = await prisma.binanceAccount.create({
      data: {
        userId: Number(userId),
        name: name || 'default',
        encryptedApiKey,
        encryptedApiSecret,
        isTestnet: Boolean(isTestnet),
        verified: false
      }
    });

    // Verify by calling Binance Testnet/live
    const client = new BinanceClient(apiKey, apiSecret, Boolean(isTestnet));
    try{
      await client.getFuturesBalance();
      // mark verified
      await prisma.binanceAccount.update({ where: { id: account.id }, data: { verified: true } });
      return res.json({ success: true, accountId: account.id, verified: true });
    }catch(e:any){
      // leave unverified but stored
      console.error('binance verification failed', e?.message || e);
      return res.status(202).json({ success: true, accountId: account.id, verified: false, warning: 'verification failed - check API permissions or keys' });
    }

  } catch (e:any){
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

// List accounts for user
router.get('/accounts/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  const accounts = await prisma.binanceAccount.findMany({ where: { userId } });
  res.json(accounts);
});

// Simple verify endpoint for a stored account
router.post('/verify/:id', async (req,res)=>{
  const id = Number(req.params.id);
  const account = await prisma.binanceAccount.findUnique({ where: { id } });
  if(!account) return res.status(404).json({ error: 'not found' });
  const encKey = process.env.ENCRYPTION_KEY;
  if(!encKey) return res.status(500).json({ error: 'server missing ENCRYPTION_KEY' });
  // decrypt
  const { decrypt } = await import('../utils/crypto');
  const apiKey = decrypt(account.encryptedApiKey, encKey);
  const apiSecret = decrypt(account.encryptedApiSecret, encKey);
  const client = new BinanceClient(apiKey, apiSecret, account.isTestnet);
  try{
    const balance = await client.getFuturesBalance();
    res.json({ ok: true, balance });
  }catch(e:any){
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

// Klines proxy
router.get('/klines', async (req,res)=>{
  const { symbol, interval = '1m', limit = '500', accountId } = req.query as any;
  if(!symbol) return res.status(400).json({ error: 'symbol required' });
  try{
    if(accountId){
      const account = await prisma.binanceAccount.findUnique({ where: { id: Number(accountId) } });
      if(!account) return res.status(404).json({ error: 'account not found' });
      const { decrypt } = await import('../utils/crypto');
      const encKey = process.env.ENCRYPTION_KEY!;
      const apiKey = decrypt(account.encryptedApiKey, encKey);
      const apiSecret = decrypt(account.encryptedApiSecret, encKey);
      const client = new BinanceClient(apiKey, apiSecret, account.isTestnet);
      const kl = await client.getKlines(symbol, interval, Number(limit));
      return res.json(kl);
    } else {
      // public testnet endpoint (no auth required) - use testnet base
      const base = process.env.BINANCE_TESTNET_API_BASE || 'https://testnet.binancefuture.com';
      const url = `${base}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      const axios = (await import('axios')).default;
      const res2 = await axios.get(url, { timeout: 10000 });
      const data = res2.data.map((k:any[])=>({ openTime:k[0], open:parseFloat(k[1]), high:parseFloat(k[2]), low:parseFloat(k[3]), close:parseFloat(k[4]), volume:parseFloat(k[5]), closeTime:k[6] }));
      return res.json(data);
    }
  }catch(e:any){ res.status(500).json({ error: e?.message || String(e) }); }
});

export default router;
