import express from 'express';
import obsController from '../controllers/obsController.js';
import sceneController from '../controllers/sceneController.js';
import streamController from '../controllers/streamController.js';
import mediaController from '../controllers/mediaController.js';

const router = express.Router();

// OBS Status and Control
router.get('/obs/status', obsController.getStatus);
router.post('/obs/start', obsController.startStreaming);
router.post('/obs/stop', obsController.stopStreaming);
router.post('/obs/start-recording', obsController.startRecording);
router.post('/obs/stop-recording', obsController.stopRecording);

// Scene Management
router.get('/scenes', sceneController.getScenes);
router.post('/scenes', sceneController.createScene);
router.put('/scenes/:id', sceneController.updateScene);
router.delete('/scenes/:id', sceneController.deleteScene);
router.post('/scenes/:id/activate', sceneController.activateScene);

// Sources
router.get('/scenes/:sceneId/sources', sceneController.getSources);
router.post('/scenes/:sceneId/sources', sceneController.addSource);
router.put('/sources/:id', sceneController.updateSource);
router.delete('/sources/:id', sceneController.deleteSource);

// Streaming Profiles
router.get('/stream/profiles', streamController.getProfiles);
router.post('/stream/profiles', streamController.createProfile);
router.put('/stream/profiles/:id', streamController.updateProfile);
router.delete('/stream/profiles/:id', streamController.deleteProfile);

// Media Library
router.get('/media', mediaController.getMedia);
router.post('/media/upload', mediaController.uploadMedia);
router.delete('/media/:id', mediaController.deleteMedia);

// Playout Schedule
router.get('/playout/schedule', mediaController.getSchedule);
router.post('/playout/schedule', mediaController.createScheduleItem);
router.put('/playout/schedule/:id', mediaController.updateScheduleItem);
router.delete('/playout/schedule/:id', mediaController.deleteScheduleItem);

export default router;
