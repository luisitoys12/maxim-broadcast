# Changelog — Maxim Broadcast

Todos los cambios notables de este proyecto están documentados en este archivo.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [v1.4.0] — Ultra Beta — Abril 2026

### ✨ Nuevo
- **RadioSync completamente integrado** — cabina inteligente con IA para conducción de radio en vivo
- **Conducción IA autónoma** — genera intervenciones y locuciones sin necesidad de operador humano
- **Integración WhatsApp** — recepción de mensajes en tiempo real desde oyentes/espectadores
- **Boletín de noticias con IA** — voces Microsoft TTS para lectura automática de noticias
- **Métricas en tiempo real** — panel de oyentes activos, mensajes/min y nivel de interacción
- **Filtro de spam automático** — clasificación y organización de mensajes por prioridad
- **Dashboard mejorado** — stats de FPS, bitrate y CPU actualizados en tiempo real vía WebSocket
- **Playout 24/7 mejorado** — programación automática de contenido con soporte diario/semanal/loop
- **Biblioteca de medios avanzada** — upload de video, audio e imagen hasta 500 MB
- **Escenas y fuentes mejoradas** — gestión completa con indicadores visuales de escena activa
- **Autenticación JWT mejorada** — login seguro multidispositivo con tokens de 24 h
- **WebSocket real-time** — actualizaciones de estado sin recargar la página
- **Icono oficial** — logo profesional M con gradiente azul/morado
- **Instaladores multiplataforma** — `.exe` (Windows), `.deb` (Debian/Ubuntu), `.dmg` (macOS), AppImage

### 🔧 Mejorado
- Build del frontend migrado de `react-scripts` a **Vite 4** (compilación 3× más rápida)
- Backend unificado — sirve frontend compilado y API en el puerto 4000
- Scripts de build por plataforma (`build-windows.sh`, `build-linux.sh`, `build-macos.sh`, `build-all.sh`)
- GitHub Actions actualizado para compilar y publicar releases automáticamente al crear un tag `v*`
- Instalador NSIS para Windows con wizard visual completo (Welcome → Licencia → Directorio → Instalar → Finish)

### 🐛 Corregido
- Bug de contexto `this` en controllers del backend resuelto con arrow functions
- Limpieza de archivos en disco al eliminar medios desde la biblioteca
- Tokens JWT invalidados correctamente al cerrar sesión

---

## [v1.3.1] — Parche de Estabilidad — Marzo 2026

### 🔧 Mejorado
- Mejoras de rendimiento en el panel web
- Correcciones menores de UI en móvil

### 🐛 Corregido
- Reconexión automática de WebSocket al perder conexión
- Manejo de errores en endpoints de streaming

---

## [v1.3.0] — RadioSync IA — Marzo 2026

### ✨ Nuevo
- **RadioSync** — módulo completo de cabina inteligente para radio en vivo
- **Conducción autónoma con IA** — locuciones automáticas sin operador
- **Integración WhatsApp** — mensajes de oyentes en tiempo real
- **Filtro de spam** — clasificación automática de mensajes entrantes
- **Métricas de audiencia** — oyentes activos y nivel de interacción

### 🔧 Mejorado
- Panel de dashboard rediseñado con métricas de transmisión en tiempo real
- Gestión de escenas y fuentes mejorada

---

## [v1.2.0] — Boletín IA y Playout — Febrero 2026

### ✨ Nuevo
- **Boletín de noticias** con voces Microsoft TTS (gratis)
- **Playout 24/7** — programación automática con soporte diario/semanal/loop
- **Dashboard mejorado** — FPS, bitrate, CPU y frames perdidos vía WebSocket

### 🔧 Mejorado
- Biblioteca de medios con upload real (video/audio/imagen hasta 500 MB)
- Perfiles de streaming RTMP configurables por plataforma

---

## [v1.1.0] — Backend + Frontend Funcional — Enero 2026

### ✨ Nuevo
- **Icono oficial** — onda de señal en forma de M con gradiente azul/morado
- **Autenticación JWT** — registro, login y tokens con expiración de 24 h
- **Middleware de protección** — todas las rutas API requieren token válido
- **Upload con Multer** — archivos hasta 500 MB con limpieza automática al eliminar
- **UUIDs** en todos los recursos (escenas, fuentes, medios, perfiles)
- **Servidor unificado** — sirve frontend compilado + API en el puerto 4000
- **Login/Registro** — página de autenticación con tabs, persistencia de sesión
- **Escenas** — crear, activar y eliminar; indicador visual de escena activa
- **Streaming** — configuración de perfiles RTMP
- **Biblioteca de Medios** — tabla con tipo/tamaño/fecha
- **Playout** — programar contenido con repetición

### 🔧 Mejorado
- Frontend migrado de `react-scripts` a **Vite 4**
- Sidebar con indicador de conexión WebSocket y botón de logout

---

## [v1.0.0] — Lanzamiento Inicial — Diciembre 2025

### ✨ Nuevo
- Fork de OBS Studio como base para broadcast profesional
- Estructura inicial del backend Node.js
- Estructura inicial del frontend React
- Documentación de roadmap Fases 1–11
- Soporte inicial para Lower Thirds, Templates, Editor Dual, Multi-Cámara, IA y Automatización

---

[v1.4.0]: https://github.com/luisitoys12/maxim-broadcast/releases/tag/v1.4.0
[v1.3.1]: https://github.com/luisitoys12/maxim-broadcast/releases/tag/v1.3.1
[v1.3.0]: https://github.com/luisitoys12/maxim-broadcast/releases/tag/v1.3.0
[v1.2.0]: https://github.com/luisitoys12/maxim-broadcast/releases/tag/v1.2.0
[v1.1.0]: https://github.com/luisitoys12/maxim-broadcast/releases/tag/v1.1.0
[v1.0.0]: https://github.com/luisitoys12/maxim-broadcast/releases/tag/v1.0.0
