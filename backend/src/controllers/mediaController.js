import { logger } from '../index.js';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import multer from 'multer';

const MEDIA_PATH = process.env.MEDIA_STORAGE_PATH || './uploads/media';
mkdirSync(MEDIA_PATH, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MEDIA_PATH),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${uuidv4()}`;
    const ext = file.originalname.split('.').pop();
    cb(null, `${unique}.${ext}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowed = /video|audio|image/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only video, audio, and image files are allowed'));
  }
});

let mediaLibrary = [];
let schedule = [];

class MediaController {
  getMedia = (req, res) => {
    res.json({ media: mediaLibrary });
  };

  uploadMedia = (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const newMedia = {
      id: uuidv4(),
      filename: req.file.originalname,
      storedAs: req.file.filename,
      path: req.file.path,
      type: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString()
    };
    mediaLibrary.push(newMedia);
    logger.info(`Media uploaded: ${newMedia.filename}`);
    res.status(201).json({ media: newMedia });
  };

  deleteMedia = (req, res) => {
    const { id } = req.params;
    const index = mediaLibrary.findIndex(m => m.id === id);
    if (index === -1) return res.status(404).json({ error: 'Media not found' });

    const [removed] = mediaLibrary.splice(index, 1);
    try {
      if (existsSync(removed.path)) unlinkSync(removed.path);
    } catch (e) {
      logger.warn(`Could not delete file: ${removed.path}`);
    }
    logger.info(`Media deleted: ${id}`);
    res.json({ success: true });
  };

  getSchedule = (req, res) => {
    res.json({ schedule });
  };

  createScheduleItem = (req, res) => {
    const { mediaId, startTime, duration, repeat } = req.body;
    if (!mediaId || !startTime) return res.status(400).json({ error: 'mediaId and startTime are required' });

    const newItem = {
      id: uuidv4(),
      mediaId,
      startTime,
      duration: duration || 0,
      repeat: repeat || 'none',
      enabled: true,
      createdAt: new Date().toISOString()
    };
    schedule.push(newItem);
    logger.info(`Schedule item created for media: ${mediaId}`);
    res.status(201).json({ item: newItem });
  };

  updateScheduleItem = (req, res) => {
    const { id } = req.params;
    const item = schedule.find(i => i.id === id);
    if (!item) return res.status(404).json({ error: 'Schedule item not found' });
    Object.assign(item, req.body);
    res.json({ item });
  };

  deleteScheduleItem = (req, res) => {
    const { id } = req.params;
    const index = schedule.findIndex(i => i.id === id);
    if (index === -1) return res.status(404).json({ error: 'Schedule item not found' });
    schedule.splice(index, 1);
    logger.info(`Schedule item deleted: ${id}`);
    res.json({ success: true });
  };
}

export default new MediaController();
