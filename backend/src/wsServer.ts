import WebSocket from 'ws';
import http from 'http';

let wss: WebSocket.Server | null = null;

export function setupWSServer(server: http.Server){
  wss = new WebSocket.Server({ server, path: '/ws' });
  wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
      // simple echo or auth could be added
      try{ const payload = JSON.parse(msg.toString()); if(payload.type === 'ping') ws.send(JSON.stringify({ type:'pong' })); }catch(e){}
    });
  });
  console.log('WebSocket server started');
}

export function broadcast(payload: any){
  if(!wss) return;
  const data = JSON.stringify(payload);
  wss.clients.forEach((c)=>{ if(c.readyState === WebSocket.OPEN) c.send(data); });
}
