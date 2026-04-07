# Guía de Instalación — Maxim Broadcast v1.4.0

## Índice
- [Windows](#-windows)
- [Linux — Debian/Ubuntu](#-linux--debianubuntu)
- [Linux — AppImage (cualquier distro)](#-linux--appimage-cualquier-distro)
- [macOS](#-macos)
- [Docker](#-docker)
- [Desde código fuente](#️-desde-código-fuente)
- [Primera configuración](#️-primera-configuración)
- [Solución de problemas](#-solución-de-problemas)

---

## 🪟 Windows

### Requisitos previos
- Windows 10 / 11 (64-bit)
- Node.js 18+ ([descargar](https://nodejs.org))

### Instalación con wizard (.exe)

1. Descarga `maxim-broadcast-v1.4.0-windows-x64-setup.exe` desde la [página de releases](https://github.com/luisitoys12/maxim-broadcast/releases/latest)

2. Ejecuta el instalador **como administrador** (clic derecho → "Ejecutar como administrador")

3. Sigue el wizard:
   - **Bienvenida** → clic en "Siguiente"
   - **Licencia** → acepta los términos GPL v2.0 → "Siguiente"
   - **Directorio** → elige dónde instalar (por defecto `C:\Program Files\Maxim Broadcast`) → "Instalar"
   - **Instalando...** → espera a que termine
   - **Finalizar** → clic en "Finalizar"

4. Lanza Maxim Broadcast desde:
   - Menú Inicio → **Maxim Broadcast**
   - Acceso directo en el escritorio
   - O abre tu navegador en: http://localhost:4000

### Instalación portable (.zip)

1. Descarga `maxim-broadcast-v1.4.0-windows-x64.zip`
2. Extrae en la carpeta que prefieras
3. Ejecuta `start.bat` haciendo doble clic
4. Abre http://localhost:4000 en tu navegador

> **Nota:** El portable no crea entradas en el menú Inicio ni en el registro de Windows.

---

## 🐧 Linux — Debian/Ubuntu

### Requisitos previos
- Ubuntu 20.04+ / Debian 11+
- Node.js 18+: `sudo apt install nodejs npm`

### Instalar paquete .deb

```bash
# Descargar
wget https://github.com/luisitoys12/maxim-broadcast/releases/download/v1.4.0/maxim-broadcast-v1.4.0-linux-amd64.deb

# Instalar
sudo dpkg -i maxim-broadcast-v1.4.0-linux-amd64.deb

# Si hay dependencias faltantes
sudo apt-get install -f

# Lanzar
maxim-broadcast
```

El panel web estará disponible en http://localhost:4000

### Desinstalar

```bash
sudo dpkg -r maxim-broadcast
```

---

## 🐧 Linux — AppImage (cualquier distro)

El AppImage funciona en cualquier distribución Linux moderna sin necesidad de instalación.

```bash
# Descargar y dar permisos
wget https://github.com/luisitoys12/maxim-broadcast/releases/download/v1.4.0/maxim-broadcast-v1.4.0-linux-x64.tar.gz
tar -xzf maxim-broadcast-v1.4.0-linux-x64.tar.gz
cd maxim-broadcast-v1.4.0-linux-x64

# Ejecutar
chmod +x start.sh
./start.sh
```

Abre http://localhost:4000 en tu navegador.

---

## 🍎 macOS

### Requisitos previos
- macOS 11 (Big Sur) o superior
- Node.js 18+: `brew install node`

### Instalación

1. Descarga `maxim-broadcast-v1.4.0-macos.zip` desde la [página de releases](https://github.com/luisitoys12/maxim-broadcast/releases/latest)

2. Descomprime el archivo (doble clic o `unzip`)

3. Abre la carpeta `maxim-broadcast-v1.4.0-macos`

4. Haz doble clic en `start.command`
   - Si macOS bloquea el archivo: ve a **Preferencias del Sistema → Seguridad y privacidad → Abrir de todas formas**

5. Abre http://localhost:4000 en Safari/Chrome/Firefox

---

## 🐳 Docker

```bash
# Clonar el repositorio
git clone https://github.com/luisitoys12/maxim-broadcast.git
cd maxim-broadcast

# Copiar configuración
cp backend/.env.example backend/.env

# Lanzar con Docker Compose
docker-compose up -d

# Acceder
open http://localhost:4000
```

Para detener:
```bash
docker-compose down
```

---

## 🛠️ Desde código fuente

```bash
# Requisitos: Git, Node.js 18+, npm

# 1. Clonar
git clone https://github.com/luisitoys12/maxim-broadcast.git
cd maxim-broadcast

# 2. Configurar backend
cd backend
cp .env.example .env
# Edita .env: cambia JWT_SECRET por un valor secreto seguro
npm install
cd ..

# 3. Compilar frontend
cd frontend
npm install
npm run build
cd ..

# 4. Iniciar servidor
cd backend
node src/index.js
```

Abre http://localhost:4000 en tu navegador.

Para **desarrollo con hot-reload**:
```bash
# Terminal 1 — Backend
cd backend && node --watch src/index.js

# Terminal 2 — Frontend (dev server en :3000)
cd frontend && npm run dev
```

---

## ⚙️ Primera Configuración

### 1. Crear cuenta de administrador

Al abrir el panel por primera vez en http://localhost:4000:
1. Haz clic en **"Registrarse"**
2. Ingresa tu nombre de usuario y contraseña
3. Inicia sesión

### 2. Conectar OBS Studio (opcional)

Si quieres controlar OBS de forma remota:

1. En OBS Studio: **Herramientas → obs-websocket Settings**
2. Habilita el servidor WebSocket en el puerto `4455`
3. Configura una contraseña
4. En Maxim Broadcast: **Configuración → OBS Connection**
5. Ingresa la IP de tu servidor OBS, puerto y contraseña

### 3. Configurar perfil de streaming

1. Ve a **Streaming** en el panel lateral
2. Crea un nuevo perfil con:
   - Plataforma (Twitch, YouTube, Facebook, etc.)
   - Server URL (ej. `rtmp://live.twitch.tv/live`)
   - Stream Key
   - Encoder, resolución y FPS

---

## 🔧 Solución de Problemas

### El panel no carga en http://localhost:4000

```bash
# Verificar que el backend está corriendo
ps aux | grep node

# Ver logs del backend
cd backend
node src/index.js

# Verificar que el puerto 4000 está libre
lsof -i :4000   # macOS/Linux
netstat -ano | findstr :4000   # Windows
```

### Error "Cannot connect to OBS"

- Verifica que OBS Studio está abierto
- Confirma que obs-websocket está habilitado (Herramientas → obs-websocket Settings)
- Asegúrate de que la IP y el puerto son correctos
- Revisa el firewall — permite conexiones al puerto `4455`

### Puerto 4000 en uso

Edita `backend/.env` y cambia el puerto:
```
PORT=5000
```

### Permisos denegados en Linux

```bash
sudo chown -R $USER:$USER /usr/share/maxim-broadcast
```

---

## 📞 Soporte

- **Issues:** https://github.com/luisitoys12/maxim-broadcast/issues
- **Releases:** https://github.com/luisitoys12/maxim-broadcast/releases
