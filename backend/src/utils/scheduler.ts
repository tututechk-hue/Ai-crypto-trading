import prisma from './prismaClient';
import { trainScorer } from './services/ai';

// Simple scheduler for periodic jobs
export function startSchedulers(){
  // retrain AI scorer every 6 hours
  setInterval(async ()=>{
    try{
      console.log('AI trainer: starting retrain');
      await trainScorer();
      console.log('AI trainer: finished');
    }catch(e){ console.error('AI trainer error', e); }
  }, 1000 * 60 * 60 * 6);

  // cleanup old signals daily
  setInterval(async ()=>{
    try{
      const cutoff = new Date(Date.now() - 1000*60*60*24*30); // 30 days
      await prisma.signal.deleteMany({ where: { createdAt: { lt: cutoff } } });
      console.log('Cleanup: old signals removed');
    }catch(e){ console.error('cleanup error', e); }
  }, 1000 * 60 * 60 * 24);
}
