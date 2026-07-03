import React, { useEffect, useState } from 'react'
import { connectWS } from '../ws'

export default function LiveTrades(){
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(()=>{
    const ws = connectWS();
    ws.onmessage = (ev)=>{
      try{ const data = JSON.parse(ev.data); setMessages(m=>[data,...m].slice(0,50)); }catch(e){}
    }
    return ()=>{ ws.close(); }
  },[]);

  return (
    <section className="bg-slate-800 rounded p-4">
      <h2 className="text-lg font-semibold">Live Trades / Events</h2>
      <div className="mt-4 space-y-2">
        {messages.map((m,i)=> (
          <div key={i} className="p-2 bg-slate-700 rounded"><pre className="text-xs">{JSON.stringify(m)}</pre></div>
        ))}
      </div>
    </section>
  )
}
