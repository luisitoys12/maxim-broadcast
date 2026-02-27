import { logger } from '../index.js';

let mediaLibrary = [];
let schedule = [];

class MediaController {
  getMedia(req, res) {
    res.json({ media: mediaLibrary });
  }

  uploadMedia(req, res) {
    // TODO: Implement actual file upload with multer
    const { filename, type, duration } = req.body;

    const newMedia = {
      id: Date.now().toString(),
      filename,
      type,
      duration,
      uploadedAt: new Date().toISOString()
    };

    mediaLibrary.push(newMedia);
    logger.info(`Media uploaded: ${filename}`);
    
    res.status(201).json({ media: newMedia });
  }

  deleteMedia(req, res) {
    const { id } = req.params;
    const index = mediaLibrary.findIndex(m => m.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Media not found' });
    }

    mediaLibrary.splice(index, 1);
    logger.info(`Media deleted: ${id}`);
    
    res.json({ success: true });
  }

  getSchedule(req, res) {
    res.json({ schedule });
  }

  createScheduleItem(req, res) {
    const { mediaId, startTime, duration, repeat } = req.body;

    const newItem = {
      id: Date.now().toString(),
      mediaId,
      startTime,
      duration,
      repeat: repeat || 'none',
      enabled: true
    };

    schedule.push(newItem);
    logger.info(`Schedule item created for media: ${mediaId}`);
    
    res.status(201).json({ item: newItem });
  }

  updateScheduleItem(req, res) {
    const { id } = req.params;
    const updates = req.body;

    const item = schedule.find(i => i.id === id);

    if (!item) {
      return res.status(404).json({ error: 'Schedule item not found' });
    }

    Object.assign(item, updates);
    
    res.json({ item });
  }

  deleteScheduleItem(req, res) {
    const { id } = req.params;
    const index = schedule.findIndex(i => i.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Schedule item not found' });
    }

    schedule.splice(index, 1);
    logger.info(`Schedule item deleted: ${id}`);
    
    res.json({ success: true });
  }
}

export default new MediaController();
