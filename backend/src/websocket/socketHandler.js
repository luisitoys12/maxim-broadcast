import { logger } from '../index.js';

export default function socketHandler(socket, io) {
  // Preview stream events
  socket.on('request-preview', () => {
    logger.info(`Preview requested by ${socket.id}`);
    // TODO: Send preview stream data
    socket.emit('preview-data', { status: 'streaming' });
  });

  // Scene change events
  socket.on('scene-change', (data) => {
    logger.info(`Scene change: ${data.sceneId}`);
    io.emit('scene-changed', data);
  });

  // Source visibility toggle
  socket.on('toggle-source', (data) => {
    logger.info(`Source toggle: ${data.sourceId}`);
    io.emit('source-toggled', data);
  });

  // Streaming status updates
  socket.on('stream-status', (data) => {
    io.emit('stream-status-update', data);
  });

  // Real-time stats
  const statsInterval = setInterval(() => {
    socket.emit('stats-update', {
      fps: Math.floor(Math.random() * 5) + 58,
      bitrate: Math.floor(Math.random() * 500) + 2000,
      droppedFrames: Math.floor(Math.random() * 10),
      cpuUsage: Math.floor(Math.random() * 30) + 20,
      timestamp: new Date().toISOString()
    });
  }, 1000);

  // Disconnect cleanup
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    clearInterval(statsInterval);
  });
}
