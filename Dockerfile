FROM node:18-alpine AS builder
WORKDIR /app

# Install backend deps & build
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci
COPY backend ./backend
RUN cd backend && npm run build

# Build frontend
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci
COPY frontend ./frontend
RUN cd frontend && npm run build

# Final image
FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/package.json ./backend/package.json

ENV NODE_ENV=production
EXPOSE 8080

# Start the backend which will serve the frontend static files
CMD ["node","backend/dist/index.js"]
