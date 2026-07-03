import { spawnSync } from 'child_process';
import path from 'path';

// Run Prisma migrations at startup (safe for first-run: will create the sqlite file)
try {
  console.log('Running Prisma migrate deploy...');
  const res = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    stdio: 'inherit',
    cwd: path.join(process.cwd(), 'backend')
  });

  if (res.error) {
    console.error('Error running migrations:', res.error);
  } else if (res.status !== 0) {
    console.error('Prisma migrate exited with status', res.status);
  } else {
    console.log('Migrations applied successfully.');
  }
} catch (e) {
  console.error('Migration failed', e);
}

// Start the main server
require('./index.js');
