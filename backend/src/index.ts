import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import prisma from './prismaClient';
import binanceRouter from './routes/binance';
import botRouter from './routes/bot';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import settingsRouter from './routes/settings';
import http from 'http';
import { setupWSServer } from './wsServer';
import { startSchedulers } from './utils/scheduler';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const app = express();
app.use(cors());
app.use(express.json());

// Ensure /data exists
const dataDir = path.join(process.cwd(),'data');
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Simple health check
app.get('/api/health', async (req, res) => {
  try {
    // quick db check
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ status: 'error', error: String(e) });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/binance', binanceRouter);
app.use('/api/bot', botRouter);
app.use('/api/admin', adminRouter);
app.use('/api/app', settingsRouter);

// Serve frontend static files
const frontDist = path.join(process.cwd(),'frontend','dist');
if(fs.existsSync(frontDist)){
  app.use(express.static(frontDist));
  app.get('/', (req,res) => res.sendFile(path.join(frontDist,'index.html')));
}

const server = http.createServer(app);
setupWSServer(server);

// start schedulers
startSchedulers();

// Start server
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
