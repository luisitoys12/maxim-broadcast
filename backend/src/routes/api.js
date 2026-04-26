import express from 'express';
import obsController from '../controllers/obsController.js';
import sceneController from '../controllers/sceneController.js';
import streamController from '../controllers/streamController.js';
import mediaController, { upload } from '../controllers/mediaController.js';
import authController from '../controllers/authController.js';
import radioSyncController from '../controllers/radioSyncController.js';
import newsController from '../controllers/newsController.js';
import channelController from '../controllers/channelController.js';
import playoutController from '../controllers/playoutController.js';
import multiStreamController from '../controllers/multiStreamController.js';
import onAirController from '../controllers/onAirController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// ─── Auth ─────────────────────────────────────
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', requireAuth, authController.getMe);

// ─── OBS Connection ───────────────────────────
router.post('/obs/connect', requireAuth, obsController.connect);
router.post('/obs/disconnect', requireAuth, obsController.disconnect);
router.get('/obs/status', requireAuth, obsController.getStatus);

// ─── OBS Scenes ───────────────────────────────
router.get('/obs/scenes', requireAuth, obsController.getScenes);
router.post('/obs/scenes/set', requireAuth, obsController.setScene);
router.post('/obs/scenes/create', requireAuth, obsController.createScene);
router.delete('/obs/scenes/:name', requireAuth, obsController.removeScene);

// ─── OBS Sources ──────────────────────────────
router.get('/obs/scenes/:scene/items', requireAuth, obsController.getSceneItems);
router.post('/obs/sources/visible', requireAuth, obsController.setSourceVisible);

// ─── OBS Streaming ────────────────────────────
router.post('/obs/start', requireAuth, obsController.startStreaming);
router.post('/obs/stop', requireAuth, obsController.stopStreaming);
router.get('/obs/stream/settings', requireAuth, obsController.getStreamSettings);
router.post('/obs/stream/settings', requireAuth, obsController.setStreamSettings);

// ─── OBS Recording ────────────────────────────
router.post('/obs/start-recording', requireAuth, obsController.startRecording);
router.post('/obs/stop-recording', requireAuth, obsController.stopRecording);

// ─── OBS Audio ────────────────────────────────
router.get('/obs/audio', requireAuth, obsController.getAudioInputs);
router.post('/obs/audio/mute', requireAuth, obsController.muteSource);
router.post('/obs/audio/volume', requireAuth, obsController.setVolume);
router.post('/obs/audio/monitor', requireAuth, obsController.setAudioMonitor);
router.post('/obs/filter', requireAuth, obsController.setFilter);
router.post('/obs/transition', requireAuth, obsController.setTransition);
router.post('/obs/replay', requireAuth, obsController.saveReplayBuffer);
router.get('/obs/version', requireAuth, obsController.getVersion);

// ─── Stream Profiles ──────────────────────────
router.get('/stream/profiles', requireAuth, streamController.getProfiles);
router.post('/stream/profiles', requireAuth, streamController.createProfile);
router.put('/stream/profiles/:id', requireAuth, streamController.updateProfile);
router.delete('/stream/profiles/:id', requireAuth, streamController.deleteProfile);

// ─── Scenes (local) ───────────────────────────
router.get('/scenes', requireAuth, sceneController.list);
router.post('/scenes', requireAuth, sceneController.create);
router.put('/scenes/:id', requireAuth, sceneController.update);
router.delete('/scenes/:id', requireAuth, sceneController.delete);
router.post('/scenes/:id/activate', requireAuth, sceneController.activate);
router.get('/scenes/:id/sources', requireAuth, sceneController.getSources);
router.post('/scenes/:id/sources', requireAuth, sceneController.addSource);
router.put('/sources/:id', requireAuth, sceneController.updateSource);
router.delete('/sources/:id', requireAuth, sceneController.deleteSource);

// ─── Media Library ────────────────────────────
router.get('/media', requireAuth, mediaController.list);
router.post('/media/upload', requireAuth, upload.single('file'), mediaController.upload);
router.delete('/media/:id', requireAuth, mediaController.delete);
router.get('/media/:id/info', requireAuth, mediaController.getInfo);

// ─── Channels (TV / Radio / Podcast / IPTV) ───
router.get('/channels/types', channelController.getTypes);
router.get('/channels', requireAuth, channelController.list);
router.get('/channels/:id', channelController.get);
router.post('/channels', requireAuth, channelController.create);
router.put('/channels/:id', requireAuth, channelController.update);
router.delete('/channels/:id', requireAuth, channelController.delete);
router.post('/channels/:id/on-air', requireAuth, channelController.setOnAir);
router.post('/channels/:id/now-playing', requireAuth, channelController.setNowPlaying);

// ─── Playout 24/7 ─────────────────────────────
router.get('/playout/schedule', requireAuth, playoutController.getSchedule);
router.post('/playout/schedule', requireAuth, playoutController.addItem);
router.put('/playout/schedule/:id', requireAuth, playoutController.updateItem);
router.delete('/playout/schedule/:id', requireAuth, playoutController.deleteItem);
router.get('/playout/now-playing/:channelId', playoutController.nowPlaying);
router.get('/playout/epg/:channelId', playoutController.getEPG);
router.get('/playout/commercials', requireAuth, playoutController.getCommercials);
router.post('/playout/commercials', requireAuth, playoutController.addCommercial);
router.get('/playout/commercials/next', requireAuth, playoutController.getNextCommercial);
router.get('/playout/fillers', requireAuth, playoutController.getFillers);
router.post('/playout/fillers', requireAuth, playoutController.addFiller);

// ─── Multi-Stream ─────────────────────────────
router.get('/multistream/platforms', multiStreamController.getPlatforms);
router.get('/multistream/destinations', requireAuth, multiStreamController.getDestinations);
router.post('/multistream/destinations', requireAuth, multiStreamController.addDestination);
router.put('/multistream/destinations/:id', requireAuth, multiStreamController.updateDestination);
router.delete('/multistream/destinations/:id', requireAuth, multiStreamController.deleteDestination);
router.post('/multistream/start', requireAuth, multiStreamController.startAll);
router.post('/multistream/stop', requireAuth, multiStreamController.stopAll);
router.get('/multistream/status', requireAuth, multiStreamController.getStatus);

// ─── On-Air Graphics & Overlays ───────────────
router.get('/on-air/all', requireAuth, onAirController.getAllStates);
router.get('/on-air/:channelId', onAirController.getState);
router.post('/on-air/:channelId/lower-third', requireAuth, onAirController.setLowerThird);
router.delete('/on-air/:channelId/lower-third', requireAuth, onAirController.clearLowerThird);
router.post('/on-air/:channelId/crawl', requireAuth, onAirController.setCrawl);
router.post('/on-air/:channelId/breaking-news', requireAuth, onAirController.setBreakingNews);
router.post('/on-air/:channelId/bug', requireAuth, onAirController.setBug);
router.post('/on-air/:channelId/alert', requireAuth, onAirController.addAlert);

// ─── RadioSync (AI Cabin) ─────────────────────
router.get('/radiosync/config', requireAuth, radioSyncController.getConfig);
router.put('/radiosync/config', requireAuth, radioSyncController.updateConfig);
router.get('/radiosync/messages', requireAuth, radioSyncController.getMessages);
router.post('/radiosync/messages', requireAuth, radioSyncController.addMessage);
router.put('/radiosync/messages/:id/status', requireAuth, radioSyncController.updateMessageStatus);
router.post('/radiosync/ia/intervene', requireAuth, radioSyncController.triggerIntervention);
router.post('/radiosync/ia/toggle', requireAuth, radioSyncController.toggleIA);
router.get('/radiosync/metrics', requireAuth, radioSyncController.getMetrics);
router.put('/radiosync/metrics', requireAuth, radioSyncController.updateMetrics);
router.get('/radiosync/voices', radioSyncController.getVoices);
router.get('/radiosync/auto-config', requireAuth, radioSyncController.getAutoConfig);
router.put('/radiosync/auto-config', requireAuth, radioSyncController.updateAutoConfig);

// ─── News / Bulletin ──────────────────────────
router.get('/news', requireAuth, newsController.getAll);
router.post('/news', requireAuth, newsController.create);
router.put('/news/:id', requireAuth, newsController.update);
router.delete('/news/:id', requireAuth, newsController.delete);
router.post('/news/:id/tts', requireAuth, newsController.generateBulletinTTS);
router.post('/news/bulletin', requireAuth, newsController.generateBulletin);

export default router;
