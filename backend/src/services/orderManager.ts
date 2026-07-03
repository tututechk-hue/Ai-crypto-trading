import prisma from '../prismaClient';
import { BinanceClient } from './binanceClient';

// Simple order manager: places market order and stores trade in DB
export async function openTrade(userId:number, accountId:number, symbol:string, side:'BUY'|'SELL', quantity:number, leverage=10){
  const account = await prisma.binanceAccount.findUnique({ where: { id: accountId } });
  if(!account) throw new Error('account not found');
  if(!account.verified) throw new Error('account not verified');
  const encKey = process.env.ENCRYPTION_KEY!;
  const { decrypt } = await import('../utils/crypto');
  const apiKey = decrypt(account.encryptedApiKey, encKey);
  const apiSecret = decrypt(account.encryptedApiSecret, encKey);
  const client = new BinanceClient(apiKey, apiSecret, account.isTestnet);

  // place market order
  const qtyStr = String(quantity);
  const order = await client.createOrder({ symbol, side, type: 'MARKET', quantity: qtyStr });

  const entryPrice = parseFloat(order.avgPrice || order.fills?.[0]?.price || order.price || '0') || 0;
  const trade = await prisma.trade.create({ data: { userId, symbol, side, entryPrice, qty: quantity, leverage, status: 'open' } });

  // broadcast
  try{ const { broadcast } = await import('../wsServer'); broadcast({ type: 'trade_opened', trade }); }catch(e){}

  return { order, trade };
}

export async function closeTrade(tradeId:number){
  const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
  if(!trade) throw new Error('trade not found');
  // find account for user
  const account = await prisma.binanceAccount.findFirst({ where: { userId: trade.userId, verified: true } });
  if(!account) throw new Error('account not found');
  const encKey = process.env.ENCRYPTION_KEY!;
  const { decrypt } = await import('../utils/crypto');
  const apiKey = decrypt(account.encryptedApiKey, encKey);
  const apiSecret = decrypt(account.encryptedApiSecret, encKey);
  const client = new BinanceClient(apiKey, apiSecret, account.isTestnet);

  const side = trade.side === 'BUY' ? 'SELL' : 'BUY';
  // close position by opposite market order of same qty
  const order = await client.createOrder({ symbol: trade.symbol, side: side as any, type: 'MARKET', quantity: String(trade.qty) });
  // compute pnl roughly via fills
  const exitPrice = parseFloat(order.avgPrice || order.fills?.[0]?.price || order.price || '0') || 0;
  const pnl = trade.side === 'BUY' ? (exitPrice - trade.entryPrice) * trade.qty * trade.leverage : (trade.entryPrice - exitPrice) * trade.qty * trade.leverage;
  const updated = await prisma.trade.update({ where: { id: tradeId }, data: { status: 'closed', closedAt: new Date(), pnl } });
  try{ const { broadcast } = await import('../wsServer'); broadcast({ type: 'trade_closed', trade: updated }); }catch(e){}
  return { order, updated };
}
