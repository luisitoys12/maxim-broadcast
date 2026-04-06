import { logger } from '../index.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory bulletin store
let bulletins = [];

// Microsoft TTS voices (free tier)
const VOICES = [
  { id: 'es-MX-DaliaNeural', name: 'Dalia (México)', lang: 'es-MX', gender: 'F' },
  { id: 'es-MX-JorgeNeural', name: 'Jorge (México)', lang: 'es-MX', gender: 'M' },
  { id: 'es-AR-ElenaNeural', name: 'Elena (Argentina)', lang: 'es-AR', gender: 'F' },
  { id: 'es-ES-ElviraNeural', name: 'Elvira (España)', lang: 'es-ES', gender: 'F' },
  { id: 'es-CO-SalomeNeural', name: 'Salomé (Colombia)', lang: 'es-CO', gender: 'F' },
  { id: 'en-US-JennyNeural', name: 'Jenny (English)', lang: 'en-US', gender: 'F' },
  { id: 'en-US-GuyNeural', name: 'Guy (English)', lang: 'en-US', gender: 'M' },
];

const NEWS_TEMPLATES = {
  general: (items) => `Boletín informativo. ${items.join('. ')}. Esto ha sido su boletín de noticias.`,
  radio: (items) => `¡Atención oyentes! Les traemos las noticias más importantes de la hora. ${items.join('. ')}. Seguimos con la mejor programación.`,
  formal: (items) => `Buenas tardes. A continuación, el resumen informativo. ${items.join('. ')}. Gracias por su atención.`,
};

class NewsController {
  getVoices = (req, res) => {
    res.json({ voices: VOICES, templates: Object.keys(NEWS_TEMPLATES) });
  };

  getBulletins = (req, res) => {
    res.json({ bulletins: bulletins.slice(-50) });
  };

  createBulletin = (req, res) => {
    const { headlines, voice, template, title } = req.body;
    if (!headlines?.length) return res.status(400).json({ error: 'headlines array required' });

    const tpl = NEWS_TEMPLATES[template] || NEWS_TEMPLATES.general;
    const script = tpl(headlines);
    const selectedVoice = VOICES.find(v => v.id === voice) || VOICES[0];

    const bulletin = {
      id: uuidv4(),
      title: title || `Boletín ${new Date().toLocaleDateString('es-MX')}`,
      headlines,
      script,
      voice: selectedVoice,
      template: template || 'general',
      status: 'ready', // ready | generating_audio | done
      audioUrl: null,
      createdAt: new Date().toISOString()
    };

    bulletins.push(bulletin);
    logger.info(`News bulletin created: ${bulletin.title} (${headlines.length} headlines)`);
    res.status(201).json({ bulletin });
  };

  deleteBulletin = (req, res) => {
    const { id } = req.params;
    const i = bulletins.findIndex(b => b.id === id);
    if (i === -1) return res.status(404).json({ error: 'Bulletin not found' });
    bulletins.splice(i, 1);
    res.json({ success: true });
  };

  // Generate TTS audio (simulated — returns SSML for real Microsoft TTS integration)
  generateAudio = (req, res) => {
    const { id } = req.params;
    const bulletin = bulletins.find(b => b.id === id);
    if (!bulletin) return res.status(404).json({ error: 'Bulletin not found' });

    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${bulletin.voice.lang}">
  <voice name="${bulletin.voice.id}">
    <prosody rate="medium" pitch="medium">
      ${bulletin.script}
    </prosody>
  </voice>
</speak>`;

    bulletin.status = 'done';
    bulletin.ssml = ssml;
    logger.info(`TTS SSML generated for bulletin: ${bulletin.id}`);

    res.json({
      bulletin,
      ssml,
      instructions: 'Send this SSML to Microsoft Azure Speech API or use the built-in TTS engine'
    });
  };
}

export default new NewsController();
