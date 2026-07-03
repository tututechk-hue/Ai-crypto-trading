// basic indicator implementations

export function ema(values: number[], period: number){
  const k = 2/(period+1);
  let emaArray: number[] = [];
  let prev: number | null = null;
  for(let i=0;i<values.length;i++){
    if(prev === null){
      prev = values[i];
      emaArray.push(prev);
    } else {
      prev = values[i]*k + prev*(1-k);
      emaArray.push(prev);
    }
  }
  return emaArray;
}

export function macd(values: number[], fast=12, slow=26, signal=9){
  const emaFast = ema(values, fast);
  const emaSlow = ema(values, slow);
  const macdLine = emaFast.map((v,i)=> v - emaSlow[i]);
  const signalLine = ema(macdLine, signal);
  const histogram = macdLine.map((v,i)=> v - signalLine[i]);
  return { macdLine, signalLine, histogram };
}

export function rsi(values: number[], period=14){
  let gains=0, losses=0;
  let rsis:number[] = [];
  for(let i=1;i<values.length;i++){
    const change = values[i]-values[i-1];
    gains = (gains*(period-1) + Math.max(0,change))/period;
    losses = (losses*(period-1) + Math.max(0,-change))/period;
    const rs = losses === 0 ? 100 : gains / losses;
    const rsi = 100 - (100/(1+rs));
    rsis.push(rsi);
  }
  // pad
  rsis.unshift(...Array(1).fill(50));
  return rsis;
}

export function atr(high:number[], low:number[], close:number[], period=14){
  let trs:number[] = [];
  for(let i=1;i<high.length;i++){
    const tr = Math.max(high[i]-low[i], Math.abs(high[i]-close[i-1]), Math.abs(low[i]-close[i-1]));
    trs.push(tr);
  }
  // simple moving average of TR
  const atrs:number[] = [];
  let sum=0;
  for(let i=0;i<trs.length;i++){
    sum += trs[i];
    if(i >= period) sum -= trs[i-period];
    if(i >= period-1) atrs.push(sum/period);
  }
  // pad to match length with nulls at front
  return atrs;
}

export function supertrend(high:number[], low:number[], close:number[], period=10, multiplier=3){
  // simplified supertrend implementation
  const atrArr = atr(high, low, close, period);
  const basicUpper:number[] = [];
  const basicLower:number[] = [];
  for(let i=period;i<close.length;i++){
    const hl2 = (high[i]+low[i])/2;
    const atrv = atrArr[i-period] || 0;
    basicUpper.push(hl2 + multiplier*atrv);
    basicLower.push(hl2 - multiplier*atrv);
  }
  // This simplified version returns last boolean: true if uptrend
  const lastClose = close[close.length-1];
  const lastUpper = basicUpper[basicUpper.length-1] || Number.MAX_VALUE;
  const lastLower = basicLower[basicLower.length-1] || 0;
  return { up: lastClose <= lastLower ? true : lastClose > lastUpper ? false : true };
}

export function adx(high:number[], low:number[], close:number[], period=14){
  // placeholder ADX calculation approximate — returns value >25 means trend
  // For now compute simple average true range ratio as proxy
  const atrArr = atr(high, low, close, period);
  const avgAtr = atrArr.length ? atrArr[atrArr.length-1] : 0;
  const lastRange = Math.abs(close[close.length-1]-close[close.length-2]||0);
  const proxy = avgAtr === 0 ? 0 : (lastRange/avgAtr)*100;
  return proxy; // higher means stronger
}

export function volumeConfirmation(volumes:number[], period=20){
  const recent = volumes.slice(-period);
  const avg = recent.reduce((a,b)=>a+b,0)/recent.length;
  const last = volumes[volumes.length-1];
  return last > avg;
}

export function breakoutDetection(high:number[], low:number[], close:number[], lookback=20){
  const recentHigh = Math.max(...high.slice(-lookback));
  const recentLow = Math.min(...low.slice(-lookback));
  const last = close[close.length-1];
  const breakoutUp = last > recentHigh;
  const breakoutDown = last < recentLow;
  return { breakoutUp, breakoutDown };
}
