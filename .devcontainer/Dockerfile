FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Copy package files first for better layer caching
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Pre-install dependencies (use ci when lock file is present, otherwise install)
RUN if [ -f backend/package-lock.json ]; then cd backend && npm ci --omit=dev; else cd backend && npm install --omit=dev; fi
RUN if [ -f frontend/package-lock.json ]; then cd frontend && npm ci; else cd frontend && npm install; fi

# Copy all source files
COPY . .

# Expose ports
EXPOSE 4000 3000

# Default shell
SHELL ["/bin/bash", "-c"]
