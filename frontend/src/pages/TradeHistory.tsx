import React, { useEffect, useState } from 'react'

export default function TradeHistory(){
  const [trades, setTrades] = useState<any[]>([]);
  useEffect(()=>{ fetch('/api/trades/history/1').then(r=>r.json()).then(d=>setTrades(d)); },[]);
  return (
    <section className="bg-slate-800 rounded p-4">
      <h2 className="text-lg font-semibold">Trade History</h2>
      <div className="mt-4 space-y-2">
        {trades.map(t=> (
          <div key={t.id} className="p-2 bg-slate-700 rounded">
            <div>{t.symbol} {t.side} {t.status}</div>
            <div className="text-xs text-slate-400">Entry: {t.entryPrice} | Qty: {t.qty} | PnL: {t.pnl}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
