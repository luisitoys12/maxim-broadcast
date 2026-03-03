# Maxim Broadcast - Instrucciones de Compilación

## 🛠️ Compilar desde Código Fuente

### Prerequisitos

#### Todas las Plataformas
- Git
- CMake 3.20+
- Node.js 18+ y npm
- Python 3.8+

#### Windows
- Visual Studio 2022 (Community Edition)
- Windows 10 SDK

#### macOS
- Xcode 13+ con Command Line Tools
- Homebrew

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install build-essential cmake git nodejs npm python3 \
  libx11-dev libgl1-mesa-dev libpulse-dev libasound2-dev \
  libv4l-dev libavcodec-dev libavformat-dev libswscale-dev \
  libfreetype6-dev libfontconfig1-dev qtbase5-dev
```

### Clonar Repositorio

```bash
git clone --recursive https://github.com/luisitoys12/maxim-broadcast.git
cd maxim-broadcast
```

### Compilar libobs (Core)

#### Windows
```bash
mkdir build
cd build
cmake .. -G "Visual Studio 17 2022" -A x64
cmake --build . --config Release
```

#### macOS
```bash
mkdir build
cd build
cmake .. -DCMAKE_OSX_ARCHITECTURES="x86_64;arm64"
cmake --build . --config Release
```

#### Linux
```bash
mkdir build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)
```

### Compilar Backend (Node.js)

```bash
cd backend
npm install
npm run build
```

### Compilar Frontend (React)

```bash
cd frontend
npm install
npm run build
```

### Ejecutar en Modo Desarrollo

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

#### Terminal 3 - OBS Core
```bash
cd build
./rundir/Release/bin/64bit/obs
```

Accede a `http://localhost:3000` en tu navegador.

### Empaquetar para Distribución

#### Windows (Installer)
```bash
npm run package:windows
# Genera: maxim-broadcast-1.0.0-beta-windows-x64.exe
```

#### macOS (DMG)
```bash
npm run package:mac
# Genera: maxim-broadcast-1.0.0-beta-macos.dmg
```

#### Linux (DEB/RPM)
```bash
npm run package:linux
# Genera: maxim-broadcast-1.0.0-beta-linux-amd64.deb
#         maxim-broadcast-1.0.0-beta-linux-x86_64.rpm
```

#### Android (APK)
```bash
cd android
./gradlew assembleRelease
# Genera: app/build/outputs/apk/release/maxim-broadcast-1.0.0-beta-android.apk
```

### Deployment con Docker

```bash
# Build imagen
docker build -t maxim-broadcast:latest .

# Ejecutar contenedor
docker run -d -p 3000:3000 -p 8080:8080 \
  --name maxim-broadcast \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/media:/app/media \
  maxim-broadcast:latest
```

#### Docker Compose (Producción)
```bash
docker-compose up -d
```

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Integration tests
npm run test:integration
```

### Troubleshooting

#### Error: libobs no encontrado
```bash
# Asegúrate de compilar libobs primero
cd build
cmake --build . --config Release
```

#### Error: Node modules faltantes
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### Error: Puerto 3000 en uso
```bash
# Cambiar puerto en backend/.env
PORT=3001
```

### Desarrollo Avanzado

#### Hot Reload
Ambos frontend y backend soportan hot reload en modo desarrollo.

#### Debug Mode
```bash
# Backend con debug
DEBUG=maxim:* npm run dev

# Frontend con debug
REACT_APP_DEBUG=true npm start
```

#### Profiling
```bash
# CPU profiling
node --prof backend/dist/index.js

# Memory profiling
node --inspect backend/dist/index.js
```

### Contribuir

Revisa [CONTRIBUTING.rst](CONTRIBUTING.rst) para guías de estilo y proceso de contribución.

### Soporte

- **Issues**: [GitHub Issues](https://github.com/luisitoys12/maxim-broadcast/issues)
- **Documentación**: [Wiki](https://github.com/luisitoys12/maxim-broadcast/wiki)
- **Email**: Disponible en perfil de GitHub

---

🚀 **Happy Building!**