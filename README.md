# Maxim Broadcast

**Software Profesional de TV Playout y Producción en Vivo**

Maxim Broadcast es una plataforma avanzada de producción audiovisual basada en [OBS Studio](https://obsproject.com), diseñada para operación desde navegador web con capacidades profesionales tipo vMix.

---

## 🎯 Visión del Proyecto

Transformar OBS Studio en una solución completa de broadcast que combine:

- **Producción en vivo** con switching multi-cámara avanzado
- **Edición de video** integrada en tiempo real
- **Generación AI** para gráficos, subtítulos y contenido automatizado
- **Llamadas integradas** para entrevistas y transmisiones remotas
- **Playout automático** para canales de TV 24/7
- **Operación web-based** accesible desde cualquier dispositivo

---

## 🚀 Características Principales

### Producción Profesional
- Dashboard de producción con preview/program
- Múltiples salidas simultáneas (streaming, grabación, NDI)
- Transiciones avanzadas y efectos en tiempo real
- Control de audio profesional con mezcla multicanal

### Edición Integrada
- Editor no-lineal básico dentro de la plataforma
- Recorte, empalme y ajustes rápidos
- Biblioteca de medios centralizada
- Exportación en múltiples formatos

### Inteligencia Artificial
- Generación automática de gráficos y lower thirds
- Subtítulos en tiempo real (speech-to-text)
- Detección de rostros para auto-framing
- Sugerencias de contenido contextual

### Playout Automático
- Programación de contenido por horarios
- Listas de reproducción con fallback
- Inserción automática de comerciales
- Control remoto completo

### Llamadas Integradas
- Sistema VoIP/SIP para entrevistas
- Múltiples invitados simultáneos
- Calidad broadcast con bajo retardo
- Grabación separada de pistas

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│         Frontend Web (React/Vue)        │
│  - Dashboard de producción              │
│  - Editor de video                      │
│  - Gestión de escenas                   │
└─────────────────┬───────────────────────┘
                  │ WebSocket/REST API
┌─────────────────┴───────────────────────┐
│       Backend Server (Node.js)          │
│  - API Gateway                          │
│  - Gestión de sesiones                  │
│  - Procesamiento AI                     │
└─────────────────┬───────────────────────┘
                  │ Native Bindings
┌─────────────────┴───────────────────────┐
│          libobs (OBS Core)              │
│  - Captura de video/audio               │
│  - Rendering y composición              │
│  - Encoding y streaming                 │
│  - Sistema de plugins                   │
└─────────────────────────────────────────┘
```

---

## 🔌 Compatibilidad con Plugins OBS

Maxim Broadcast mantiene compatibilidad completa con plugins de OBS Studio:

- ✅ Fuentes de video (capturas, navegador, etc.)
- ✅ Filtros de audio y video
- ✅ Codecs y encoders
- ✅ Servicios de streaming
- ✅ Transiciones personalizadas

---

## 🛠️ Stack Tecnológico

**Backend**
- Node.js con TypeScript
- Express.js para API REST
- Socket.io para comunicación en tiempo real
- Native bindings para libobs

**Frontend**
- React o Vue.js
- WebRTC para preview de baja latencia
- Canvas API para overlays interactivos
- Tailwind CSS para UI moderna

**Infraestructura**
- Docker para deployment
- Redis para caché y sesiones
- PostgreSQL para base de datos
- NGINX como reverse proxy

**AI/ML**
- Whisper para speech-to-text
- Stable Diffusion para generación de imágenes
- OpenCV para procesamiento de video
- TensorFlow.js para inference en navegador

---

## 📋 Roadmap

### Fase 1: MVP Web-Based (Beta)
- [x] Fork de OBS Studio
- [ ] Backend Node.js con API básica
- [ ] Frontend web con control remoto
- [ ] Streaming básico desde navegador
- [ ] Preview en tiempo real

### Fase 2: Producción Profesional
- [ ] Sistema de escenas avanzado
- [ ] Múltiples salidas simultáneas
- [ ] Transiciones y efectos
- [ ] Mezclador de audio profesional
- [ ] NDI input/output

### Fase 3: Editor Integrado
- [ ] Timeline de edición básico
- [ ] Recorte y empalme
- [ ] Efectos de video
- [ ] Exportación multi-formato
- [ ] Biblioteca de medios

### Fase 4: Inteligencia Artificial
- [ ] Generación de gráficos con IA
- [ ] Subtítulos automáticos
- [ ] Auto-framing con detección facial
- [ ] Sugerencias de contenido
- [ ] Análisis de audiencia

### Fase 5: Playout y Llamadas
- [ ] Sistema de playout 24/7
- [ ] Programación automática
- [ ] Integración VoIP/SIP
- [ ] Múltiples invitados
- [ ] Grabación multipista

---

## 🚦 Instalación y Uso

### Requisitos del Sistema

**Servidor Linux**
- Ubuntu 20.04+ o Debian 11+
- 8GB RAM mínimo (16GB recomendado)
- GPU con soporte H.264/HEVC
- Node.js 18+
- Docker y Docker Compose

**Clientes**
- Navegador moderno (Chrome, Firefox, Edge)
- Conexión de banda ancha estable
- Opcional: Windows 10+ para cliente nativo

### Instalación Rápida

```bash
# Clonar repositorio
git clone https://github.com/luisitoys12/maxim-broadcast.git
cd maxim-broadcast

# Instalar dependencias
npm install

# Compilar OBS core
./build.sh

# Iniciar con Docker
docker-compose up -d

# Acceder a la interfaz web
# http://localhost:3000
```

---

## 📝 Créditos y Licencia

**Basado en OBS Studio**
- Proyecto original: [obsproject/obs-studio](https://github.com/obsproject/obs-studio)
- Licencia: GNU GPL v2.0

**Maxim Broadcast**
- Desarrollado por: EstacionKusMedia
- Mantenedor: [@luisitoys12](https://github.com/luisitoys12)
- Licencia: GNU GPL v2.0 (compatible con OBS)

---

## 🤝 Contribuir

Este es un proyecto en desarrollo activo. Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📧 Contacto

**EstacionKusMedia**
- Proyecto: Maxim Broadcast
- GitHub: [@luisitoys12](https://github.com/luisitoys12)

---

## ⚠️ Estado del Proyecto

**🟡 Beta Activa** - El proyecto está en desarrollo activo. Funcionalidades básicas están implementadas pero pueden contener bugs. No recomendado para producción crítica aún.

---

*Maxim Broadcast - Broadcast Profesional, Accesible Desde Cualquier Lugar* 🎬📡