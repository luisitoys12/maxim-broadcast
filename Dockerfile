# ─── Stage 1: Build frontend ───────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ─── Stage 2: Production image ─────────────────
FROM node:20-alpine
WORKDIR /app

# Install backend deps
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY backend/src ./src
COPY backend/.env.example .env.example

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/dist ./public

# Copy icon
COPY assets/icon.png ./public/icon.png 2>/dev/null || true

# Create uploads dir
RUN mkdir -p uploads/media logs

# Runtime config
ENV NODE_ENV=production \
    PORT=4000 \
    FRONTEND_URL=http://localhost:4000 \
    MEDIA_STORAGE_PATH=./uploads/media

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "src/index.js"]
