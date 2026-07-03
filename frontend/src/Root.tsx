import React from 'react'
import App from './App'
import Login from './pages/Login'
import Register from './pages/Register'

export default function Root(){
  // simple nav: shows register/login and main app
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if(!token) return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
      <div className="space-y-4">
        <Login />
        <Register />
      </div>
    </div>
  )
  return <App />
}
