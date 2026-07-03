import prisma from '../prismaClient';

// lightweight AI scorer & trainer
// The scorer uses historical trades and signals to compute weights per confirmation

export async function scoreSignal(signal:any){
  // simple heuristic: use signal.score (0-100) and stored strategy weight
  // fetch global threshold
  const thresholdSetting = await prisma.setting.findUnique({ where: { key: 'ai:executionThreshold' } });
  const threshold = thresholdSetting ? Number(thresholdSetting.value) : 75;
  // clamp
  const score = signal.score || 0;
  const ok = score >= threshold;
  return { score, ok, threshold };
}

export async function trainScorer(){
  // very simple trainer: analyze recent closed trades and their entry signals to adjust threshold
  const records = await prisma.aiRecord.findMany({ where: { label: { not: null } }, take: 1000, orderBy: { createdAt: 'desc' } });
  if(records.length < 20) return; // not enough data
  let totalWins = 0; let total = 0;
  for(const r of records){
    if(!r.score) continue;
    total++;
    if(r.label === 'win') totalWins++;
  }
  const winRate = total === 0 ? 0 : (totalWins/total)*100;
  // adjust threshold: higher winrate => increase threshold slightly
  let newThreshold = winRate + 20; // simple heuristic
  newThreshold = Math.max(60, Math.min(90, Math.round(newThreshold)));
  await prisma.setting.upsert({ where: { key: 'ai:executionThreshold' }, update: { value: String(newThreshold) }, create: { key: 'ai:executionThreshold', value: String(newThreshold) } });
  console.log('AI trainer: set executionThreshold ->', newThreshold);
}
