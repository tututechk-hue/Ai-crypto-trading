import React, { useState } from 'react'

export default function BinanceConnect(){
  const [userId, setUserId] = useState('1');
  const [name, setName] = useState('My Testnet Account');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isTestnet, setIsTestnet] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleConnect(e: React.FormEvent){
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try{
      const res = await fetch('/api/binance/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, apiKey, apiSecret, isTestnet })
      });
      const data = await res.json();
      if(!res.ok) setMessage(JSON.stringify(data));
      else setMessage('Saved. Verified: ' + (data.verified ? 'yes' : 'no - check permissions'));
    }catch(e:any){
      setMessage('Error: ' + String(e));
    }finally{ setLoading(false); }
  }

  return (
    <section className="bg-slate-800 rounded p-4 max-w-xl">
      <h2 className="text-lg font-semibold">Connect Binance Account</h2>
      <form className="mt-4 space-y-3" onSubmit={handleConnect}>
        <div>
          <label className="text-sm">User ID (for demo)</label>
          <input className="w-full mt-1 p-2 rounded bg-slate-700" value={userId} onChange={e=>setUserId(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Account Name</label>
          <input className="w-full mt-1 p-2 rounded bg-slate-700" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">API Key</label>
          <input className="w-full mt-1 p-2 rounded bg-slate-700" value={apiKey} onChange={e=>setApiKey(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Secret Key</label>
          <input className="w-full mt-1 p-2 rounded bg-slate-700" value={apiSecret} onChange={e=>setApiSecret(e.target.value)} />
        </div>
        <div className="flex items-center space-x-2">
          <input id="testnet" type="checkbox" checked={isTestnet} onChange={e=>setIsTestnet(e.target.checked)} />
          <label htmlFor="testnet" className="text-sm">Use Testnet</label>
        </div>
        <div>
          <button className="px-4 py-2 bg-emerald-500 rounded" disabled={loading}>{loading ? 'Connecting...' : 'Connect & Verify'}</button>
        </div>
        {message && <div className="mt-2 text-sm text-amber-300">{message}</div>}
      </form>
    </section>
  )
}
