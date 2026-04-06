import { logger } from '../index.js';
import obs from '../lib/obsWebSocket.js';
import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

const RECORDINGS_PATH = process.env.RECORDINGS_PATH || './recordings';
mkdirSync(RECORDINGS_PATH, { recursive: true });

// Fallback FFmpeg for standalone streaming (when OBS is not connected)
let ffmpegProcess = null;

class OBSController {
  async initialize() {
    // Auto-connect to OBS if env vars are set
    if (process.env.OBS_WS_HOST || process.env.OBS_WS_PASSWORD) {
      try {
        await obs.connect();
        logger.info('Auto-connected to OBS WebSocket');
      } catch (err) {
        logger.warn(`OBS not available at startup: ${err.message} — standalone mode`);
      }
    } else {
      logger.info('OBS Controller ready (connect via /api/obs/connect)');
    }
    return true;
  }

  // ─── CONNECTION ─────────────────────────────
  connect = async (req, res) => {
    const { host, port, password } = req.body;
    try {
      const result = await obs.connect(host, port, password);
      const version = await obs.getVersion();
      res.json({
        connected: true,
        obsVersion: version.obsVersion,
        wsVersion: version.obsWebSocketVersion,
        platform: version.platformDescription
      });
    } catch (err) {
      res.status(502).json({ error: `Cannot connect to OBS: ${err.message}`, hint: 'Verify OBS is running with WebSocket server enabled (Tools → obs-websocket Settings)' });
    }
  };

  disconnect = async (req, res) => {
    await obs.disconnect();
    res.json({ connected: false });
  };

  // ─── STATUS ─────────────────────────────────
  getStatus = async (req, res) => {
    if (!obs.connected) {
      return res.json({
        connected: false,
        mode: 'standalone',
        streaming: !!ffmpegProcess,
        streamPid: ffmpegProcess?.pid || null,
        hint: 'POST /api/obs/connect with {host, port, password} to connect to OBS'
      });
    }

    try {
      const [stream, record, stats, video, scenes] = await Promise.all([
        obs.getStreamStatus().catch(() => null),
        obs.getRecordStatus().catch(() => null),
        obs.getStats().catch(() => null),
        obs.getVideoSettings().catch(() => null),
        obs.getScenes().catch(() => null)
      ]);

      res.json({
        connected: true,
        mode: 'obs',
        streaming: stream?.outputActive || false,
        streamTimecode: stream?.outputTimecode || null,
        streamBytes: stream?.outputBytes || 0,
        recording: record?.outputActive || false,
        recordTimecode: record?.outputTimecode || null,
        currentScene: scenes?.current || null,
        previewScene: scenes?.preview || null,
        fps: stats?.activeFps ? Math.round(stats.activeFps) : 0,
        cpuUsage: stats?.cpuUsage ? Math.round(stats.cpuUsage * 10) / 10 : 0,
        memoryUsage: stats?.memoryUsage ? Math.round(stats.memoryUsage) : 0,
        renderSkipped: stats?.renderSkippedFrames || 0,
        outputSkipped: stats?.outputSkippedFrames || 0,
        resolution: video ? `${video.baseWidth}x${video.baseHeight}` : null,
        outputResolution: video ? `${video.outputWidth}x${video.outputHeight}` : null,
        framerate: video?.fpsNumerator || null
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // ─── SCENES ─────────────────────────────────
  getScenes = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    try {
      const data = await obs.getScenes();
      res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  setScene = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    const { name, preview } = req.body;
    try {
      if (preview) await obs.setPreviewScene(name);
      else await obs.setCurrentScene(name);
      res.json({ success: true, scene: name, preview: !!preview });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  createScene = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    try {
      await obs.createScene(req.body.name);
      res.status(201).json({ success: true, scene: req.body.name });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  removeScene = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    try {
      await obs.removeScene(req.params.name);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  // ─── SOURCES ────────────────────────────────
  getSceneItems = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    try {
      const items = await obs.getSceneItems(req.params.scene);
      res.json({ items });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  setSourceVisible = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    const { scene, itemId, visible } = req.body;
    try {
      await obs.setSourceVisible(scene, itemId, visible);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  // ─── STREAMING ──────────────────────────────
  startStreaming = async (req, res) => {
    if (obs.connected) {
      try {
        // Optionally update stream settings before starting
        if (req.body.server) {
          await obs.setStreamSettings(req.body.type || 'rtmp_custom', {
            server: req.body.server,
            key: req.body.key || ''
          });
        }
        await obs.startStream();
        logger.info('OBS stream started');
        res.json({ success: true, mode: 'obs', message: 'Stream started via OBS' });
      } catch (err) { res.status(500).json({ error: err.message }); }
    } else {
      // Standalone FFmpeg fallback
      const { server, key, bitrate, resolution, fps, input } = req.body || {};
      if (!server) return res.status(400).json({ error: 'server URL required' });

      const rtmpUrl = key ? `${server}/${key}` : server;
      const br = bitrate || 2500;
      const rez = resolution || '1920x1080';
      const rate = fps || 25;

      let inputArgs;
      if (input && existsSync(input)) {
        inputArgs = ['-re', '-stream_loop', '-1', '-i', input];
      } else {
        inputArgs = [
          '-f', 'lavfi', '-i',
          `color=c=0x0E1020:s=${rez}:r=${rate},drawtext=text='MAXIM BROADCAST - EN VIVO':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h/2-30,drawtext=text='%{localtime}':fontcolor=yellow:fontsize=36:x=(w-text_w)/2:y=h/2+40`,
          '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo'
        ];
      }

      const args = [
        ...inputArgs,
        '-c:v', 'libx264', '-preset', 'veryfast', '-b:v', `${br}k`,
        '-maxrate', `${br}k`, '-bufsize', `${br * 2}k`,
        '-pix_fmt', 'yuv420p', '-g', `${rate * 2}`,
        '-c:a', 'aac', '-b:a', '128k', '-ar', '44100',
        '-f', 'flv', rtmpUrl
      ];

      ffmpegProcess = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
      ffmpegProcess.on('close', () => { ffmpegProcess = null; });

      logger.info(`Standalone stream started → ${server}`);
      res.json({ success: true, mode: 'standalone', pid: ffmpegProcess.pid });
    }
  };

  stopStreaming = async (req, res) => {
    if (obs.connected) {
      try {
        await obs.stopStream();
        logger.info('OBS stream stopped');
        res.json({ success: true, mode: 'obs' });
      } catch (err) { res.status(500).json({ error: err.message }); }
    } else if (ffmpegProcess) {
      const pid = ffmpegProcess.pid;
      ffmpegProcess.kill('SIGTERM');
      ffmpegProcess = null;
      res.json({ success: true, mode: 'standalone', pid });
    } else {
      res.status(409).json({ error: 'Not streaming' });
    }
  };

  // ─── RECORDING ──────────────────────────────
  startRecording = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    try {
      await obs.startRecord();
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  stopRecording = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    try {
      const result = await obs.stopRecord();
      res.json({ success: true, outputPath: result?.outputPath });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  // ─── AUDIO ──────────────────────────────────
  getInputs = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    try {
      const data = await obs.getInputList();
      res.json({ inputs: data.inputs });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  setVolume = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    const { name, volumeDb } = req.body;
    try {
      await obs.setInputVolume(name, volumeDb);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  setMute = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    const { name, muted } = req.body;
    try {
      await obs.setInputMute(name, muted);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  // ─── TRANSITIONS ────────────────────────────
  getTransitions = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    try {
      const data = await obs.getTransitions();
      res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  setTransition = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    try {
      await obs.setTransition(req.body.name);
      if (req.body.duration) await obs.setTransitionDuration(req.body.duration);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  triggerTransition = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    try {
      await obs.triggerTransition();
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  // ─── SCREENSHOT / PREVIEW ───────────────────
  getScreenshot = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    try {
      const imageData = await obs.getCurrentProgramScreenshot(
        parseInt(req.query.w) || 640,
        parseInt(req.query.h) || 360
      );
      res.json({ imageData });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  // ─── STUDIO MODE ────────────────────────────
  getStudioMode = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    try {
      const data = await obs.getStudioMode();
      res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  setStudioMode = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    try {
      await obs.setStudioMode(req.body.enabled);
      res.json({ success: true, studioMode: req.body.enabled });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  // ─── STREAM SETTINGS ───────────────────────
  getStreamSettings = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    try {
      const data = await obs.getStreamSettings();
      res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
  };

  setStreamSettings = async (req, res) => {
    if (!obs.connected) return res.status(503).json({ error: 'OBS not connected' });
    const { type, server, key } = req.body;
    try {
      await obs.setStreamSettings(type, { server, key });
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  };
}

export default new OBSController();
