import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import cron from 'node-cron';

const __dirname = dirname(fileURLToPath(import.meta.url));

import apiRoutes from './routes/api.js';
import healthRoutes from './routes/health.js';
import { socketHandler } from './websocket/socketHandler.js';
import obsController from './controllers/obsController.js';
import corsCodespaces from './middleware/cors-codespaces.js';
import { apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

for (const dir of ['logs', 'uploads/media', 'uploads/audio', 'recordings', 'db']) {
  mkdirSync(dir, { recursive: true });
}

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console({ format: format.combine(format.colorize(), format.simple()) }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.CORS_ORIGIN,
  'http://localhost:3000',
  'http://localhost:4000',
].filter(Boolean);

const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] }
});

export { io };

const PORT = process.env.PORT || 4000;

// ─── Middleware ──────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(corsCodespaces);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use('/api', apiLimiter);

// ─── Static files ────────────────────────────────
const frontendDist = join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.use('/audio', express.static(join(__dirname, '../uploads/audio')));
app.use('/media', express.static(join(__dirname, '../uploads/media')));

// ─── Health ──────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: process.env.npm_package_version || '1.5.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    features: {
      channels:    process.env.ENABLE_CHANNELS !== 'false',
      playout:     process.env.ENABLE_PLAYOUT !== 'false',
      multistream: process.env.ENABLE_MULTISTREAM !== 'false',
      radiosync:   process.env.ENABLE_RADIOSYNC !== 'false',
      ai:          process.env.ENABLE_AI_FEATURES !== 'false',
    }
  });
});

// ─── Routes ──────────────────────────────────────
app.use('/api', healthRoutes);
app.use('/api', apiRoutes);

// ─── SPA Fallback ────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(join(frontendDist, 'index.html'));
});

// ─── Error handler ───────────────────────────────
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ─── WebSocket ───────────────────────────────────
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  socketHandler(socket, io);
});

// ─── OBS Controller ──────────────────────────────
obsController.initialize()
  .then(() => logger.info('OBS Controller initialized'))
  .catch(err => logger.warn('OBS Controller init skipped:', err.message));

// ─── Scheduled Jobs ──────────────────────────────
cron.schedule('0 * * * *', () => {
  logger.info('[CRON] Hourly maintenance job running');
});

httpServer.listen(PORT, () => {
  logger.info(`Maxim Broadcast Backend v1.5.0 running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Features: channels=${process.env.ENABLE_CHANNELS !== 'false'} playout=${process.env.ENABLE_PLAYOUT !== 'false'} multistream=${process.env.ENABLE_MULTISTREAM !== 'false'}`);
});
