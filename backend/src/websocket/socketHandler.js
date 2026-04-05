import { logger } from '../index.js';
import { verifyToken } from '../controllers/authController.js';

export function socketHandler(socket, io) {
  // Optional auth via handshake query token
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (token) {
    const payload = verifyToken(token);
    if (payload) socket.userId = payload.sub;
  }

  // Preview stream
  socket.on('request-preview', () => {
    logger.info(`Preview requested by ${socket.id}`);
    socket.emit('preview-data', { status: 'streaming', timestamp: new Date().toISOString() });
  });

  // Scene change — broadcast to all clients
  socket.on('scene-change', (data) => {
    logger.info(`Scene change: ${data?.sceneId}`);
    io.emit('scene-changed', { ...data, changedBy: socket.id });
  });

  // Source visibility toggle
  socket.on('toggle-source', (data) => {
    logger.info(`Source toggle: ${data?.sourceId}`);
    io.emit('source-toggled', { ...data, toggledBy: socket.id });
  });

  // Streaming status updates
  socket.on('stream-status', (data) => {
    io.emit('stream-status-update', data);
  });

  // Real-time stats every second
  const statsInterval = setInterval(() => {
    socket.emit('stats-update', {
      fps: Math.floor(Math.random() * 3) + 59,
      bitrate: Math.floor(Math.random() * 300) + 2400,
      droppedFrames: Math.floor(Math.random() * 5),
      cpuUsage: Math.floor(Math.random() * 20) + 15,
      timestamp: new Date().toISOString()
    });
  }, 1000);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    clearInterval(statsInterval);
  });
}
