# 🚀 Guía de Despliegue en Railway

Maxim Broadcast está configurado para desplegarse en **Railway.app** con un solo clic o de forma automática desde GitHub.

---

## ⚡ Deploy con 1 Clic

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/luisitoys12/maxim-broadcast)

---

## 📋 Requisitos Previos

- Cuenta en [Railway.app](https://railway.app) (gratis con $5/mes de crédito)
- Cuenta en [GitHub](https://github.com)
- Fork o copia de este repositorio

---

## 🛠️ Pasos de Despliegue Manual

### 1. Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app) → **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Elige `luisitoys12/maxim-broadcast`
4. Railway detectará el `Dockerfile.prod` automáticamente

### 2. Configurar Variables de Entorno

En el panel de Railway → tu servicio → pestaña **"Variables"**, agrega:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Entorno de producción |
| `PORT` | `4000` | Puerto (Railway lo asigna automáticamente) |
| `JWT_SECRET` | *(cadena aleatoria de 32+ caracteres)* | **Requerido** — clave secreta para tokens |
| `DB_TYPE` | `sqlite` | Base de datos (SQLite incluida) |
| `DB_PATH` | `./db/maxim.db` | Ruta del archivo SQLite |
| `DEMO_MODE` | `false` | Activar datos de demo |
| `LOG_LEVEL` | `info` | Nivel de logs |

> 💡 **Generar JWT_SECRET:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3. Obtener URL Pública

Después del primer deploy, Railway te asigna una URL como:
```
https://maxim-broadcast-production-XXXX.railway.app
```

Agrega esta URL como variable de entorno:

| Variable | Valor |
|----------|-------|
| `FRONTEND_URL` | `https://tu-app.railway.app` |
| `CORS_ORIGIN` | `https://tu-app.railway.app` |

### 4. Primer Acceso

Después del deploy, visita tu URL pública. Las credenciales iniciales aparecen en los **logs de Railway**:

```
📧 Email:    admin@maxim.local
🔑 Password: <generada automáticamente>
```

> ⚠️ **Cambia la contraseña** en el primer login.

---

## 🔄 Deploy Automático con GitHub Actions

Para que cada push a `main` despliegue automáticamente a Railway:

### 1. Obtener Railway Token

1. Ve a [railway.app/account/tokens](https://railway.app/account/tokens)
2. Crea un nuevo token → cópialo

### 2. Agregar Token a GitHub

1. En tu repositorio → **Settings** → **Secrets and variables** → **Actions**
2. Crea un nuevo secreto llamado `RAILWAY_TOKEN`
3. Pega el token de Railway

El workflow `.github/workflows/railway-deploy.yml` se ejecutará automáticamente en cada push a `main`.

---

## 🐳 Testing Local con Docker

Prueba la imagen de producción localmente antes de desplegar:

```bash
# Build y ejecutar con docker-compose
docker compose -f docker-compose.prod.yml up --build

# O directamente con Docker
docker build -f Dockerfile.prod -t maxim-broadcast:prod .
docker run -p 4000:4000 \
  -e JWT_SECRET=mi-secreto-local \
  -e NODE_ENV=production \
  maxim-broadcast:prod
```

Accede en: **http://localhost:4000**

### Validación pre-deploy

```bash
chmod +x scripts/validate-railway.sh
./scripts/validate-railway.sh
```

---

## 🗄️ Base de Datos y Almacenamiento

### SQLite (Plan Gratuito)
- Archivo: `/app/backend/db/maxim.db`
- Railway persiste los datos en volúmenes automáticamente
- Gratis hasta 0.5 GB

### PostgreSQL (Upgrade)
Si necesitas más capacidad, agrega un servicio PostgreSQL en Railway y configura:
```
DATABASE_URL=postgresql://user:pass@host:5432/maxim
DB_TYPE=postgres
```

---

## 📊 Monitoreo

En Railway dashboard puedes ver:
- ✅ **Logs en tiempo real** — pestaña "Logs"
- ✅ **Métricas CPU/RAM** — pestaña "Metrics"
- ✅ **Health checks** — verde cuando el servicio responde en `/api/health`
- ✅ **Restart automático** — si el servicio falla

---

## 🔧 Troubleshooting

### El deploy falla con error de Docker
Verifica que `Dockerfile.prod` esté en la raíz del repositorio y que el build del frontend funcione:
```bash
docker build -f Dockerfile.prod -t test .
```

### La aplicación no responde
Revisa los logs de Railway. Verifica que `JWT_SECRET` esté configurado — sin él la app no inicia correctamente.

### Health check falla
La app tarda ~30s en iniciar. Si el health check falla inmediatamente, revisa que el `PORT` configurado en Railway coincida con el puerto que expone la app (`4000`).

### No puedo hacer login
Las credenciales del admin se generan en el **primer deploy** y aparecen en los logs. Si no las guardaste, elimina el archivo `maxim.db` (en el volumen de Railway) y redespliega para regenerarlas.

---

## 📈 Plan de Railway y Costos

| Plan | CPU | RAM | Storage | Precio |
|------|-----|-----|---------|--------|
| **Hobby** (gratis) | Compartido | 512 MB | 1 GB | $5 crédito/mes |
| **Pro** | 8 vCPU | 32 GB | 100 GB | $20/mes |

Para uso de producción con audiencia real, el plan Pro es recomendado.

---

## 🔗 URLs Post-Despliegue

| Endpoint | URL |
|----------|-----|
| Panel Web | `https://tu-app.railway.app` |
| API REST | `https://tu-app.railway.app/api` |
| Health Check | `https://tu-app.railway.app/api/health` |
| WebSocket | `wss://tu-app.railway.app` |

---

## 🔄 Actualizar la Aplicación

Con GitHub Actions configurado, cada push a `main` despliega automáticamente.

Para actualizar manualmente:
1. Ve a Railway dashboard → tu servicio
2. Click en **"Deploy"** → **"Trigger Deploy"**

---

## 📞 Soporte

- **Issues:** [github.com/luisitoys12/maxim-broadcast/issues](https://github.com/luisitoys12/maxim-broadcast/issues)
- **Railway Docs:** [docs.railway.app](https://docs.railway.app)
