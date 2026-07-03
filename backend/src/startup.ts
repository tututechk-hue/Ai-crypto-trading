import { spawnSync } from 'child_process';
import path from 'path';

// Try running Prisma migrate deploy; if it fails (no migrations), fallback to db push
try {
  console.log('Running Prisma migrate deploy...');
  const res = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    stdio: 'inherit',
    cwd: path.join(process.cwd(), 'backend')
  });

  if (res.error) {
    console.error('Error running migrations:', res.error);
  }

  if (res.status !== 0) {
    console.warn('prisma migrate deploy failed or no migrations found, attempting prisma db push');
    const pushRes = spawnSync('npx', ['prisma', 'db', 'push'], {
      stdio: 'inherit',
      cwd: path.join(process.cwd(), 'backend')
    });
    if(pushRes.status !== 0){
      console.error('prisma db push failed', pushRes.error);
    } else {
      console.log('prisma db push succeeded');
    }
  } else {
    console.log('Migrations applied successfully.');
  }
} catch (e) {
  console.error('Migration failed', e);
}

// Start the main server
require('./index.js');
