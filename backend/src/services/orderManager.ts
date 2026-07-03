import prisma from '../prismaClient';
import { BinanceClient } from './binanceClient';
import { atrStopPrice, positionSizeFromRisk } from './risk';

export async function openTrade(userId:number, accountId:number, symbol:string, side:'BUY'|'SELL', quantity:number, leverage=10){
  const existing = await prisma.trade.findFirst({ where: { userId, symbol, status: 'open' } });
  if(existing) throw new Error('active trade exists for symbol');

  const account = await prisma.binanceAccount.findUnique({ where: { id: accountId } });
  if(!account) throw new Error('account not found');
  if(!account.verified) throw new Error('account not verified');
  const encKey = process.env.ENCRYPTION_KEY!;
  const { decrypt } = await import('../utils/crypto');
  const apiKey = decrypt(account.encryptedApiKey, encKey);
  const apiSecret = decrypt(account.encryptedApiSecret, encKey);
  const client = new BinanceClient(apiKey, apiSecret, account.isTestnet);

  // set leverage
  try{ await client.setLeverage(symbol, leverage); }catch(e){}

  // place market order
  const qtyStr = String(quantity);
  const order = await client.createOrder({ symbol, side, type: 'MARKET', quantity: qtyStr });

  const entryPrice = parseFloat(order.avgPrice || order.fills?.[0]?.price || order.price || '0') || 0;
  const trade = await prisma.trade.create({ data: { userId, symbol, side, entryPrice, qty: quantity, leverage, status: 'open' } });

  // compute ATR-based stop and TP simplistic
  try{
    const klines = await client.getKlines(symbol,'1m',50);
    const highs = klines.map((k:any)=>k.high);
    const lows = klines.map((k:any)=>k.low);
    const closes = klines.map((k:any)=>k.close);
    const { atr } = await import('./indicators');
    const atrArr = atr(highs,lows,closes,14);
    const lastAtr = atrArr[atrArr.length-1] || 0;
    const stop = atrStopPrice(entryPrice, lastAtr, 1.5, side);
    const take = side === 'BUY' ? Number((entryPrice + (entryPrice - stop)*2).toFixed(8)) : Number((entryPrice - (stop - entryPrice)*2).toFixed(8));

    // place stop market and take profit market orders
    // STOP_MARKET and TAKE_PROFIT_MARKET types use stopPrice / closePosition
    try{
      // stop order
      await client.createOrder({ symbol, side: side === 'BUY' ? 'SELL' : 'BUY', type: 'STOP_MARKET', stopPrice: String(stop), closePosition: true });
    }catch(e){}
    try{
      await client.createOrder({ symbol, side: side === 'BUY' ? 'SELL' : 'BUY', type: 'TAKE_PROFIT_MARKET', stopPrice: String(take), closePosition: true });
    }catch(e){}

    await prisma.trade.update({ where: { id: trade.id }, data: { stopLoss: stop, takeProfit: take } });
  }catch(e){ console.error('failed to place SL/TP', e); }

  // broadcast
  try{ const { broadcast } = await import('../wsServer'); broadcast({ type: 'trade_opened', trade }); }catch(e){}

  return { order, trade };
}

export async function closeTrade(tradeId:number){
  const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
  if(!trade) throw new Error('trade not found');
  const account = await prisma.binanceAccount.findFirst({ where: { userId: trade.userId, verified: true } });
  if(!account) throw new Error('account not found');
  const encKey = process.env.ENCRYPTION_KEY!;
  const { decrypt } = await import('../utils/crypto');
  const apiKey = decrypt(account.encryptedApiKey, encKey);
  const apiSecret = decrypt(account.encryptedApiSecret, encKey);
  const client = new BinanceClient(apiKey, apiSecret, account.isTestnet);

  const side = trade.side === 'BUY' ? 'SELL' : 'BUY';
  const order = await client.createOrder({ symbol: trade.symbol, side: side as any, type: 'MARKET', quantity: String(trade.qty) });
  const exitPrice = parseFloat(order.avgPrice || order.fills?.[0]?.price || order.price || '0') || 0;
  const pnl = trade.side === 'BUY' ? (exitPrice - trade.entryPrice) * trade.qty * trade.leverage : (trade.entryPrice - exitPrice) * trade.qty * trade.leverage;
  const updated = await prisma.trade.update({ where: { id: tradeId }, data: { status: 'closed', closedAt: new Date(), pnl } });
  try{ const { broadcast } = await import('../wsServer'); broadcast({ type: 'trade_closed', trade: updated }); }catch(e){}
  return { order, updated };
}
