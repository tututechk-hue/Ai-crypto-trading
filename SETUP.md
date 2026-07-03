# Scripts for repository

# Backend
cd backend
npm install
npm run migration:dev # local development migrations
npm run build
npm start

# Frontend
cd frontend
npm install
npm run dev

# Docker
docker build -t ai-crypto-trading .
