import prisma from '../prismaClient';

export function positionSizeFromRisk(balance:number, riskPercent:number, stopDistance:number, price:number){
  // riskPercent is percent of balance willing to risk (e.g., 1 means 1%)
  // stopDistance is absolute price distance between entry and stop
  // price is entry price
  // position value = (balance * riskPercent/100) / (stopDistance / price)
  if(stopDistance <= 0 || price <= 0) return 0;
  const riskAmount = balance * (riskPercent/100);
  const positionValue = riskAmount / (stopDistance / price); // in asset units
  const qty = Math.max( (positionValue / price), 0);
  return Number(qty.toFixed(3));
}

export function atrStopPrice(entryPrice:number, atr:number, multiplier=1.5, side:'BUY'|'SELL'){
  if(side === 'BUY'){
    return Number((entryPrice - atr*multiplier).toFixed(8));
  } else {
    return Number((entryPrice + atr*multiplier).toFixed(8));
  }
}
