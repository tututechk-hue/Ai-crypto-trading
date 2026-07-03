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
    this.base = process.env.BINANCE_TESTNET_API_BASE || (isTestnet ? 'https://testnet.binancefuture.com' : 'https://fapi.binance.com');
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
    const res = await axios.get(url, { headers, timeout: 5000 });
    return res.data;
  }

  async ping(){
    const url = `${this.base}/fapi/v1/ping`;
    const res = await axios.get(url, { timeout: 5000 });
    return res.status === 200;
  }
}
