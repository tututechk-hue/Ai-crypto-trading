import prisma from '../prismaClient';
import { scoreSignal } from './ai';
import { openTrade, closeTrade } from './orderManager';

// Trade executor: receives a saved Signal and decides to execute (if high confidence)
export async function handleSignal(signalId:number){
  const sig = await prisma.signal.findUnique({ where: { id: signalId } });
  if(!sig) throw new Error('signal not found');
  const userId = sig.userId;
  const scoreRes = await scoreSignal(sig);
  if(!scoreRes.ok) return { executed: false, reason: 'score below threshold', scoreRes };

  // ensure one active trade per symbol
  const open = await prisma.trade.findFirst({ where: { userId, symbol: sig.symbol, status: 'open' } });
  if(open) return { executed: false, reason: 'open trade exists for symbol' };

  // pick account
  const account = await prisma.binanceAccount.findFirst({ where: { userId, verified: true } });
  if(!account) return { executed: false, reason: 'no verified account' };

  // determine side based on payload (assume breakout up -> BUY)
  const payload: any = sig.payload || {};
  const side = payload.confirmations && payload.confirmations.includes('breakout') ? 'BUY' : 'SELL';

  // position sizing: use simple percent of balance (1% default)
  const percentSetting = await prisma.setting.findUnique({ where: { key: 'risk:positionPercent' } });
  const percent = percentSetting ? Number(percentSetting.value) : 1;

  // get balance (simple futures balance sum)
  const accountClient = await import('./binanceClient');
  const { decrypt } = await import('../utils/crypto');
  const encKey = process.env.ENCRYPTION_KEY!;
  const apiKey = decrypt(account.encryptedApiKey, encKey);
  const apiSecret = decrypt(account.encryptedApiSecret, encKey);
  const client = new accountClient.BinanceClient(apiKey, apiSecret, account.isTestnet);
  const balances = await client.getFuturesBalance();
  const usdtBalObj = balances.find((b:any)=>b.asset === 'USDT');
  const free = usdtBalObj ? parseFloat(usdtBalObj.balance || usdtBalObj.withdrawAvailable || 0) : 0;
  const usdForTrade = free * (percent/100);

  // approximate price by recent kline
  const klines = await client.getKlines(sig.symbol, '1m', 2);
  const price = klines[klines.length-1].close || 0;
  if(price <= 0) return { executed: false, reason: 'bad price' };

  // quantity = usdForTrade / price (no leverage applied here, use leverage later)
  const leverageSetting = await prisma.setting.findUnique({ where: { key: 'risk:defaultLeverage' } });
  const leverage = leverageSetting ? Number(leverageSetting.value) : 10;
  const qty = Number((usdForTrade / price).toFixed(3));
  if(qty <= 0) return { executed: false, reason: 'qty computed zero' };

  // open trade via orderManager
  const res = await openTrade(userId, account.id, sig.symbol, side as any, qty, leverage);
  // record AIRecord
  await prisma.aiRecord.create({ data: { userId, tradeId: res.trade.id, features: sig.payload, label: null, score: sig.score } });
  return { executed: true, res };
}
