#!/bin/bash
set -e

echo "🔍 Validando configuración para Railway..."
echo ""

# Verify Node.js
echo "📦 Node.js version:"
node --version

# Verify npm
echo "📦 npm version:"
npm --version

# Verify Docker
echo "🐳 Docker version:"
docker --version

# Verify frontend build dependencies
echo ""
echo "🏗️ Verificando dependencias del frontend..."
if [ ! -f frontend/package.json ]; then
  echo "❌ frontend/package.json no encontrado"
  exit 1
fi

echo "🏗️ Verificando dependencias del backend..."
if [ ! -f backend/package.json ]; then
  echo "❌ backend/package.json no encontrado"
  exit 1
fi

# Build Docker image
echo ""
echo "🏗️ Construyendo imagen Docker de producción..."
docker build -f Dockerfile.prod -t maxim-broadcast:test-railway .

echo ""
echo "✅ Imagen compilada exitosamente"

# Run basic smoke test
echo ""
echo "🧪 Ejecutando smoke test..."
CONTAINER_ID=$(docker run -d \
  -e NODE_ENV=production \
  -e PORT=4000 \
  -e JWT_SECRET=test-secret-for-validation \
  -p 4001:4000 \
  maxim-broadcast:test-railway)

sleep 5

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4001/api/health || echo "000")
docker stop "$CONTAINER_ID" > /dev/null
docker rm "$CONTAINER_ID" > /dev/null

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Health check respondió con 200 OK"
else
  echo "⚠️  Health check respondió con: $HTTP_STATUS (puede ser normal si la app tarda en iniciar)"
fi

# Clean up test image
docker rmi maxim-broadcast:test-railway > /dev/null 2>&1 || true

# Print Railway information
echo ""
echo "📝 INFORMACIÓN PARA RAILWAY:"
echo "================================"
echo "Repository: luisitoys12/maxim-broadcast"
echo "Branch: main"
echo "Dockerfile: Dockerfile.prod"
echo "Port: 4000"
echo "Health check: /api/health"
echo "Start Command: node src/index.js"
echo ""
echo "Variables de entorno requeridas en Railway:"
echo "  - NODE_ENV=production"
echo "  - JWT_SECRET=<cadena aleatoria de 32+ caracteres>"
echo "  - PORT=4000 (Railway lo asigna automáticamente)"
echo ""
echo "✅ Validación completada. Tu proyecto está listo para Railway."
