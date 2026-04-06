import OBSWebSocket from 'obs-websocket-js';
import { logger } from '../index.js';

class OBSConnection {
  constructor() {
    this.obs = new OBSWebSocket();
    this.connected = false;
    this.config = {
      host: process.env.OBS_WS_HOST || 'localhost',
      port: process.env.OBS_WS_PORT || 4455,
      password: process.env.OBS_WS_PASSWORD || ''
    };

    this.obs.on('ConnectionClosed', () => {
      this.connected = false;
      logger.warn('OBS WebSocket disconnected');
    });

    this.obs.on('ConnectionError', (err) => {
      this.connected = false;
      logger.error(`OBS WebSocket error: ${err.message}`);
    });
  }

  async connect(host, port, password) {
    if (host) this.config.host = host;
    if (port) this.config.port = port;
    if (password !== undefined) this.config.password = password;

    const url = `ws://${this.config.host}:${this.config.port}`;
    try {
      await this.obs.connect(url, this.config.password || undefined);
      this.connected = true;
      logger.info(`Connected to OBS at ${url}`);
      return { connected: true, url };
    } catch (err) {
      this.connected = false;
      logger.error(`Failed to connect to OBS: ${err.message}`);
      throw err;
    }
  }

  async disconnect() {
    await this.obs.disconnect();
    this.connected = false;
  }

  async call(requestType, requestData) {
    if (!this.connected) throw new Error('Not connected to OBS');
    return this.obs.call(requestType, requestData);
  }

  // ─── Scenes ───────────────────────────────
  async getScenes() {
    const data = await this.call('GetSceneList');
    return {
      current: data.currentProgramSceneName,
      preview: data.currentPreviewSceneName,
      scenes: data.scenes.reverse()
    };
  }

  async setCurrentScene(sceneName) {
    await this.call('SetCurrentProgramScene', { sceneName });
  }

  async setPreviewScene(sceneName) {
    await this.call('SetCurrentPreviewScene', { sceneName });
  }

  async createScene(sceneName) {
    await this.call('CreateScene', { sceneName });
  }

  async removeScene(sceneName) {
    await this.call('RemoveScene', { sceneName });
  }

  // ─── Sources ──────────────────────────────
  async getSceneItems(sceneName) {
    const data = await this.call('GetSceneItemList', { sceneName });
    return data.sceneItems;
  }

  async setSourceVisible(sceneName, sceneItemId, visible) {
    await this.call('SetSceneItemEnabled', {
      sceneName,
      sceneItemId,
      sceneItemEnabled: visible
    });
  }

  async getSourceScreenshot(sourceName, width = 320, height = 180) {
    const data = await this.call('GetSourceScreenshot', {
      sourceName,
      imageFormat: 'jpg',
      imageWidth: width,
      imageHeight: height,
      imageCompressionQuality: 60
    });
    return data.imageData;
  }

  // ─── Streaming ────────────────────────────
  async getStreamStatus() {
    return this.call('GetStreamStatus');
  }

  async startStream() {
    await this.call('StartStream');
  }

  async stopStream() {
    await this.call('StopStream');
  }

  async getStreamSettings() {
    return this.call('GetStreamServiceSettings');
  }

  async setStreamSettings(type, settings) {
    await this.call('SetStreamServiceSettings', {
      streamServiceType: type || 'rtmp_custom',
      streamServiceSettings: settings
    });
  }

  // ─── Recording ────────────────────────────
  async getRecordStatus() {
    return this.call('GetRecordStatus');
  }

  async startRecord() {
    await this.call('StartRecord');
  }

  async stopRecord() {
    return this.call('StopRecord');
  }

  async toggleRecordPause() {
    await this.call('ToggleRecordPause');
  }

  // ─── Audio ────────────────────────────────
  async getInputVolume(inputName) {
    return this.call('GetInputVolume', { inputName });
  }

  async setInputVolume(inputName, volumeDb) {
    await this.call('SetInputVolume', { inputName, inputVolumeDb: volumeDb });
  }

  async setInputMute(inputName, muted) {
    await this.call('SetInputMute', { inputName, inputMuted: muted });
  }

  async getInputList() {
    return this.call('GetInputList');
  }

  // ─── Transitions ──────────────────────────
  async getTransitions() {
    return this.call('GetSceneTransitionList');
  }

  async setTransition(name) {
    await this.call('SetCurrentSceneTransition', { transitionName: name });
  }

  async setTransitionDuration(duration) {
    await this.call('SetCurrentSceneTransitionDuration', { transitionDuration: duration });
  }

  async triggerTransition() {
    await this.call('TriggerStudioModeTransition');
  }

  // ─── General ──────────────────────────────
  async getVersion() {
    return this.call('GetVersion');
  }

  async getStats() {
    return this.call('GetStats');
  }

  async getVideoSettings() {
    return this.call('GetVideoSettings');
  }

  async getOutputStatus(outputName = 'adv_stream') {
    return this.call('GetOutputStatus', { outputName });
  }

  // ─── Studio Mode ──────────────────────────
  async getStudioMode() {
    return this.call('GetStudioModeEnabled');
  }

  async setStudioMode(enabled) {
    await this.call('SetStudioModeEnabled', { studioModeEnabled: enabled });
  }

  // ─── Screenshot ───────────────────────────
  async getCurrentProgramScreenshot(width = 640, height = 360) {
    const scenes = await this.getScenes();
    return this.getSourceScreenshot(scenes.current, width, height);
  }
}

export default new OBSConnection();
