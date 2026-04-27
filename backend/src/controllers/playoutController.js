import { v4 as uuidv4 } from 'uuid';
import { createLogger, format, transports } from 'winston';
const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.simple()),
  transports: [new transports.Console()],
});


let schedule = [];
let commercials = [];
let fillers = [];
const ITEM_TYPES = ['live', 'vod', 'music', 'commercial', 'news', 'filler', 'promo'];

function getCurrentProgram(channelId) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const timeNow = now.toTimeString().slice(0, 5);
  return schedule.find(item => {
    if (item.channelId !== channelId || !item.active) return false;
    if (item.repeat === 'daily') return item.startTime <= timeNow && timeNow < item.endTime;
    if (item.date) return item.date === today && item.startTime <= timeNow && timeNow < item.endTime;
    return false;
  }) || null;
}
function getUpcomingPrograms(channelId, count = 5) {
  const timeNow = new Date().toTimeString().slice(0, 5);
  return schedule.filter(i => i.channelId === channelId && i.active && i.startTime > timeNow)
    .sort((a, b) => a.startTime.localeCompare(b.startTime)).slice(0, count);
}

class PlayoutController {
  getSchedule = (req, res) => {
    const { channelId, date, type } = req.query;
    let items = [...schedule];
    if (channelId) items = items.filter(i => i.channelId === channelId);
    if (date) items = items.filter(i => i.date === date || i.repeat === 'daily');
    if (type) items = items.filter(i => i.type === type);
    items.sort((a, b) => a.startTime.localeCompare(b.startTime));
    res.json({ schedule: items, total: items.length });
  };
  addItem = (req, res) => {
    const { channelId, title, type, startTime, endTime, duration, repeat, date, source, metadata } = req.body;
    if (!channelId || !title || !startTime)
      return res.status(400).json({ error: 'channelId, title, startTime are required' });
    if (type && !ITEM_TYPES.includes(type))
      return res.status(400).json({ error: `type must be one of: ${ITEM_TYPES.join(', ')}` });
    const overlap = schedule.find(i =>
      i.channelId === channelId && i.active &&
      i.startTime < (endTime || '23:59') && (i.endTime || '23:59') > startTime &&
      (i.repeat === 'daily' || i.date === date || repeat === 'daily')
    );
    if (overlap) return res.status(409).json({ error: 'Schedule conflict', conflict: { id: overlap.id, title: overlap.title, startTime: overlap.startTime } });
    const item = {
      id: uuidv4(), channelId, title, type: type || 'live',
      startTime, endTime: endTime || null, duration: duration || null,
      repeat: repeat || 'once', date: date || null, source: source || null,
      metadata: metadata || {}, active: true, createdAt: new Date().toISOString(),
    };
    schedule.push(item);
    logger.info(`Schedule item added: ${title} at ${startTime}`);
    res.status(201).json({ item });
  };
  updateItem = (req, res) => {
    const item = schedule.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    Object.assign(item, req.body); item.updatedAt = new Date().toISOString();
    res.json({ item });
  };
  deleteItem = (req, res) => {
    const idx = schedule.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Item not found' });
    schedule.splice(idx, 1); res.json({ success: true });
  };
  nowPlaying = (req, res) => {
    const { channelId } = req.params;
    res.json({ current: getCurrentProgram(channelId), upcoming: getUpcomingPrograms(channelId, 5) });
  };
  getCommercials = (req, res) => res.json({ commercials });
  addCommercial = (req, res) => {
    const { name, duration, url, channels: ch, priority } = req.body;
    if (!name || !url) return res.status(400).json({ error: 'name and url are required' });
    const ad = { id: uuidv4(), name, duration: duration || 30, url, channels: ch || [], priority: priority || 1, playCount: 0, active: true, createdAt: new Date().toISOString() };
    commercials.push(ad); res.status(201).json({ commercial: ad });
  };
  getNextCommercial = (req, res) => {
    const { channelId } = req.query;
    const available = commercials.filter(c => c.active && (!c.channels.length || c.channels.includes(channelId))).sort((a, b) => a.playCount - b.playCount || b.priority - a.priority);
    const next = available[0] || null;
    if (next) next.playCount++;
    res.json({ commercial: next });
  };
  getFillers = (req, res) => res.json({ fillers });
  addFiller = (req, res) => {
    const { name, url, duration, channelTypes } = req.body;
    if (!name || !url) return res.status(400).json({ error: 'name and url are required' });
    const filler = { id: uuidv4(), name, url, duration: duration || 60, channelTypes: channelTypes || ['tv', 'radio'], active: true, createdAt: new Date().toISOString() };
    fillers.push(filler); res.status(201).json({ filler });
  };
  getEPG = (req, res) => {
    const { channelId } = req.params;
    const targetDate = req.query.date || new Date().toISOString().split('T')[0];
    const current = getCurrentProgram(channelId);
    const epg = schedule
      .filter(i => i.channelId === channelId && i.active && (i.date === targetDate || i.repeat === 'daily' || i.repeat === 'weekly'))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(i => ({ ...i, isCurrent: i === current }));
    res.json({ date: targetDate, channelId, epg, total: epg.length });
  };
}
export default new PlayoutController();
