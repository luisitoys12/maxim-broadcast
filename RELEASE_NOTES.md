# Release Notes

## v1.1.0 — Backend + Frontend Funcional

**Fecha:** Abril 2026  
**Tipo:** Feature Release

### Nuevo en esta versión

#### Icono Oficial
- Nuevo icono propio de Maxim Broadcast — onda de señal en forma de M con gradiente azul/morado sobre fondo oscuro
- Disponible en `assets/` en múltiples resoluciones (128, 256, 512, 1024 px)
- Favicon integrado en el panel web

#### Backend completo (Node.js)
- **Autenticación JWT** — registro, login, tokens con expiración de 24h
- **Middleware de protección** — todas las rutas requieren token válido
- **Controllers corregidos** — bug de contexto `this` resuelto con arrow functions
- **Upload real con Multer** — archivos video/audio/imagen hasta 500 MB, eliminación con limpieza en disco
- **UUIDs** en todos los recursos (escenas, fuentes, medios, perfiles)
- **Servidor unificado** — sirve frontend compilado + API en el puerto 4000

#### Frontend completo (React + Vite)
- **Login/Registro** — página de autenticación con tabs, persistencia de sesión
- **Dashboard** — stats en tiempo real via WebSocket (FPS, bitrate, CPU, frames perdidos)
- **Escenas** — crear, activar, eliminar; indicador visual de escena activa
- **Streaming** — configuración de perfiles RTMP (plataforma, servidor, key, encoder, resolución, FPS)
- **Biblioteca de Medios** — upload de archivos, tabla con tipo/tamaño/fecha, eliminar
- **Playout 24/7** — programar contenido con hora, duración, repetición (diaria/semanal/loop), toggle on/off
- **Sidebar** — navegación con indicador de conexión WebSocket, botón de logout
- Migrado de `react-scripts` a **Vite 4** (build 3x más rápido)

### API Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Usuario actual |
| GET | `/api/obs/status` | Estado OBS |
| POST | `/api/obs/start` | Iniciar stream |
| POST | `/api/obs/stop` | Detener stream |
| POST | `/api/obs/start-recording` | Iniciar grabación |
| POST | `/api/obs/stop-recording` | Detener grabación |
| GET/POST | `/api/scenes` | Listar / Crear escenas |
| PUT/DELETE | `/api/scenes/:id` | Actualizar / Eliminar escena |
| POST | `/api/scenes/:id/activate` | Activar escena |
| GET/POST | `/api/scenes/:id/sources` | Fuentes de escena |
| PUT/DELETE | `/api/sources/:id` | Actualizar / Eliminar fuente |
| GET/POST | `/api/stream/profiles` | Perfiles de streaming |
| PUT/DELETE | `/api/stream/profiles/:id` | Actualizar / Eliminar perfil |
| GET | `/api/media` | Biblioteca de medios |
| POST | `/api/media/upload` | Subir archivo (multipart) |
| DELETE | `/api/media/:id` | Eliminar archivo |
| GET/POST | `/api/playout/schedule` | Programación playout |
| PUT/DELETE | `/api/playout/schedule/:id` | Actualizar / Eliminar ítem |

### Correr en local

```bash
# Backend (sirve también el frontend en :4000)
cd backend
cp .env.example .env   # editar JWT_SECRET en producción
npm install
node src/index.js

# Frontend (solo desarrollo con hot-reload)
cd frontend
npm install
npm run dev            # corre en :3000 con proxy al backend
```

---

## v1.0.0 — Lanzamiento Oficial

**Fecha:** Marzo 2026  
**Tipo:** Initial Release

- Fork de OBS Studio con base para broadcast profesional
- Estructura inicial del backend Node.js
- Estructura inicial del frontend React
- Documentación de roadmap Fases 1–11
- Lower Thirds, Templates, Editor Dual, Multi-Cámara, IA, Automatización (planificados)
