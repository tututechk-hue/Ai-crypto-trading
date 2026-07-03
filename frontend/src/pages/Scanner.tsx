import React, { useEffect, useState } from 'react'

export default function Scanner(){
  const [signals, setSignals] = useState<any[]>([]);

  async function load(){
    const res = await fetch('/api/bot/signals/1');
    const data = await res.json();
    setSignals(data);
  }

  useEffect(()=>{ load(); },[]);

  async function startBot(){
    await fetch('/api/bot/start', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: 1 }) });
  }

  async function stopBot(){
    await fetch('/api/bot/stop', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: 1 }) });
  }

  return (
    <section className="bg-slate-800 rounded p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">AI Scanner</h2>
        <div>
          <button className="mr-2 px-3 py-1 bg-emerald-500 rounded" onClick={startBot}>Start Bot</button>
          <button className="px-3 py-1 bg-red-600 rounded" onClick={stopBot}>Stop Bot</button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm text-slate-300">Signals</h3>
        <div className="mt-2 grid grid-cols-1 gap-2">
          {signals.map(s=> (
            <div key={s.id} className="p-2 bg-slate-700 rounded flex justify-between">
              <div>{s.symbol} <span className="text-xs text-slate-400">{s.timeframe}</span></div>
              <div className="text-amber-300">Score: {s.score}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
