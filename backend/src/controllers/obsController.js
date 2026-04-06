import { logger } from '../index.js';
import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

const RECORDINGS_PATH = process.env.RECORDINGS_PATH || './recordings';
mkdirSync(RECORDINGS_PATH, { recursive: true });

class OBSController {
  constructor() {
    this.ffmpegProcess = null;
    this.ffmpegRecProcess = null;
    this.isStreaming = false;
    this.isRecording = false;
    this.currentScene = null;
    this.streamStartedAt = null;
    this.streamProfile = null;
    this.mediaInputs = []; // files queued for playout
  }

  async initialize() {
    logger.info('OBS Controller initialized (FFmpeg real engine)');
    return true;
  }

  getStatus = (req, res) => {
    const uptime = this.streamStartedAt
      ? Math.round((Date.now() - this.streamStartedAt) / 1000)
      : 0;

    res.json({
      initialized: true,
      streaming: this.isStreaming,
      recording: this.isRecording,
      currentScene: this.currentScene,
      streamPid: this.ffmpegProcess?.pid || null,
      recordPid: this.ffmpegRecProcess?.pid || null,
      uptime,
      profile: this.streamProfile,
      version: 'FFmpeg real engine'
    });
  };

  // ─── STREAMING (real FFmpeg → RTMP) ───────────
  startStreaming = async (req, res) => {
    if (this.isStreaming) return res.status(409).json({ error: 'Already streaming' });

    const { server, key, bitrate, resolution, fps, input } = req.body || {};
    if (!server) return res.status(400).json({ error: 'server URL required in body or set a profile first' });

    const rtmpUrl = key ? `${server}/${key}` : server;
    const br = bitrate || 2500;
    const rez = resolution || '1920x1080';
    const rate = fps || 25;

    // Determine input source
    let inputArgs;
    if (input && existsSync(input)) {
      // Stream a file (playout mode)
      inputArgs = ['-re', '-stream_loop', '-1', '-i', input];
    } else if (this.mediaInputs.length > 0) {
      // Stream queued media
      const firstFile = this.mediaInputs[0];
      inputArgs = ['-re', '-stream_loop', '-1', '-i', firstFile];
    } else {
      // Generate test pattern with broadcast info
      inputArgs = [
        '-f', 'lavfi', '-i',
        `color=c=0x0E1020:s=${rez}:r=${rate},drawtext=text='MAXIM BROADCAST - EN VIVO':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h/2-30:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf,drawtext=text='%{localtime}':fontcolor=yellow:fontsize=36:x=(w-text_w)/2:y=h/2+40:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`,
        '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo'
      ];
    }

    const ffmpegArgs = [
      ...inputArgs,
      '-c:v', 'libx264', '-preset', 'veryfast', '-b:v', `${br}k`,
      '-maxrate', `${br}k`, '-bufsize', `${br * 2}k`,
      '-pix_fmt', 'yuv420p', '-g', `${rate * 2}`,
      '-c:a', 'aac', '-b:a', '128k', '-ar', '44100',
      '-f', 'flv', rtmpUrl
    ];

    try {
      this.ffmpegProcess = spawn('ffmpeg', ffmpegArgs, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      this.ffmpegProcess.stderr.on('data', (data) => {
        const line = data.toString().trim();
        if (line.includes('frame=') || line.includes('speed=')) {
          // Normal progress — don't spam logs
        } else {
          logger.info(`FFmpeg: ${line.slice(0, 200)}`);
        }
      });

      this.ffmpegProcess.on('close', (code) => {
        logger.info(`FFmpeg stream ended (code ${code})`);
        this.isStreaming = false;
        this.ffmpegProcess = null;
        this.streamStartedAt = null;
      });

      this.ffmpegProcess.on('error', (err) => {
        logger.error(`FFmpeg error: ${err.message}`);
        this.isStreaming = false;
        this.ffmpegProcess = null;
      });

      this.isStreaming = true;
      this.streamStartedAt = Date.now();
      this.streamProfile = { server: server.replace(/\?.*/,''), bitrate: br, resolution: rez, fps: rate };

      logger.info(`Stream STARTED → ${server.replace(/\?.*/,'')} @ ${br}kbps ${rez}`);

      // Emit via socket
      try {
        const { io } = await import('../index.js');
        if (io) io.emit('stream-status-update', { streaming: true, pid: this.ffmpegProcess.pid });
      } catch {}

      res.json({
        success: true,
        message: 'Streaming started',
        pid: this.ffmpegProcess.pid,
        rtmp: server.replace(/\?.*/,''),
        bitrate: br,
        resolution: rez
      });
    } catch (err) {
      logger.error(`Failed to start stream: ${err.message}`);
      res.status(500).json({ error: `Failed to start: ${err.message}` });
    }
  };

  stopStreaming = async (req, res) => {
    if (!this.isStreaming || !this.ffmpegProcess) {
      return res.status(409).json({ error: 'Not streaming' });
    }
    const pid = this.ffmpegProcess.pid;
    this.ffmpegProcess.kill('SIGTERM');
    this.isStreaming = false;
    this.ffmpegProcess = null;

    const uptime = this.streamStartedAt
      ? Math.round((Date.now() - this.streamStartedAt) / 1000)
      : 0;
    this.streamStartedAt = null;

    logger.info(`Stream STOPPED (PID ${pid}, uptime ${uptime}s)`);

    try {
      const { io } = await import('../index.js');
      if (io) io.emit('stream-status-update', { streaming: false });
    } catch {}

    res.json({ success: true, message: 'Streaming stopped', pid, uptime });
  };

  // ─── RECORDING (real FFmpeg → file) ───────────
  startRecording = async (req, res) => {
    if (this.isRecording) return res.status(409).json({ error: 'Already recording' });

    const filename = `recording-${Date.now()}.mp4`;
    const outputPath = `${RECORDINGS_PATH}/${filename}`;

    const args = [
      '-f', 'lavfi', '-i', 'color=c=0x0E1020:s=1920x1080:r=25',
      '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k',
      '-t', '3600', // max 1 hour
      '-y', outputPath
    ];

    this.ffmpegRecProcess = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    this.isRecording = true;

    this.ffmpegRecProcess.on('close', () => {
      this.isRecording = false;
      this.ffmpegRecProcess = null;
    });

    logger.info(`Recording STARTED → ${outputPath}`);
    res.json({ success: true, message: 'Recording started', file: filename, pid: this.ffmpegRecProcess.pid });
  };

  stopRecording = async (req, res) => {
    if (!this.isRecording || !this.ffmpegRecProcess) {
      return res.status(409).json({ error: 'Not recording' });
    }
    const pid = this.ffmpegRecProcess.pid;
    this.ffmpegRecProcess.kill('SIGTERM');
    this.isRecording = false;
    this.ffmpegRecProcess = null;

    logger.info(`Recording STOPPED (PID ${pid})`);
    res.json({ success: true, message: 'Recording stopped', pid });
  };

  // Set media for playout streaming
  setPlayoutMedia = (filePath) => {
    if (existsSync(filePath)) {
      this.mediaInputs = [filePath];
      logger.info(`Playout media set: ${filePath}`);
    }
  };
}

export default new OBSController();
