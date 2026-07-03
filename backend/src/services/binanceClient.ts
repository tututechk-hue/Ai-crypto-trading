import axios from 'axios';
import crypto from 'crypto';

export class BinanceClient {
  apiKey: string;
  apiSecret: string;
  isTestnet: boolean;
  base: string;

  constructor(apiKey: string, apiSecret: string, isTestnet = true){
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.isTestnet = isTestnet;
    this.base = isTestnet ? (process.env.BINANCE_TESTNET_API_BASE || 'https://testnet.binancefuture.com') : (process.env.BINANCE_LIVE_API_BASE || 'https://fapi.binance.com');
  }

  sign(queryString: string){
    return crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
  }

  async getFuturesBalance(){
    const ts = Date.now();
    const qs = `timestamp=${ts}`;
    const signature = this.sign(qs);
    const url = `${this.base}/fapi/v2/balance?${qs}&signature=${signature}`;
    const headers = { 'X-MBX-APIKEY': this.apiKey };
    const res = await axios.get(url, { headers, timeout: 7000 });
    return res.data;
  }

  async ping(){
    const url = `${this.base}/fapi/v1/ping`;
    const res = await axios.get(url, { timeout: 5000 });
    return res.status === 200;
  }

  async getExchangeInfo(){
    const url = `${this.base}/fapi/v1/exchangeInfo`;
    const res = await axios.get(url, { timeout: 7000 });
    return res.data;
  }

  async getKlines(symbol: string, interval = '1m', limit = 500){
    const url = `${this.base}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await axios.get(url, { timeout: 10000 });
    // map into objects
    return res.data.map((k: any[])=>({
      openTime: k[0], open: parseFloat(k[1]), high: parseFloat(k[2]), low: parseFloat(k[3]), close: parseFloat(k[4]), volume: parseFloat(k[5]), closeTime: k[6]
    }));
  }

  async createOrder(params: { symbol: string, side: 'BUY'|'SELL', type: string, quantity?: string, price?: string, reduceOnly?: boolean }){
    const ts = Date.now();
    let qs = `symbol=${params.symbol}&side=${params.side}&type=${params.type}&timestamp=${ts}`;
    if(params.quantity) qs += `&quantity=${params.quantity}`;
    if(params.price) qs += `&price=${params.price}`;
    if(params.reduceOnly) qs += `&reduceOnly=${params.reduceOnly}`;
    const signature = this.sign(qs);
    const url = `${this.base}/fapi/v1/order?${qs}&signature=${signature}`;
    const headers = { 'X-MBX-APIKEY': this.apiKey };
    const res = await axios.post(url, {}, { headers, timeout: 10000 });
    return res.data;
  }

  async getOpenPositions(){
    const ts = Date.now();
    const qs = `timestamp=${ts}`;
    const signature = this.sign(qs);
    const url = `${this.base}/fapi/v2/positionRisk?${qs}&signature=${signature}`;
    const headers = { 'X-MBX-APIKEY': this.apiKey };
    const res = await axios.get(url, { headers, timeout: 7000 });
    return res.data;
  }
}
