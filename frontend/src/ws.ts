export function connectWS(){
  const loc = window.location;
  const protocol = loc.protocol === 'https:' ? 'wss' : 'ws';
  const wsUrl = `${protocol}://${loc.host}/ws`;
  const ws = new WebSocket(wsUrl);
  ws.onopen = ()=>{ console.log('ws open'); ws.send(JSON.stringify({ type: 'ping' })); };
  ws.onclose = ()=>{ console.log('ws closed'); };
  ws.onerror = (e)=>{ console.error('ws error', e); };
  return ws;
}
