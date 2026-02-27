# Maxim Broadcast 🎥

**Software profesional de TV Playout y Producción en Vivo**  
*Basado en OBS Studio - Operación desde navegador web*

## 🌟 Visión del Proyecto

Maxim Broadcast es una plataforma avanzada de producción televisiva que combina:
- **Playout Profesional**: Programación automática de contenido 24/7
- **Producción en Vivo**: Switching multi-cámara tipo vMix
- **Edición Integrada**: Editor de video no-lineal en el navegador
- **IA Generativa**: Creación automática de gráficos, subtítulos y contenido
- **Llamadas en Vivo**: Integración de entrevistas y llamadas telefónicas
- **Control Remoto**: Operación completa desde navegador web

## 🎯 Características Principales

### Producción en Vivo
- Preview y Program (salida al aire)
- Transiciones profesionales (corte, fade, wipe, etc.)
- Overlays y gráficos en tiempo real
- Multi-view para monitoreo de todas las fuentes
- Chroma key y efectos visuales

### Playout Automático
- Programación de contenido por horarios
- Listas de reproducción inteligentes
- Fallback automático ante errores
- Múltiples salidas simultáneas (streaming, NDI, SDI)

### Edición de Video
- Timeline no-lineal integrado
- Recorte, división y unión de clips
- Transiciones y efectos
- Exportación en múltiples formatos

### IA Integrada
- Generación de gráficos automáticos
- Subtítulos en tiempo real (speech-to-text)
- Detección de rostros para auto-framing
- Sugerencias de contenido contextuales
- Generación de thumbnails automáticos

### Arquitectura
- **Backend**: Node.js + Express + WebSocket
- **Frontend**: React + Vite + TailwindCSS
- **Core**: libobs (OBS Studio)
- **Streaming**: obs-websocket protocol
- **Deployment**: Docker + Docker Compose
- **Plugins**: Compatible con plugins OBS existentes

## 🚀 Quick Start

### Requisitos
- Docker y Docker Compose
- OBS Studio 30+ (con obs-websocket)
- Node.js 20+ (para desarrollo local)

### Instalación con Docker

```bash
# Clonar el repositorio
git clone https://github.com/luisitoys12/maxim-broadcast.git
cd maxim-broadcast

# Iniciar con Docker Compose
docker-compose up -d

# La aplicación estará disponible en:
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# WebSocket: ws://localhost:4000
```

### Instalación Manual

```bash
# Backend
cd maxim-broadcast/backend
npm install
npm run dev

# Frontend (en otra terminal)
cd maxim-broadcast/frontend
npm install
npm run dev
```

## 📁 Estructura del Proyecto

```
maxim-broadcast/
├── backend/              # Servidor Node.js
│   ├── src/
│   │   ├── server.js    # Punto de entrada
│   │   ├── websocket/   # Gestión WebSocket
│   │   ├── obs/         # Integración OBS
│   │   ├── playout/     # Motor de playout
│   │   ├── ai/          # Servicios IA
│   │   └── api/         # REST API
│   ├── package.json
│   └── Dockerfile
│
├── frontend/            # Interfaz web React
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/  # Componentes UI
│   │   ├── pages/       # Páginas principales
│   │   ├── services/    # Servicios API/WS
│   │   └── styles/      # Estilos globales
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── docker-compose.yml   # Orquestación containers
├── README_MAXIM.md      # Este archivo
└── [OBS Studio source]  # Código fuente OBS original
```

## 🔧 Configuración

### Conectar OBS Studio

1. Instalar OBS Studio
2. Activar obs-websocket (incluido por defecto en OBS 28+)
3. Configurar en: Tools > obs-websocket Settings
4. Usar puerto `4455` y contraseña (opcional)
5. En Maxim Broadcast: Settings > OBS Connection

### Variables de Entorno

```env
# Backend (.env)
PORT=4000
OBS_WEBSOCKET_URL=ws://localhost:4455
OBS_WEBSOCKET_PASSWORD=your_password
AI_API_KEY=your_ai_api_key
DATABASE_URL=postgresql://...

# Frontend (.env)
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
```

## 🎨 Interfaz de Usuario

### Dashboard Principal
- **Preview**: Vista previa antes de salir al aire
- **Program**: Lo que está en vivo
- **Sources**: Lista de fuentes (cámaras, videos, imágenes)
- **Scenes**: Escenas pre-configuradas
- **Mixer**: Control de audio
- **Timeline**: Línea de tiempo para edición

### Módulos
1. **Live Production**: Producción en vivo
2. **Playout**: Programación automática
3. **Editor**: Edición de video
4. **Media Library**: Biblioteca de medios
5. **AI Studio**: Herramientas de IA
6. **Settings**: Configuración

## 🔌 Plugins OBS Compatibles

Maxim Broadcast es compatible con plugins OBS existentes:
- ✅ Filtros de audio y video
- ✅ Fuentes personalizadas
- ✅ Transiciones
- ✅ Efectos visuales
- ✅ NDI, SRT, RTMP sources

## 🤖 Integración IA

### APIs Soportadas
- Claude (Anthropic) - Generación de texto y análisis
- Gemini (Google) - Procesamiento multimodal
- Stable Diffusion - Generación de imágenes
- ElevenLabs - Text-to-speech
- Whisper - Speech-to-text

## 📡 Streaming y Salidas

### Plataformas Soportadas
- YouTube Live
- Facebook Live
- Twitch
- Custom RTMP/RTMPS
- SRT
- NDI Output
- Virtual Camera

## 🛠️ Desarrollo

### Stack Tecnológico
- **Backend**: Node.js, Express, Socket.io, obs-websocket-js
- **Frontend**: React 18, Vite, TailwindCSS, Zustand
- **Database**: PostgreSQL, Prisma ORM
- **Queue**: Bull (Redis)
- **Storage**: MinIO (S3-compatible)
- **Monitoring**: PM2, Prometheus

### Scripts de Desarrollo

```bash
# Instalar dependencias
npm run install:all

# Desarrollo (hot-reload)
npm run dev

# Build producción
npm run build

# Tests
npm test

# Linting
npm run lint
```

## 📄 Licencia

Este proyecto está basado en OBS Studio, licenciado bajo GPL v2+.  
Maxim Broadcast mantiene la misma licencia GPL v2+.

**Créditos**: Basado en [OBS Studio](https://obsproject.com) por OBS Project.  
**Desarrollado por**: EstacionKusMedia  
**Mantenedor**: Luis (luisitoys12)

## 🤝 Contribuir

Este es un proyecto en desarrollo activo. Contribuciones bienvenidas:
1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📞 Contacto

- **Proyecto**: EstacionKusMedia
- **GitHub**: [@luisitoys12](https://github.com/luisitoys12)
- **Website**: EstacionKusFM / EstacionKusTV

## 🗺️ Roadmap

### v0.1 (MVP) - Actual
- [x] Estructura base del proyecto
- [x] Backend Node.js con WebSocket
- [x] Frontend React básico
- [ ] Conexión con OBS WebSocket
- [ ] Control básico de escenas
- [ ] Preview y Program

### v0.2 (Beta)
- [ ] Editor de video integrado
- [ ] Sistema de playout
- [ ] Integración IA básica
- [ ] Interfaz completa de producción

### v0.3 (Release Candidate)
- [ ] Sistema de plugins
- [ ] Multi-usuario
- [ ] Dashboard de analytics
- [ ] Optimizaciones de rendimiento

### v1.0 (Producción)
- [ ] Sistema completo estable
- [ ] Documentación completa
- [ ] Soporte profesional
- [ ] Casos de uso reales

---

**🎬 Maxim Broadcast - Producción profesional desde el navegador**
