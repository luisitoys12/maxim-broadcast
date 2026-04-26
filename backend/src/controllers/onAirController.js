import { logger } from '../index.js';
import { v4 as uuidv4 } from 'uuid';

const onAirState = {};

function getState(channelId) {
  if (!onAirState[channelId]) {
    onAirState[channelId] = {
      channelId, onAir: false, lowerThird: null, crawl: null,
      breakingNews: null, bug: null,
      clock: { visible: false, format: 'HH:mm:ss', timezone: 'America/Mexico_City' },
      alerts: [], metadata: {},
    };
  }
  return onAirState[channelId];
}

class OnAirController {
  getState = (req, res) => res.json({ state: getState(req.params.channelId) });
  setLowerThird = (req, res) => {
    const state = getState(req.params.channelId);
    const { text, subtext, style, visible, duration } = req.body;
    state.lowerThird = { text: text || '', subtext: subtext || '', style: style || 'default', visible: visible !== false, duration: duration || null, updatedAt: new Date().toISOString() };
    logger.info(`Lower third set: ${text}`);
    res.json({ lowerThird: state.lowerThird });
  };
  clearLowerThird = (req, res) => { getState(req.params.channelId).lowerThird = null; res.json({ success: true }); };
  setCrawl = (req, res) => {
    const state = getState(req.params.channelId);
    const { text, speed, active, loop, color, background } = req.body;
    state.crawl = { text: text || '', speed: speed || 5, active: active !== false, loop: loop !== false, color: color || '#ffffff', background: background || '#cc0000', updatedAt: new Date().toISOString() };
    res.json({ crawl: state.crawl });
  };
  setBreakingNews = (req, res) => {
    const state = getState(req.params.channelId);
    const { headline, visible, color } = req.body;
    state.breakingNews = { headline: headline || '', visible: visible !== false, color: color || '#ff0000', setAt: new Date().toISOString() };
    logger.info(`Breaking news: ${headline}`);
    res.json({ breakingNews: state.breakingNews });
  };
  setBug = (req, res) => {
    const state = getState(req.params.channelId);
    const { text, logo, position, visible } = req.body;
    state.bug = { text: text || '', logo: logo || null, position: position || 'top-right', visible: visible !== false, updatedAt: new Date().toISOString() };
    res.json({ bug: state.bug });
  };
  addAlert = (req, res) => {
    const state = getState(req.params.channelId);
    const { message, type, duration } = req.body;
    const alert = { id: uuidv4(), message, type: type || 'info', duration: duration || 10, createdAt: new Date().toISOString(), dismissed: false };
    state.alerts.push(alert);
    if (duration) setTimeout(() => { alert.dismissed = true; }, duration * 1000);
    res.status(201).json({ alert });
  };
  getAllStates = (req, res) => res.json({ states: Object.values(onAirState) });
}
export default new OnAirController();
