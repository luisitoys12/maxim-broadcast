import { logger } from '../index.js';
import { v4 as uuidv4 } from 'uuid';
import { generateTTS } from '../lib/tts.js';

let bulletins = [];

const VOICES = [
  { id: 'es-MX-DaliaNeural', name: 'Dalia (México)', lang: 'es-MX', gender: 'F' },
  { id: 'es-MX-JorgeNeural', name: 'Jorge (México)', lang: 'es-MX', gender: 'M' },
  { id: 'es-AR-ElenaNeural', name: 'Elena (Argentina)', lang: 'es-AR', gender: 'F' },
  { id: 'es-ES-ElviraNeural', name: 'Elvira (España)', lang: 'es-ES', gender: 'F' },
  { id: 'es-CO-SalomeNeural', name: 'Salomé (Colombia)', lang: 'es-CO', gender: 'F' },
  { id: 'en-US-JennyNeural', name: 'Jenny (English)', lang: 'en-US', gender: 'F' },
  { id: 'en-US-GuyNeural', name: 'Guy (English)', lang: 'en-US', gender: 'M' },
];

const TEMPLATES = {
  general: (items) => `Boletín informativo. ${items.join('. ')}. Esto ha sido su boletín de noticias.`,
  radio: (items) => `¡Atención oyentes! Les traemos las noticias más importantes de la hora. ${items.join('. ')}. Seguimos con la mejor programación.`,
  formal: (items) => `Buenas tardes. A continuación, el resumen informativo. ${items.join('. ')}. Gracias por su atención.`,
};

class NewsController {
  getVoices = (req, res) => {
    res.json({ voices: VOICES, templates: Object.keys(TEMPLATES) });
  };

  getBulletins = (req, res) => {
    res.json({ bulletins: bulletins.slice(-50) });
  };

  createBulletin = (req, res) => {
    const { headlines, voice, template, title } = req.body;
    if (!headlines?.length) return res.status(400).json({ error: 'headlines array required' });

    const tpl = TEMPLATES[template] || TEMPLATES.general;
    const script = tpl(headlines);
    const selectedVoice = VOICES.find(v => v.id === voice) || VOICES[0];

    const bulletin = {
      id: uuidv4(),
      title: title || `Boletín ${new Date().toLocaleDateString('es-MX')}`,
      headlines,
      script,
      voice: selectedVoice,
      template: template || 'general',
      status: 'ready',
      audioUrl: null,
      createdAt: new Date().toISOString()
    };

    bulletins.push(bulletin);
    logger.info(`Bulletin created: ${bulletin.title}`);
    res.status(201).json({ bulletin });
  };

  deleteBulletin = (req, res) => {
    const { id } = req.params;
    const i = bulletins.findIndex(b => b.id === id);
    if (i === -1) return res.status(404).json({ error: 'Not found' });
    bulletins.splice(i, 1);
    res.json({ success: true });
  };

  // REAL TTS — generates actual MP3 audio using Microsoft Edge-TTS
  generateAudio = async (req, res) => {
    const { id } = req.params;
    const bulletin = bulletins.find(b => b.id === id);
    if (!bulletin) return res.status(404).json({ error: 'Not found' });

    bulletin.status = 'generating';
    try {
      const result = await generateTTS(bulletin.script, bulletin.voice.id);
      bulletin.status = 'done';
      bulletin.audioUrl = result.url;
      bulletin.audioFile = result.filename;

      logger.info(`Bulletin audio READY: ${result.filename}`);
      res.json({ bulletin, audioUrl: result.url });
    } catch (err) {
      bulletin.status = 'error';
      logger.error(`Bulletin TTS failed: ${err.message}`);
      res.status(500).json({ error: `TTS failed: ${err.message}` });
    }
  };
}

export default new NewsController();
