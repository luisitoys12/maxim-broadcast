import express from 'express';
import obsController from '../controllers/obsController.js';
import sceneController from '../controllers/sceneController.js';
import streamController from '../controllers/streamController.js';
import mediaController, { upload } from '../controllers/mediaController.js';
import authController from '../controllers/authController.js';
import radioSyncController from '../controllers/radioSyncController.js';
import newsController from '../controllers/newsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Auth (public)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', requireAuth, authController.getMe);

// OBS Status and Control (protected)
router.get('/obs/status', requireAuth, obsController.getStatus);
router.post('/obs/start', requireAuth, obsController.startStreaming);
router.post('/obs/stop', requireAuth, obsController.stopStreaming);
router.post('/obs/start-recording', requireAuth, obsController.startRecording);
router.post('/obs/stop-recording', requireAuth, obsController.stopRecording);

// Scene Management (protected)
router.get('/scenes', requireAuth, sceneController.getScenes);
router.post('/scenes', requireAuth, sceneController.createScene);
router.put('/scenes/:id', requireAuth, sceneController.updateScene);
router.delete('/scenes/:id', requireAuth, sceneController.deleteScene);
router.post('/scenes/:id/activate', requireAuth, sceneController.activateScene);

// Sources (protected)
router.get('/scenes/:sceneId/sources', requireAuth, sceneController.getSources);
router.post('/scenes/:sceneId/sources', requireAuth, sceneController.addSource);
router.put('/sources/:id', requireAuth, sceneController.updateSource);
router.delete('/sources/:id', requireAuth, sceneController.deleteSource);

// Streaming Profiles (protected)
router.get('/stream/profiles', requireAuth, streamController.getProfiles);
router.post('/stream/profiles', requireAuth, streamController.createProfile);
router.put('/stream/profiles/:id', requireAuth, streamController.updateProfile);
router.delete('/stream/profiles/:id', requireAuth, streamController.deleteProfile);

// Media Library (protected)
router.get('/media', requireAuth, mediaController.getMedia);
router.post('/media/upload', requireAuth, upload.single('file'), mediaController.uploadMedia);
router.delete('/media/:id', requireAuth, mediaController.deleteMedia);

// Playout Schedule (protected)
router.get('/playout/schedule', requireAuth, mediaController.getSchedule);
router.post('/playout/schedule', requireAuth, mediaController.createScheduleItem);
router.put('/playout/schedule/:id', requireAuth, mediaController.updateScheduleItem);
router.delete('/playout/schedule/:id', requireAuth, mediaController.deleteScheduleItem);

// RadioSync — Cabina Inteligente
router.post('/radiosync/session/start', requireAuth, radioSyncController.startSession);
router.post('/radiosync/session/end', requireAuth, radioSyncController.endSession);
router.get('/radiosync/messages', requireAuth, radioSyncController.getMessages);
router.post('/radiosync/messages', requireAuth, radioSyncController.postMessage);
router.delete('/radiosync/messages/:id', requireAuth, radioSyncController.deleteMessage);
router.get('/radiosync/ia', requireAuth, radioSyncController.getIAStatus);
router.post('/radiosync/ia/toggle', requireAuth, radioSyncController.toggleIA);
router.post('/radiosync/ia/generate', requireAuth, radioSyncController.generateNow);
router.get('/radiosync/suggestions', requireAuth, radioSyncController.getSuggestions);
router.get('/radiosync/metrics', requireAuth, radioSyncController.getMetrics);
router.get('/radiosync/listeners', requireAuth, radioSyncController.getListeners);
router.get('/radiosync/automation', requireAuth, radioSyncController.getAutoConfig);
router.put('/radiosync/automation', requireAuth, radioSyncController.updateAutoConfig);
router.post('/radiosync/whatsapp', radioSyncController.whatsappWebhook); // public webhook

// News Bulletin (free)
router.get('/news/voices', requireAuth, newsController.getVoices);
router.get('/news/bulletins', requireAuth, newsController.getBulletins);
router.post('/news/bulletins', requireAuth, newsController.createBulletin);
router.delete('/news/bulletins/:id', requireAuth, newsController.deleteBulletin);
router.post('/news/bulletins/:id/audio', requireAuth, newsController.generateAudio);

export default router;
