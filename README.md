# AI Crypto Trading

Complete Binance AI Auto Trading Bot (Testnet + Live) — SQLite mode

This repository contains a full-stack trading platform scaffold and implementation targeting Binance Futures USDT and Spot, with Testnet support. The project uses SQLite stored in /data by default.

Important: For production, use a persistent disk on Render or a managed database. This project defaults to SQLite file at ./data/dev.db and includes backup/restore scripts.

Quick start (local)
1. Clone and checkout the feature branch:
   - git clone git@github.com:tututechk-hue/ai-crypto-trading.git
   - cd ai-crypto-trading
   - git checkout feature/trading-engine

2. Backend
   - cd backend
   - cp .env.example .env
   - Edit .env and set:
     - DATABASE_URL="file:./data/dev.db"
     - JWT_SECRET (openssl rand -hex 32)
     - ENCRYPTION_KEY (openssl rand -base64 32)
   - npm install
   - npx prisma generate
   - npx prisma migrate dev --name init
   - npm run dev

3. Frontend
   - cd ../frontend
   - npm install
   - npm run dev
   - Open http://localhost:5173

Backups
- Create a backup: node backend/scripts/backup.js
- Restore latest backup: node backend/scripts/restore.js

Render
- The repo includes a Dockerfile and render.yaml. On Render, ensure you configure environment variables and provide a persistent disk for /data if you need to persist SQLite between deploys.

Security
- Do NOT commit JWT_SECRET or ENCRYPTION_KEY. Store them in Render environment variables.

