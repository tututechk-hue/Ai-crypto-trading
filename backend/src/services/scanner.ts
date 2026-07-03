import { BinanceClient } from './binanceClient';
import prisma from '../prismaClient';
import { macd, rsi, ema, atr, supertrend, adx, volumeConfirmation, breakoutDetection } from './indicators';

const SCAN_INTERVAL_MS = 30_000; // 30s

export class Scanner {
  running = false;
  intervalId: any = null;

  constructor(){ }

  async scanOnceForUser(userId:number){
    // find user's verified testnet accounts
    const accounts = await prisma.binanceAccount.findMany({ where: { userId, verified: true } });
    if(accounts.length === 0) return;
    const account = accounts[0];
    // decrypt keys
    const encKey = process.env.ENCRYPTION_KEY!;
    const { decrypt } = await import('../utils/crypto');
    const apiKey = decrypt(account.encryptedApiKey, encKey);
    const apiSecret = decrypt(account.encryptedApiSecret, encKey);
    const client = new BinanceClient(apiKey, apiSecret, account.isTestnet);

    // get exchange info
    let exch:any;
    try{
      exch = await client.getExchangeInfo();
    }catch(e){
      console.error('exchangeInfo failed', e);
      return;
    }
    const symbols = exch.symbols.filter((s:any)=> s.quoteAsset === 'USDT' && s.contractType === 'PERPETUAL').map((s:any)=>s.symbol);

    for(const symbol of symbols.slice(0, 200)){
      try{
        const klines = await client.getKlines(symbol,'1m',200);
        if(!klines || klines.length < 60) continue;
        const closes = klines.map((k:any)=>k.close);
        const highs = klines.map((k:any)=>k.high);
        const lows = klines.map((k:any)=>k.low);
        const volumes = klines.map((k:any)=>k.volume);

        // indicators
        const emaFast = ema(closes,12).slice(-1)[0];
        const emaSlow = ema(closes,26).slice(-1)[0];
        const macdRes = macd(closes);
        const macdSignal = macdRes.signalLine.slice(-1)[0];
        const macdHist = macdRes.histogram.slice(-1)[0];
        const rsiVal = rsi(closes).slice(-1)[0];
        const atrValArr = atr(highs,lows,closes,14);
        const atrVal = atrValArr.slice(-1)[0] || 0;
        const st = supertrend(highs,lows,closes,10,3);
        const adxVal = adx(highs,lows,closes,14);
        const volOk = volumeConfirmation(volumes,20);
        const breakout = breakoutDetection(highs,lows,closes,20);

        // confirmations
        const confirmations = [] as string[];
        // EMA trend filter
        if(emaFast > emaSlow) confirmations.push('ema');
        // Supertrend
        if(st.up) confirmations.push('supertrend');
        // MACD
        if(macdHist > 0) confirmations.push('macd');
        // RSI
        if(rsiVal && rsiVal > 40 && rsiVal < 70) confirmations.push('rsi');
        // ADX
        if(adxVal > 20) confirmations.push('adx');
        // Volume
        if(volOk) confirmations.push('volume');
        // ATR volatility (avoid too low vol)
        if(atrVal > 0) confirmations.push('atr');
        // Breakout detection
        if(breakout.breakoutUp) confirmations.push('breakout');

        const required = ['ema','supertrend','macd','rsi','adx','volume','atr','breakout'];
        const allOk = required.every(r=>confirmations.includes(r));
        const score = Math.round((confirmations.length / required.length) * 100);

        if(allOk && score >= 80){
          // save signal
          await prisma.signal.create({ data: { userId, symbol, timeframe: '1m', score, payload: { confirmations, emaFast, emaSlow, macdHist, rsiVal, atrVal } } });
          // broadcast via ws
          try{
            const { broadcast } = await import('../wsServer');
            broadcast({ type: 'signal', userId, symbol, score });
          }catch(e){/* ignore */}
        }

      }catch(e:any){
        // continue
        // console.error('scan symbol failed', symbol, e?.message || e);
      }
    }
  }

  start(userId:number){
    if(this.running) return;
    this.running = true;
    this.intervalId = setInterval(()=>{
      this.scanOnceForUser(userId).catch(e=>console.error('scan error', e));
    }, SCAN_INTERVAL_MS);
    // run immediate
    this.scanOnceForUser(userId).catch(e=>console.error('scan error', e));
  }

  stop(){
    if(!this.running) return;
    clearInterval(this.intervalId);
    this.running = false;
  }
}

export const scanner = new Scanner();
