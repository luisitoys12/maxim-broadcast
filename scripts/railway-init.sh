#!/bin/bash
set -e

echo "🚀 Iniciando Maxim Broadcast en Railway..."

# Create data directories if they don't exist
mkdir -p /app/backend/db
mkdir -p /app/backend/uploads/media
mkdir -p /app/backend/logs

echo "📁 Directorios de datos creados"

# Initialize database if it doesn't exist
if [ ! -f /app/backend/db/maxim.db ]; then
  echo "📊 Inicializando base de datos..."
  node /app/backend/scripts/init-db.js
  echo "✅ Base de datos inicializada"
else
  echo "📊 Base de datos existente encontrada"
fi

# Generate JWT_SECRET if not set — warn clearly that this is ephemeral
if [ -z "$JWT_SECRET" ]; then
  export JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  echo "⚠️  WARNING: JWT_SECRET was not set. A temporary secret has been generated for this run."
  echo "   All sessions will be invalidated on restart. Set JWT_SECRET permanently in Railway variables."
fi

echo "✅ Setup completado"
if [ -n "$RAILWAY_PUBLIC_DOMAIN" ]; then
  echo "🌐 Accesible en: https://$RAILWAY_PUBLIC_DOMAIN"
fi
