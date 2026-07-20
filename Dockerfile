# Stage 1: Build Frontend
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Runner
FROM node:20
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./
# Copy built frontend assets into backend for serving
COPY --from=frontend-builder /app/frontend/dist ./dist

ENV NODE_ENV=production
ENV PORT=5001
ENV DATABASE_PATH=/app/data/myfinans.db

EXPOSE 5001

CMD ["npm", "start"]
