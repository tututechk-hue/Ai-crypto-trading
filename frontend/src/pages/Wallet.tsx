import React, { useState } from 'react'

export default function Wallet(){
  const [balances, setBalances] = useState<any[]>([]);
  async function load(){
    const res = await fetch('/api/binance/accounts/1');
    const data = await res.json();
    setBalances(data);
  }
  return (
    <section className="bg-slate-800 rounded p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Wallet</h2>
        <button className="px-3 py-1 bg-sky-600 rounded" onClick={load}>Refresh</button>
      </div>
      <div className="mt-4">
        <pre className="text-xs">{JSON.stringify(balances,null,2)}</pre>
      </div>
    </section>
  )
}
