import { logger } from '../utils/logger.js';

export class WebSocketHandler {
  constructor(io, obsController, playoutEngine) {
    this.io = io;
    this.obsController = obsController;
    this.playoutEngine = playoutEngine;
    this.clients = new Map();
    
    this.setupSocketHandlers();
    this.setupOBSEventForwarding();
    this.setupPlayoutEventForwarding();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`🔌 Cliente conectado: ${socket.id}`);
      this.clients.set(socket.id, { socket, connectedAt: Date.now() });

      // Enviar estado inicial
      socket.emit('initial_state', {
        obs: this.obsController.getStatus(),
        playout: {
          running: this.playoutEngine.isRunning(),
          currentItem: this.playoutEngine.getCurrentItem(),
          schedule: this.playoutEngine.getSchedule()
        }
      });

      // OBS Controls
      socket.on('obs:connect', async (data) => {
        try {
          await this.obsController.connect();
          socket.emit('obs:connected', { success: true });
        } catch (error) {
          socket.emit('obs:error', { error: error.message });
        }
      });

      socket.on('obs:disconnect', async () => {
        try {
          await this.obsController.disconnect();
          socket.emit('obs:disconnected', { success: true });
        } catch (error) {
          socket.emit('obs:error', { error: error.message });
        }
      });

      socket.on('obs:getScenes', async () => {
        try {
          const scenes = await this.obsController.getScenes();
          socket.emit('obs:scenes', scenes);
        } catch (error) {
          socket.emit('obs:error', { error: error.message });
        }
      });

      socket.on('obs:setScene', async (data) => {
        try {
          const result = await this.obsController.setCurrentScene(data.sceneName);
          socket.emit('obs:sceneChanged', result);
        } catch (error) {
          socket.emit('obs:error', { error: error.message });
        }
      });

      socket.on('obs:startStreaming', async () => {
        try {
          const result = await this.obsController.startStreaming();
          this.io.emit('obs:streamingStarted', result);
        } catch (error) {
          socket.emit('obs:error', { error: error.message });
        }
      });

      socket.on('obs:stopStreaming', async () => {
        try {
          const result = await this.obsController.stopStreaming();
          this.io.emit('obs:streamingStopped', result);
        } catch (error) {
          socket.emit('obs:error', { error: error.message });
        }
      });

      socket.on('obs:startRecording', async () => {
        try {
          const result = await this.obsController.startRecording();
          this.io.emit('obs:recordingStarted', result);
        } catch (error) {
          socket.emit('obs:error', { error: error.message });
        }
      });

      socket.on('obs:stopRecording', async () => {
        try {
          const result = await this.obsController.stopRecording();
          this.io.emit('obs:recordingStopped', result);
        } catch (error) {
          socket.emit('obs:error', { error: error.message });
        }
      });

      // Playout Controls
      socket.on('playout:start', async () => {
        try {
          await this.playoutEngine.start();
          this.io.emit('playout:started', { success: true });
        } catch (error) {
          socket.emit('playout:error', { error: error.message });
        }
      });

      socket.on('playout:stop', async () => {
        try {
          await this.playoutEngine.stop();
          this.io.emit('playout:stopped', { success: true });
        } catch (error) {
          socket.emit('playout:error', { error: error.message });
        }
      });

      socket.on('playout:skip', async () => {
        try {
          await this.playoutEngine.skipCurrent();
          this.io.emit('playout:skipped', { success: true });
        } catch (error) {
          socket.emit('playout:error', { error: error.message });
        }
      });

      socket.on('playout:addItem', async (data) => {
        try {
          const item = await this.playoutEngine.addItem(data);
          this.io.emit('playout:itemAdded', item);
        } catch (error) {
          socket.emit('playout:error', { error: error.message });
        }
      });

      // Disconnect
      socket.on('disconnect', () => {
        logger.info(`🔌 Cliente desconectado: ${socket.id}`);
        this.clients.delete(socket.id);
      });
    });
  }

  setupOBSEventForwarding() {
    // Reenviar eventos de OBS a todos los clientes conectados
    this.obsController.on('connected', () => {
      this.io.emit('obs:connected', { connected: true });
    });

    this.obsController.on('disconnected', () => {
      this.io.emit('obs:disconnected', { connected: false });
    });

    this.obsController.on('sceneChanged', (sceneName) => {
      this.io.emit('obs:sceneChanged', { sceneName });
    });

    this.obsController.on('streamingStateChanged', (streaming) => {
      this.io.emit('obs:streamingState', { streaming });
    });

    this.obsController.on('recordingStateChanged', (recording) => {
      this.io.emit('obs:recordingState', { recording });
    });
  }

  setupPlayoutEventForwarding() {
    this.playoutEngine.on('itemStarted', (item) => {
      this.io.emit('playout:itemStarted', item);
    });

    this.playoutEngine.on('itemEnded', (item) => {
      this.io.emit('playout:itemEnded', item);
    });

    this.playoutEngine.on('scheduleUpdated', (schedule) => {
      this.io.emit('playout:scheduleUpdated', schedule);
    });
  }

  getConnectedClients() {
    return Array.from(this.clients.values()).map(client => ({
      id: client.socket.id,
      connectedAt: client.connectedAt
    }));
  }
}
