#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
(async ()=>{
  try{
    const backupsDir = path.join(process.cwd(),'backups');
    if(!fs.existsSync(backupsDir)){ console.error('No backups directory'); process.exit(1); }
    const files = fs.readdirSync(backupsDir).filter(f=>f.endsWith('.db')).sort().reverse();
    if(files.length === 0){ console.error('No backups found'); process.exit(1); }
    const latest = files[0];
    const src = path.join(backupsDir, latest);
    const dataDir = path.join(process.cwd(),'data');
    if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const dest = path.join(dataDir,'dev.db');
    fs.copyFileSync(src, dest);
    console.log('Restored', src, 'to', dest);
  }catch(e){ console.error('Restore failed', e); process.exit(1); }
})();
