import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { OBSController } from './obs/obs-controller.js';
import { WebSocketHandler } from './websocket/ws-handler.js';
import { PlayoutEngine } from './playout/playout-engine.js';
import apiRoutes from './api/routes.js';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 4000;
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];

// Inicializar Express
const app = express();
const httpServer = createServer(app);

// Configurar Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Inicializar controladores
const obsController = new OBSController();
const playoutEngine = new PlayoutEngine(obsController);
const wsHandler = new WebSocketHandler(io, obsController, playoutEngine);

// Hacer disponibles en el contexto de la app
app.locals.obsController = obsController;
app.locals.playoutEngine = playoutEngine;
app.locals.io = io;

// Rutas API
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    obs: {
      connected: obsController.isConnected(),
      status: obsController.getStatus()
    },
    playout: {
      running: playoutEngine.isRunning(),
      currentItem: playoutEngine.getCurrentItem()
    }
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    name: 'Maxim Broadcast API',
    version: '0.1.0',
    description: 'Professional TV Playout and Live Production Backend',
    endpoints: {
      health: '/health',
      api: '/api',
      websocket: 'ws://localhost:' + PORT
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Conectar a OBS al iniciar
async function startServer() {
  try {
    // Intentar conectar a OBS
    logger.info('Intentando conectar a OBS WebSocket...');
    await obsController.connect();
    logger.info('✅ Conectado a OBS exitosamente');
    
    // Inicializar playout engine
    await playoutEngine.initialize();
    logger.info('✅ Playout engine inicializado');
    
  } catch (error) {
    logger.warn('⚠️ No se pudo conectar a OBS al iniciar:', error.message);
    logger.info('El servidor continuará ejecutándose. Conecta OBS manualmente desde la interfaz.');
  }
  
  // Iniciar servidor
  httpServer.listen(PORT, () => {
    logger.info(`🚀 Maxim Broadcast Backend iniciado`);
    logger.info(`🌍 API: http://localhost:${PORT}`);
    logger.info(`🔌 WebSocket: ws://localhost:${PORT}`);
    logger.info(`🎥 OBS Status: ${obsController.isConnected() ? 'Connected' : 'Disconnected'}`);
  });
}

// Manejo de señales de cierre
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  await obsController.disconnect();
  await playoutEngine.stop();
  httpServer.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  await obsController.disconnect();
  await playoutEngine.stop();
  httpServer.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

// Iniciar
startServer();
