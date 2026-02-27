import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import winston from 'winston';

import apiRoutes from './routes/api.js';
import obsController from './controllers/obsController.js';
import socketHandler from './websocket/socketHandler.js';

dotenv.config();

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
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

const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRoutes);

// WebSocket connection handler
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  socketHandler(socket, io);
});

// Initialize OBS Controller
obsController.initialize().then(() => {
  logger.info('OBS Controller initialized successfully');
}).catch(err => {
  logger.error('Failed to initialize OBS Controller:', err);
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

httpServer.listen(PORT, () => {
  logger.info(`Maxim Broadcast Backend running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { io, logger };
