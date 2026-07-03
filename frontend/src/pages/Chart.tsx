import React, { useEffect, useRef } from 'react'
import { createChart, CrosshairMode } from 'lightweight-charts'

export default function ChartPage(){
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(()=>{
    const container = ref.current!;
    const chart = createChart(container, { width: container.clientWidth, height: 400, layout: { backgroundColor: '#0f1724', textColor: '#d1d5db' }, crosshair: { mode: CrosshairMode.Normal } });
    const candleSeries = chart.addCandlestickSeries();

    async function load(){
      const res = await fetch('/api/binance/klines?symbol=BTCUSDT&interval=1m&limit=500');
      const data = await res.json();
      const series = data.map((d:any)=>({ time: Math.floor(d.openTime/1000), open: d.open, high: d.high, low: d.low, close: d.close }));
      candleSeries.setData(series);
    }
    load();

    const handleResize = ()=>{ chart.applyOptions({ width: container.clientWidth }); };
    window.addEventListener('resize', handleResize);
    return ()=>{ window.removeEventListener('resize', handleResize); chart.remove(); };
  },[]);

  return (
    <section className="bg-slate-800 rounded p-4">
      <h2 className="text-lg font-semibold">Chart</h2>
      <div ref={ref as any} className="mt-4" style={{ width: '100%' }} />
    </section>
  )
}
