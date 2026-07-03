// add to App navigation and export
import React, { useEffect, useState } from 'react'
import BinanceConnect from './pages/BinanceConnect'
import ScannerPage from './pages/Scanner'
import LiveTrades from './pages/LiveTrades'
import Wallet from './pages/Wallet'
import Settings from './pages/Settings'
import AIStats from './pages/AIStats'
import TradeHistory from './pages/TradeHistory'
import AdminDashboard from './pages/AdminDashboard'
import ChartPage from './pages/Chart'

export default function App(){
  const [page, setPage] = useState<'dashboard'|'connect'|'scanner'|'live'|'wallet'|'settings'|'aistats'|'history'|'admin'|'chart'>('dashboard');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto p-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI Crypto Trading</h1>
          <nav>
            <button className="mr-2 px-3 py-1 bg-slate-700 rounded" onClick={()=>setPage('dashboard')}>Dashboard</button>
            <button className="mr-2 px-3 py-1 bg-slate-600 rounded" onClick={()=>setPage('scanner')}>AI Scanner</button>
            <button className="mr-2 px-3 py-1 bg-sky-600 rounded" onClick={()=>setPage('live')}>Live Trades</button>
            <button className="mr-2 px-3 py-1 bg-indigo-600 rounded" onClick={()=>setPage('chart')}>Chart</button>
            <button className="mr-2 px-3 py-1 bg-indigo-600 rounded" onClick={()=>setPage('aistats')}>AI Stats</button>
            <button className="mr-2 px-3 py-1 bg-emerald-600 rounded" onClick={()=>setPage('history')}>Trade History</button>
            <button className="mr-2 px-3 py-1 bg-rose-600 rounded" onClick={()=>setPage('wallet')}>Wallet</button>
            <button className="mr-2 px-3 py-1 bg-amber-600 text-slate-900 rounded" onClick={()=>setPage('connect')}>Binance Connect</button>
            <button className="px-3 py-1 bg-slate-500 rounded" onClick={()=>setPage('settings')}>Settings</button>
          </nav>
        </header>

        <main className="mt-8">
          {page === 'dashboard' && (
            <section className="bg-slate-800 rounded p-4">
              <h2 className="text-lg font-semibold">Dashboard</h2>
              <p className="text-sm text-slate-300 mt-2">This is an in-progress trading platform. Connect your Binance Testnet account to begin, then start the bot from the AI Scanner page.</p>
            </section>
          )}

          {page === 'connect' && <BinanceConnect />}
          {page === 'scanner' && <ScannerPage />}
          {page === 'live' && <LiveTrades />}
          {page === 'wallet' && <Wallet />}
          {page === 'settings' && <Settings />}
          {page === 'aistats' && <AIStats />}
          {page === 'history' && <TradeHistory />}
          {page === 'admin' && <AdminDashboard />}
          {page === 'chart' && <ChartPage />}
        </main>
      </div>
    </div>
  )
}
