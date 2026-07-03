#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
(async ()=>{
  try{
    const dataDir = path.join(process.cwd(),'data');
    if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const dbFile = path.join(dataDir,'dev.db');
    if(!fs.existsSync(dbFile)){ console.error('No DB file found at', dbFile); process.exit(1); }
    const backupsDir = path.join(process.cwd(),'backups');
    if(!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g,'-');
    const dest = path.join(backupsDir, `dev-${ts}.db`);
    fs.copyFileSync(dbFile, dest);
    console.log('Backup created at', dest);
  }catch(e){ console.error('Backup failed', e); process.exit(1); }
})();
