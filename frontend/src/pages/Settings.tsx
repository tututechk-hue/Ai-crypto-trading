import React, { useState } from 'react'

export default function Settings(){
  const [mode, setMode] = useState('testnet');
  const [email, setEmail] = useState('');
  async function save(){
    // for now just local
    alert('Settings saved (demo)');
  }
  return (
    <section className="bg-slate-800 rounded p-4 max-w-xl">
      <h2 className="text-lg font-semibold">Settings</h2>
      <div className="mt-4">
        <label className="text-sm">Trading Mode</label>
        <select className="w-full mt-1 p-2 rounded bg-slate-700" value={mode} onChange={e=>setMode(e.target.value)}>
          <option value="testnet">Testnet</option>
          <option value="live">Live (requires confirmation)</option>
        </select>
      </div>
      <div className="mt-4">
        <label className="text-sm">Notification Email</label>
        <input className="w-full mt-1 p-2 rounded bg-slate-700" value={email} onChange={e=>setEmail(e.target.value)} />
      </div>
      <div className="mt-4">
        <button className="px-4 py-2 bg-emerald-500 rounded" onClick={save}>Save Settings</button>
      </div>
    </section>
  )
}
