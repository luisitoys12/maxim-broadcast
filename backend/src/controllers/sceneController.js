import { logger } from '../index.js';

// Temporary in-memory storage (will be replaced with database)
let scenes = [
  {
    id: '1',
    name: 'Main Scene',
    sources: [],
    active: true
  }
];

class SceneController {
  getScenes(req, res) {
    res.json({ scenes });
  }

  createScene(req, res) {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Scene name is required' });
    }

    const newScene = {
      id: Date.now().toString(),
      name,
      sources: [],
      active: false
    };

    scenes.push(newScene);
    logger.info(`Scene created: ${name}`);
    
    res.status(201).json({ scene: newScene });
  }

  updateScene(req, res) {
    const { id } = req.params;
    const { name } = req.body;

    const scene = scenes.find(s => s.id === id);
    
    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    if (name) scene.name = name;
    
    res.json({ scene });
  }

  deleteScene(req, res) {
    const { id } = req.params;
    const index = scenes.findIndex(s => s.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    scenes.splice(index, 1);
    logger.info(`Scene deleted: ${id}`);
    
    res.json({ success: true });
  }

  activateScene(req, res) {
    const { id } = req.params;
    
    scenes.forEach(s => s.active = false);
    
    const scene = scenes.find(s => s.id === id);
    
    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    scene.active = true;
    logger.info(`Scene activated: ${scene.name}`);
    
    res.json({ scene });
  }

  getSources(req, res) {
    const { sceneId } = req.params;
    const scene = scenes.find(s => s.id === sceneId);

    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    res.json({ sources: scene.sources });
  }

  addSource(req, res) {
    const { sceneId } = req.params;
    const { type, name, settings } = req.body;

    const scene = scenes.find(s => s.id === sceneId);

    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    const newSource = {
      id: Date.now().toString(),
      type,
      name,
      settings: settings || {},
      visible: true
    };

    scene.sources.push(newSource);
    logger.info(`Source added to scene ${sceneId}: ${name}`);
    
    res.status(201).json({ source: newSource });
  }

  updateSource(req, res) {
    const { id } = req.params;
    const updates = req.body;

    let foundSource = null;
    let parentScene = null;

    for (const scene of scenes) {
      const source = scene.sources.find(s => s.id === id);
      if (source) {
        foundSource = source;
        parentScene = scene;
        break;
      }
    }

    if (!foundSource) {
      return res.status(404).json({ error: 'Source not found' });
    }

    Object.assign(foundSource, updates);
    
    res.json({ source: foundSource });
  }

  deleteSource(req, res) {
    const { id } = req.params;

    for (const scene of scenes) {
      const index = scene.sources.findIndex(s => s.id === id);
      if (index !== -1) {
        scene.sources.splice(index, 1);
        logger.info(`Source deleted: ${id}`);
        return res.json({ success: true });
      }
    }

    res.status(404).json({ error: 'Source not found' });
  }
}

export default new SceneController();
