import React, { useEffect, useState } from 'react'

export default function App(){
  const [status, setStatus] = useState('loading');

  useEffect(()=>{
    fetch('/api/health').then(r=>r.json()).then(d=>setStatus(d.status)).catch(()=>setStatus('error'))
  },[])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto p-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI Crypto Trading</h1>
          <div className="text-sm">Status: {status}</div>
        </header>

        <main className="mt-8">
          <section className="bg-slate-800 rounded p-4">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <p className="text-sm text-slate-300 mt-2">This is the initial scaffold. Frontend and backend are connected. Continue development to add trading features.</p>
          </section>
        </main>
      </div>
    </div>
  )
}
