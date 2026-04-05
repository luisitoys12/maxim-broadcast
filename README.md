<p align="center">
  <img src="https://img.shields.io/badge/Maxim_Broadcast-v1.2.0-blue?style=for-the-badge&logo=obs-studio&logoColor=white" alt="Maxim Broadcast v1.0.0"/>
</p>

<h1 align="center">Maxim Broadcast</h1>

<p align="center">
  <strong>Software Inteligente de Broadcast Profesional</strong><br>
  Produccion en vivo con IA, edicion dual, multi-camara y automatizacion — basado en OBS Studio
</p>

<p align="center">
  <a href="https://github.com/luisitoys12/maxim-broadcast/releases/latest">
    <img src="https://img.shields.io/github/v/release/luisitoys12/maxim-broadcast?style=flat-square&label=Release&color=success" alt="Latest Release"/>
  </a>
  <a href="https://github.com/luisitoys12/maxim-broadcast/releases/latest">
    <img src="https://img.shields.io/github/downloads/luisitoys12/maxim-broadcast/total?style=flat-square&label=Descargas&color=blue" alt="Downloads"/>
  </a>
  <a href="https://github.com/luisitoys12/maxim-broadcast/blob/master/COPYING">
    <img src="https://img.shields.io/badge/Licencia-GPL%20v2.0-red?style=flat-square" alt="License GPL v2.0"/>
  </a>
  <a href="https://github.com/luisitoys12/maxim-broadcast/stargazers">
    <img src="https://img.shields.io/github/stars/luisitoys12/maxim-broadcast?style=flat-square&color=yellow" alt="Stars"/>
  </a>
</p>

<p align="center">
  <a href="#-descargas">Descargas</a> •
  <a href="#-caracteristicas">Caracteristicas</a> •
  <a href="#-instalacion">Instalacion</a> •
  <a href="#-compatibilidad-obs">Compatibilidad OBS</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="#-contribuir">Contribuir</a>
</p>

---

## Descargas

### v1.2.0 — Estable

| Plataforma | Archivo | Requisitos |
|:----------:|---------|:----------:|
| **Windows 64-bit** | [`maxim-broadcast-v1.2.0-windows-x64.zip`](https://github.com/luisitoys12/maxim-broadcast/releases/download/v1.2.0/maxim-broadcast-v1.2.0-windows-x64.zip) | Windows 10/11 + Node.js 18+ |
| **Ubuntu/Debian** | [`maxim-broadcast-v1.2.0-linux-amd64.deb`](https://github.com/luisitoys12/maxim-broadcast/releases/download/v1.2.0/maxim-broadcast-v1.2.0-linux-amd64.deb) | Ubuntu 20.04+ |
| **Linux (tar.gz)** | [`maxim-broadcast-v1.2.0-linux-x64.tar.gz`](https://github.com/luisitoys12/maxim-broadcast/releases/download/v1.2.0/maxim-broadcast-v1.2.0-linux-x64.tar.gz) | Cualquier distro |
| **macOS** | [`maxim-broadcast-v1.2.0-macos.zip`](https://github.com/luisitoys12/maxim-broadcast/releases/download/v1.2.0/maxim-broadcast-v1.2.0-macos.zip) | macOS 11+ + Node.js 18+ |

> Los checksums SHA-256 están en [`SHA256SUMS.txt`](https://github.com/luisitoys12/maxim-broadcast/releases/download/v1.2.0/SHA256SUMS.txt)

### Requisito único: Node.js 18+

Descarga Node.js en [nodejs.org](https://nodejs.org) si no lo tienes instalado.

### Inicio rápido

```bash
# Windows — doble clic en INICIAR.bat

# Linux / macOS
tar -xzf maxim-broadcast-v1.2.0-linux-x64.tar.gz
cd maxim-broadcast-v1.2.0-linux-x64
./start.sh
# Panel en http://localhost:4000

# Ubuntu/Debian
sudo dpkg -i maxim-broadcast-v1.2.0-linux-amd64.deb
maxim-broadcast

# Docker
docker run -p 4000:4000 luisitoys12/maxim-broadcast:latest
```

---

## Caracteristicas

### Funciones Implementadas en v1.0.0

| Funcion | Descripcion | Estado |
|---------|------------|:------:|
| **Lower Thirds** | Graficos dinamicos con animaciones profesionales | ✅ Listo |
| **Templates** | 50+ plantillas para noticias, deportes, entretenimiento | ✅ Listo |
| **Editor Dual** | Edicion no-lineal mientras se transmite en vivo | ✅ Listo |
| **Produccion Pro** | Dashboard preview/program, multi-salida, mezcla de audio | ✅ Listo |
| **Multi-Camara** | Hasta 12 fuentes, instant replay, auto-switching | ✅ Listo |
| **IA Integrada** | Subtitulos automaticos, auto-framing, chroma key IA | ✅ Listo |
| **Automatizacion** | Auto-director IA, highlights, transcripcion multiidioma | ✅ Listo |
| **Playout 24/7** | Programacion automatica de contenido | 🔄 En Desarrollo |
| **Llamadas VoIP** | Entrevistas integradas con SIP/WebRTC | 🔄 En Desarrollo |
| **Multi-Usuario** | Colaboracion en tiempo real con roles y permisos | 🔄 En Desarrollo |
| **Cloud Sync** | Almacenamiento y sincronizacion en la nube | 🔄 En Desarrollo |
| **Multi-Streaming** | Transmision simultanea a 5+ plataformas | 📋 Planeado |
| **Monetizacion** | Donaciones, suscripciones, publicidad integrada | 📋 Planeado |
| **4K/8K** | Pipeline de ultra alta definicion | 📋 Planeado |
| **Virtual Sets AR** | Sets virtuales 3D con realidad aumentada | 📋 Planeado |
| **IA Director** | Director de produccion automatico con IA | 📋 Planeado |

### Lower Thirds Profesionales
Sistema completo de graficos dinamicos para identificacion de personas, segmentos y contenido en vivo con diseños personalizables y animaciones fluidas.

### Sistema de Templates
Biblioteca de plantillas profesionales prediseñadas para noticias, deportes, entretenimiento, entrevistas y programas corporativos, totalmente personalizables desde el dashboard web.

### Editor de Video Dual
Edicion de contenido pregrabado mientras produces en vivo simultaneamente, con timeline no-lineal, recorte instantaneo y exportacion multi-formato sin interrumpir la transmision.

### Produccion Profesional
Dashboard avanzado con preview/program, multiples salidas simultaneas (streaming, grabacion, NDI), transiciones profesionales y mezclador de audio con EQ/compresor.

### Multi-Camara Avanzado
Soporte hasta 12 fuentes simultaneas, instant replay con control de velocidad, auto-switching inteligente y preset manager.

### Inteligencia Artificial
Generacion de graficos con IA, subtitulos automaticos, auto-framing con deteccion facial, chroma key mejorado y generacion de thumbnails.

### Automatizacion Inteligente
Auto-director con IA, generacion de highlights, transcripcion multiidioma, analytics de audiencia y ajuste automatico de audio.

---

## Vision del Proyecto

Transformar OBS Studio en una solucion completa de broadcast que combine:

- **Produccion en vivo** con switching multi-camara avanzado
- **Edicion de video** integrada en tiempo real
- **Generacion AI** para graficos, subtitulos y contenido automatizado
- **Llamadas integradas** para entrevistas y transmisiones remotas
- **Playout automatico** para canales de TV 24/7
- **Operacion web-based** accesible desde cualquier dispositivo

---

## Compatibilidad OBS

Maxim Broadcast mantiene **compatibilidad completa** con plugins de OBS Studio:

- Fuentes de video (capturas, navegador, NDI, etc.)
- Filtros de audio y video
- Codecs y encoders (x264, NVENC, QSV, VCE)
- Servicios de streaming (Twitch, YouTube, Facebook, RTMP custom)
- Transiciones personalizadas
- Importacion directa de perfiles y escenas de OBS

---

## Arquitectura

```
                    Frontend Web (React)
                  Dashboard de produccion
                   Editor de video dual
                  Gestion de escenas + IA
                          |
                  WebSocket / REST API
                          |
                  Backend (Node.js + TS)
                    API Gateway
                  Sesiones + Redis
                 Procesamiento AI
                          |
                   Native Bindings
                          |
                    libobs (OBS Core)
                 Captura video/audio
                Rendering + Composicion
                Encoding + Streaming
                 Sistema de plugins
```

---

## Stack Tecnologico

**Backend**: Node.js 20+, TypeScript, Express.js, Socket.io  
**Frontend**: React 18, WebRTC, Canvas API, Tailwind CSS  
**Core**: libobs (C/C++), FFmpeg  
**AI/ML**: Whisper, Stable Diffusion, OpenCV, TensorFlow.js  
**Infra**: Docker, Redis, PostgreSQL, NGINX  
**Mobile**: Kotlin + Jetpack Compose (Android), Swift + UIKit (iOS)

---

## Instalacion

### Windows
```bash
# Descargar e instalar
maxim-broadcast-1.0.0-windows-x64-setup.exe

# O usar la version portable (sin instalacion)
maxim-broadcast-1.0.0-windows-x64-portable.zip
```

### macOS
```bash
# Descargar DMG, montar y arrastrar a Aplicaciones
maxim-broadcast-1.0.0-macos-universal.dmg
```

### Linux
```bash
# Ubuntu/Debian
sudo dpkg -i maxim-broadcast-1.0.0-linux-amd64.deb
sudo apt-get install -f

# Fedora/RHEL
sudo rpm -i maxim-broadcast-1.0.0-linux-x86_64.rpm

# AppImage (cualquier distro)
chmod +x maxim-broadcast-1.0.0-linux-x86_64.AppImage
./maxim-broadcast-1.0.0-linux-x86_64.AppImage
```

### Android
```bash
# Descargar APK
maxim-broadcast-1.0.0-android-universal.apk
# Permitir fuentes desconocidas > Instalar
```

### iOS
```bash
# Disponible via TestFlight o sideload
maxim-broadcast-1.0.0-ios.ipa
```

### Desde Codigo Fuente
```bash
git clone https://github.com/luisitoys12/maxim-broadcast.git
cd maxim-broadcast
npm install
./build.sh
docker-compose up -d
# Acceder en http://localhost:3000
```

---

## Requisitos del Sistema

### Desktop (Minimos)
- CPU: Intel Core i5 / AMD Ryzen 5 (4 cores)
- RAM: 8 GB
- GPU: H.264 compatible (Intel HD 530+, GTX 950+, RX 460+)
- Disco: 2 GB libres
- Internet: 5 Mbps

### Desktop (Recomendados)
- CPU: Intel Core i7 / AMD Ryzen 7 (8+ cores)
- RAM: 16 GB+
- GPU: NVIDIA GTX 1060+ / AMD RX 580+ con NVENC/VCE
- Disco: SSD con 10 GB libres
- Internet: 25+ Mbps

### Movil
- Procesador: Snapdragon 855+ / Apple A13+
- RAM: 4 GB+
- Almacenamiento: 500 MB libres

---

## Roadmap

### Completado (v1.0.0)
- [x] Fase 1: MVP Web-Based
- [x] Fase 2: Lower Thirds y Templates
- [x] Fase 3: Editor de Video Dual
- [x] Fase 4: Produccion Profesional
- [x] Fase 5: Multi-Camara Avanzado
- [x] Fase 6: Inteligencia Artificial
- [x] Fase 7: Automatizacion Inteligente

### En Desarrollo (Q1 2027)
- [ ] Fase 8: Playout 24/7 y Llamadas VoIP → [Ver planificacion detallada](./docs/roadmap/fase-08-playout-voip.md)
- [ ] Fase 9: Colaboracion Multi-Usuario y Cloud → [Ver planificacion detallada](./docs/roadmap/fase-09-colaboracion-cloud.md)

### Planeado (Q2 2027)
- [ ] Fase 10: Monetizacion y Multi-Streaming → [Ver planificacion detallada](./docs/roadmap/fase-10-monetizacion-multistreaming.md)
- [ ] Fase 11: 4K/8K, AR, Virtual Sets, IA Director → [Ver planificacion detallada](./docs/roadmap/fase-11-4k-ar-virtual-sets.md)

> Ver el [indice completo del roadmap](./docs/roadmap/README.md)

---

## Contribuir

Las contribuciones son bienvenidas. Este es un proyecto de codigo abierto bajo GPL v2.0.

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcion`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcion'`)
4. Push a la rama (`git push origin feature/nueva-funcion`)
5. Abre un Pull Request

---

## Creditos y Licencia

**Basado en OBS Studio**  
Proyecto original: [obsproject/obs-studio](https://github.com/obsproject/obs-studio)  
Licencia: GNU GPL v2.0

**Maxim Broadcast**  
Desarrollado por: EstacionKusMedia  
Mantenedor: [@luisitoys12](https://github.com/luisitoys12)  
Licencia: GNU GPL v2.0 (compatible con OBS)

---

## Contacto

**EstacionKusMedia**  
GitHub: [@luisitoys12](https://github.com/luisitoys12)  
Website: [luisitoys12.github.io/maxim-broadcast](https://luisitoys12.github.io/maxim-broadcast/)

---

## Estado del Proyecto

**v1.1.0 — Backend + Frontend Funcional Estable**

Fases 1-7 completadas. Lower thirds, templates, editor dual, produccion profesional, multi-camara, inteligencia artificial y automatizacion completamente operativos. Disponible para Windows, macOS, Linux, Android e iOS.

---

*Maxim Broadcast — Broadcast Profesional, Accesible Desde Cualquier Lugar*  
*Desarrollado con pasion desde Irapuato, Mexico*
