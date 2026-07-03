import React, { useState } from 'react'

export default function Register(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  async function submit(e:any){
    e.preventDefault();
    const res = await fetch('/api/auth/register', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if(res.ok){ localStorage.setItem('token', data.token); alert('Registered'); }
    else alert(JSON.stringify(data));
  }
  return (
    <section className="bg-slate-800 rounded p-4 max-w-md">
      <h2 className="text-lg font-semibold">Register</h2>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        <div>
          <label className="text-sm">Email</label>
          <input className="w-full mt-1 p-2 rounded bg-slate-700" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Password</label>
          <input type="password" className="w-full mt-1 p-2 rounded bg-slate-700" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <div>
          <button className="px-4 py-2 bg-emerald-500 rounded">Register</button>
        </div>
      </form>
    </section>
  )
}
