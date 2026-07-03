import React, { useEffect, useState } from 'react'

export default function AIStats(){
  const [threshold, setThreshold] = useState<number | null>(null);
  useEffect(()=>{
    fetch('/api/app/settings').then(r=>r.json()).then((s:any)=>{
      const t = s.find((x:any)=>x.key==='ai:executionThreshold');
      setThreshold(t ? Number(t.value) : 75);
    });
  },[]);
  return (
    <section className="bg-slate-800 rounded p-4">
      <h2 className="text-lg font-semibold">AI Statistics</h2>
      <div className="mt-4">Execution Threshold: <strong>{threshold}</strong></div>
      <p className="text-sm text-slate-300 mt-2">The AI trainer adjusts this threshold periodically based on recent trade performance.</p>
    </section>
  )
}
