import { v4 as uuidv4 } from 'uuid';
import { createLogger, format, transports } from 'winston';
const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.simple()),
  transports: [new transports.Console()],
});


const CHANNEL_TYPES = ['tv', 'radio', 'podcast', 'livestream', 'iptv'];
let channels = [];
let nowPlaying = {};

class ChannelController {
  list = (req, res) => {
    const { type, active } = req.query;
    let result = [...channels];
    if (type) result = result.filter(c => c.type === type);
    if (active !== undefined) result = result.filter(c => c.active === (active === 'true'));
    res.json({ channels: result, total: result.length });
  };
  get = (req, res) => {
    const ch = channels.find(c => c.id === req.params.id || c.slug === req.params.id);
    if (!ch) return res.status(404).json({ error: 'Channel not found' });
    res.json({ channel: { ...ch, nowPlaying: nowPlaying[ch.id] || null } });
  };
  create = (req, res) => {
    const { name, type, slug, description, rtmpUrl, rtmpKey, hlsUrl,
            bitrate, resolution, fps, audioChannels, audioBitrate,
            timezone, language, category, tags, color, logo } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    if (type && !CHANNEL_TYPES.includes(type))
      return res.status(400).json({ error: `type must be one of: ${CHANNEL_TYPES.join(', ')}` });
    const channel = {
      id: uuidv4(), name, type: type || 'tv',
      slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: description || '', logo: logo || null, color: color || '#6366f1',
      active: true, onAir: false, rtmpUrl: rtmpUrl || '', rtmpKey: rtmpKey || '',
      hlsUrl: hlsUrl || '', bitrate: bitrate || 4000, resolution: resolution || '1920x1080',
      fps: fps || 30, audioChannels: audioChannels || 2, audioBitrate: audioBitrate || 192,
      timezone: timezone || 'America/Mexico_City', language: language || 'es-MX',
      category: category || 'general', tags: tags || [], metadata: {},
      createdAt: new Date().toISOString(),
    };
    channels.push(channel);
    logger.info(`Channel created: ${name} [${type}]`);
    res.status(201).json({ channel });
  };
  update = (req, res) => {
    const ch = channels.find(c => c.id === req.params.id);
    if (!ch) return res.status(404).json({ error: 'Channel not found' });
    const forbidden = ['id', 'createdAt'];
    for (const [k, v] of Object.entries(req.body)) { if (!forbidden.includes(k)) ch[k] = v; }
    ch.updatedAt = new Date().toISOString();
    res.json({ channel: ch });
  };
  delete = (req, res) => {
    const idx = channels.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Channel not found' });
    channels.splice(idx, 1);
    res.json({ success: true });
  };
  setOnAir = (req, res) => {
    const ch = channels.find(c => c.id === req.params.id);
    if (!ch) return res.status(404).json({ error: 'Channel not found' });
    ch.onAir = !!req.body.onAir;
    ch.onAirSince = req.body.onAir ? new Date().toISOString() : null;
    logger.info(`Channel ${ch.name} onAir: ${ch.onAir}`);
    res.json({ channel: ch });
  };
  setNowPlaying = (req, res) => {
    const ch = channels.find(c => c.id === req.params.id);
    if (!ch) return res.status(404).json({ error: 'Channel not found' });
    nowPlaying[ch.id] = { ...req.body, startedAt: new Date().toISOString() };
    res.json({ nowPlaying: nowPlaying[ch.id] });
  };
  getTypes = (req, res) => res.json({ types: CHANNEL_TYPES });
}
export default new ChannelController();
