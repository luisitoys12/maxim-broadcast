import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

import apiRoutes from './routes/api.js';
import { socketHandler } from './websocket/socketHandler.js';
import obsController from './controllers/obsController.js';

dotenv.config();

// Ensure logs directory exists
mkdirSync('logs', { recursive: true });

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({ format: format.combine(format.colorize(), format.simple()) }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

export { io };

const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend in production
const frontendDist = join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// Serve generated audio files (TTS, bulletins)
app.use('/audio', express.static(join(__dirname, '../uploads/audio')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0-beta', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRoutes);

// SPA fallback — must be after /api routes
app.get('*', (req, res) => {
  res.sendFile(join(frontendDist, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// WebSocket
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  socketHandler(socket, io);
});

// Initialize OBS Controller
obsController.initialize()
  .then(() => logger.info('OBS Controller initialized'))
  .catch(err => logger.warn('OBS Controller init skipped:', err.message));

httpServer.listen(PORT, () => {
  logger.info(`Maxim Broadcast Backend running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
