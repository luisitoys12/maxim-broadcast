import OBSWebSocket from 'obs-websocket-js';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

export class OBSController extends EventEmitter {
  constructor() {
    super();
    this.obs = new OBSWebSocket();
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 5000;
    this.status = {
      streaming: false,
      recording: false,
      virtualCam: false,
      currentScene: null,
      fps: 0,
      cpuUsage: 0,
      memoryUsage: 0
    };
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Eventos de conexión
    this.obs.on('ConnectionOpened', () => {
      logger.info('🔗 Conexión con OBS establecida');
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      this.updateStatus();
    });

    this.obs.on('ConnectionClosed', () => {
      logger.warn('🔌 Conexión con OBS cerrada');
      this.connected = false;
      this.emit('disconnected');
      this.attemptReconnect();
    });

    this.obs.on('ConnectionError', (error) => {
      logger.error('❌ Error de conexión con OBS:', error);
      this.connected = false;
      this.emit('error', error);
    });

    // Eventos de OBS
    this.obs.on('CurrentProgramSceneChanged', (data) => {
      logger.info(`🎬 Escena cambiada a: ${data.sceneName}`);
      this.status.currentScene = data.sceneName;
      this.emit('sceneChanged', data.sceneName);
    });

    this.obs.on('StreamStateChanged', (data) => {
      const streaming = data.outputActive;
      logger.info(`📡 Streaming: ${streaming ? 'Iniciado' : 'Detenido'}`);
      this.status.streaming = streaming;
      this.emit('streamingStateChanged', streaming);
    });

    this.obs.on('RecordStateChanged', (data) => {
      const recording = data.outputActive;
      logger.info(`⏺ Grabación: ${recording ? 'Iniciada' : 'Detenida'}`);
      this.status.recording = recording;
      this.emit('recordingStateChanged', recording);
    });

    this.obs.on('VirtualcamStateChanged', (data) => {
      const active = data.outputActive;
      logger.info(`🎥 Cámara Virtual: ${active ? 'Activada' : 'Desactivada'}`);
      this.status.virtualCam = active;
      this.emit('virtualCamStateChanged', active);
    });
  }

  async connect() {
    const url = process.env.OBS_WEBSOCKET_URL || 'ws://localhost:4455';
    const password = process.env.OBS_WEBSOCKET_PASSWORD || '';

    try {
      await this.obs.connect(url, password);
      logger.info(`✅ Conectado a OBS en ${url}`);
      return true;
    } catch (error) {
      logger.error(`❌ Error al conectar con OBS: ${error.message}`);
      throw error;
    }
  }

  async disconnect() {
    if (this.connected) {
      await this.obs.disconnect();
      logger.info('Desconectado de OBS');
    }
  }

  async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(`❌ Máximo de intentos de reconexión alcanzado (${this.maxReconnectAttempts})`);
      return;
    }

    this.reconnectAttempts++;
    logger.info(`🔄 Intentando reconectar a OBS (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        logger.error('Error en reconexión:', error.message);
      }
    }, this.reconnectDelay);
  }

  async updateStatus() {
    if (!this.connected) return;

    try {
      // Obtener estado de streaming
      const streamStatus = await this.obs.call('GetStreamStatus');
      this.status.streaming = streamStatus.outputActive;

      // Obtener estado de grabación
      const recordStatus = await this.obs.call('GetRecordStatus');
      this.status.recording = recordStatus.outputActive;

      // Obtener escena actual
      const currentScene = await this.obs.call('GetCurrentProgramScene');
      this.status.currentScene = currentScene.currentProgramSceneName;

      // Obtener estadísticas
      const stats = await this.obs.call('GetStats');
      this.status.fps = stats.activeFps;
      this.status.cpuUsage = stats.cpuUsage;
      this.status.memoryUsage = stats.memoryUsage;

    } catch (error) {
      logger.error('Error actualizando status:', error.message);
    }
  }

  // Métodos de control
  async getScenes() {
    const { scenes } = await this.obs.call('GetSceneList');
    return scenes;
  }

  async setCurrentScene(sceneName) {
    await this.obs.call('SetCurrentProgramScene', { sceneName });
    return { success: true, scene: sceneName };
  }

  async getSources() {
    const scenes = await this.getScenes();
    const allSources = [];
    
    for (const scene of scenes) {
      const { sceneItems } = await this.obs.call('GetSceneItemList', { 
        sceneName: scene.sceneName 
      });
      allSources.push(...sceneItems);
    }
    
    return allSources;
  }

  async startStreaming() {
    await this.obs.call('StartStream');
    return { success: true, action: 'streaming_started' };
  }

  async stopStreaming() {
    await this.obs.call('StopStream');
    return { success: true, action: 'streaming_stopped' };
  }

  async startRecording() {
    await this.obs.call('StartRecord');
    return { success: true, action: 'recording_started' };
  }

  async stopRecording() {
    await this.obs.call('StopRecord');
    return { success: true, action: 'recording_stopped' };
  }

  async toggleVirtualCam() {
    await this.obs.call('ToggleVirtualCam');
    return { success: true, action: 'virtual_cam_toggled' };
  }

  async setSourceSettings(sourceName, settings) {
    await this.obs.call('SetInputSettings', {
      inputName: sourceName,
      inputSettings: settings
    });
    return { success: true, source: sourceName };
  }

  async triggerTransition(transitionName, duration = 300) {
    await this.obs.call('TriggerStudioModeTransition');
    return { success: true, transition: transitionName, duration };
  }

  // Getters
  isConnected() {
    return this.connected;
  }

  getStatus() {
    return { ...this.status, connected: this.connected };
  }
}
