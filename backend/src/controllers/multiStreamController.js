import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';
import { createLogger, format, transports } from 'winston';
const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.simple()),
  transports: [new transports.Console()],
});


const PLATFORMS = {
  youtube:   { rtmpBase: 'rtmp://a.rtmp.youtube.com/live2/',            label: 'YouTube Live' },
  facebook:  { rtmpBase: 'rtmps://live-api-s.facebook.com:443/rtmp/',  label: 'Facebook Live' },
  twitch:    { rtmpBase: 'rtmp://live.twitch.tv/app/',                  label: 'Twitch' },
  tiktok:    { rtmpBase: 'rtmp://push.tiktokcdn.com/origin/',           label: 'TikTok Live' },
  instagram: { rtmpBase: 'rtmps://live-upload.instagram.com:443/rtmp/', label: 'Instagram Live' },
  custom:    { rtmpBase: '',                                             label: 'Custom RTMP' },
};

let destinations = [];
let activeProcesses = {};

class MultiStreamController {
  getPlatforms = (req, res) => {
    res.json({ platforms: Object.entries(PLATFORMS).map(([id, p]) => ({ id, ...p })) });
  };
  getDestinations = (req, res) => {
    const { channelId } = req.query;
    res.json({ destinations: channelId ? destinations.filter(d => d.channelId === channelId) : destinations });
  };
  addDestination = (req, res) => {
    const { channelId, platform, url, key, label, bitrate, resolution, fps } = req.body;
    if (!platform && !url) return res.status(400).json({ error: 'platform or url required' });
    const pInfo = PLATFORMS[platform] || PLATFORMS[custom];
    const rtmpUrl = url || (pInfo.rtmpBase + (key || ''));
    const dest = {
      id: uuidv4(), channelId: channelId || null, platform: platform || 'custom',
      label: label || pInfo.label, url: rtmpUrl, key: key || '',
      bitrate: bitrate || 4000, resolution: resolution || '1920x1080', fps: fps || 30,
      enabled: true, status: 'idle', pid: null, startedAt: null,
      stats: { bytesSent: 0, uptime: 0, errors: 0 }, createdAt: new Date().toISOString(),
    };
    destinations.push(dest);
    logger.info(`Destination added: ${dest.label}`);
    res.status(201).json({ destination: dest });
  };
  updateDestination = (req, res) => {
    const dest = destinations.find(d => d.id === req.params.id);
    if (!dest) return res.status(404).json({ error: 'Destination not found' });
    Object.assign(dest, req.body); res.json({ destination: dest });
  };
  deleteDestination = (req, res) => {
    const idx = destinations.findIndex(d => d.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Destination not found' });
    const dest = destinations[idx];
    if (dest.pid && activeProcesses[dest.pid]) { activeProcesses[dest.pid].kill('SIGTERM'); delete activeProcesses[dest.pid]; }
    destinations.splice(idx, 1); res.json({ success: true });
  };
  startAll = (req, res) => {
    const { channelId, source, destinationIds } = req.body;
    if (!source) return res.status(400).json({ error: 'source (rtmp/srt/device) is required' });
    const targets = destinations.filter(d => d.enabled && (!channelId || d.channelId === channelId) && (!destinationIds || destinationIds.includes(d.id)));
    if (!targets.length) return res.status(400).json({ error: 'No enabled destinations found' });
    const results = [];
    for (const dest of targets) {
      if (dest.status === 'streaming') { results.push({ id: dest.id, status: 'already_streaming' }); continue; }
      try {
        const args = ['-re', '-i', source, '-c:v', 'libx264', '-preset', 'veryfast', '-b:v', `${dest.bitrate}k`, '-maxrate', `${dest.bitrate}k`, '-bufsize', `${dest.bitrate * 2}k`, '-vf', `scale=${dest.resolution.replace('x', ':')}`, '-r', String(dest.fps), '-c:a', 'aac', '-b:a', '128k', '-ar', '44100', '-f', 'hlv', dest.url];
        const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
        dest.pid = proc.pid; dest.status = 'streaming'; dest.startedAt = new Date().toISOString();
        activeProcesses[proc.pid] = proc;
        proc.on('exit', (code) => { dest.status = code === 0 ? 'idle' : 'error'; dest.pid = null; delete activeProcesses[proc.pid]; });
        results.push({ id: dest.id, status: 'started', pid: proc.pid });
        logger.info(`Streaming to ${dest.label} started (pid ${proc.pid})`);
      } catch (err) { dest.status = 'error'; dest.stats.errors++; results.push({ id: dest.id, status: 'error', error: err.message }); }
    }
    res.json({ results });
  };
  stopAll = (req, res) => {
    const { destinationIds } = req.body;
    const targets = destinationIds ? destinations.filter(d => destinationIds.includes(d.id)) : destinations.filter(d => d.status === 'streaming');
    const results = [];
    for (const dest of targets) {
      if (dest.pid && activeProcesses[dest.pid]) {
        activeProcesses[dest.pid].kill('SIGTERM'); delete activeProcesses[dest.pid];
        dest.status = 'idle'; dest.pid = null; dest.startedAt = null;
        results.push({ id: dest.id, status: 'stopped' });
      } else { results.push({ id: dest.id, status: 'not_streaming' }); }
    }
    res.json({ results });
  };
  getStatus = (req, res) => {
    const { channelId } = req.query;
    const result = channelId ? destinations.filter(d => d.channelId === channelId) : destinations;
    res.json({
      destinations: result.map(d => ({ id: d.id, label: d.label, platform: d.platform, status: d.status, startedAt: d.startedAt, stats: d.stats })),
      totalStreaming: destinations.filter(d => d.status === 'streaming').length,
    });
  };
}
export default new MultiStreamController();
