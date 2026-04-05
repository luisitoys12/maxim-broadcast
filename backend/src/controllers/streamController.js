import { logger } from '../index.js';
import { v4 as uuidv4 } from 'uuid';

let profiles = [
  {
    id: uuidv4(),
    name: 'Default Stream',
    platform: 'custom',
    server: 'rtmp://localhost/live',
    key: '',
    encoder: 'x264',
    bitrate: 2500,
    resolution: '1920x1080',
    fps: 30
  }
];

class StreamController {
  getProfiles = (req, res) => {
    res.json({ profiles });
  };

  createProfile = (req, res) => {
    const { name, platform, server, key, encoder, bitrate, resolution, fps } = req.body;
    if (!name || !server) return res.status(400).json({ error: 'name and server are required' });

    const newProfile = {
      id: uuidv4(),
      name,
      platform: platform || 'custom',
      server,
      key: key || '',
      encoder: encoder || 'x264',
      bitrate: bitrate || 2500,
      resolution: resolution || '1920x1080',
      fps: fps || 30
    };
    profiles.push(newProfile);
    logger.info(`Stream profile created: ${name}`);
    res.status(201).json({ profile: newProfile });
  };

  updateProfile = (req, res) => {
    const { id } = req.params;
    const profile = profiles.find(p => p.id === id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    Object.assign(profile, req.body);
    res.json({ profile });
  };

  deleteProfile = (req, res) => {
    const { id } = req.params;
    const index = profiles.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Profile not found' });
    profiles.splice(index, 1);
    logger.info(`Stream profile deleted: ${id}`);
    res.json({ success: true });
  };
}

export default new StreamController();
