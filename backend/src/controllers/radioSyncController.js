import { logger } from '../index.js';
import { v4 as uuidv4 } from 'uuid';
import { generateTTS } from '../lib/tts.js';

// ─── In-memory stores ─────────────────────────
let messages = [];
let listeners = {};
let iaConfig = {
  enabled: false,
  voice: 'es-MX-DaliaNeural',
  mode: 'assistant',
  state: 'idle',
  nextIntervention: null,
  interventionInterval: 300,
};

let metrics = {
  activeListeners: 0,
  messagesPerMinute: 0,
  interactionLevel: 0,
  alerts: 0,
  startedAt: null
};

let autoConfig = {
  autoReply: false,
  autoMessages: false,
  autoOrganize: true,
  spamFilter: true
};

const VOICES = [
  { id: 'es-MX-DaliaNeural', name: 'Dalia (México)' },
  { id: 'es-MX-JorgeNeural', name: 'Jorge (México)' },
  { id: 'es-AR-ElenaNeural', name: 'Elena (Argentina)' },
  { id: 'es-ES-ElviraNeural', name: 'Elvira (España)' },
  { id: 'es-CO-SalomeNeural', name: 'Salomé (Colombia)' },
  { id: 'en-US-JennyNeural', name: 'Jenny (English)' },
];

const SPAM_KEYWORDS = ['spam', 'compra ahora', 'enlace gratis', 'www.', 'http'];

function isSpam(text) {
  if (!autoConfig.spamFilter) return false;
  return SPAM_KEYWORDS.some(k => text.toLowerCase().includes(k));
}

function classifyMessage(text) {
  const lower = text.toLowerCase();
  if (/pone|pon[eé]|cancion|canción|escuchar|tema|musica|música/.test(lower)) return 'song_request';
  if (/saludo|hola|buenas|felicidades|cumple/.test(lower)) return 'greeting';
  return 'general';
}

function priorityScore(msg) {
  if (msg.type === 'song_request') return 3;
  if (msg.type === 'greeting') return 2;
  if (listeners[msg.sender]?.count > 3) return 2;
  return 1;
}

// ─── IA Content (real — these get sent to TTS) ─
const INTERVENTIONS = [
  '¡Buenos días, familia! Arrancamos con toda la mejor música y tu compañía de siempre.',
  'Seguimos en vivo con la mejor programación. ¡No se vayan que viene lo mejor!',
  '¡Qué buena onda! Los acompañamos con más música. Envíen sus saludos al WhatsApp.',
  'Gracias por seguir conectados. Recuerden que pueden pedir sus canciones favoritas.',
  '¡Esto no para! Más música, más compañía. Estamos en vivo para ustedes.',
  'Un saludo especial a todos los que nos escuchan desde el trabajo. ¡Ánimo!',
  '¡Hora de dedicatorias! Manden sus mensajes y los leemos al aire.',
  '¡La mejor programación musical sigue aquí! No cambien de dial.',
  'Recuerden que estamos en todas las plataformas. Síguenos y activa notificaciones.',
  '¡Buenas vibras para todos! Seguimos con la música que más les gusta.',
];

function pickIntervention() {
  return INTERVENTIONS[Math.floor(Math.random() * INTERVENTIONS.length)];
}

function generateGreetingText(name) {
  const opts = [
    `¡Un saludo enorme para ${name} que nos escucha en este momento!`,
    `¡${name}! Gracias por conectarte con nosotros.`,
    `Va un abrazo para ${name} que nos acompaña esta transmisión.`,
  ];
  return opts[Math.floor(Math.random() * opts.length)];
}

function generateContentSuggestions() {
  return [
    'Menciona el clima actual de la ciudad',
    'Comenta alguna tendencia del día en redes',
    'Haz una trivia rápida con los oyentes',
    'Lee los últimos saludos que llegaron',
    'Anuncia la próxima canción con un dato curioso',
  ].sort(() => Math.random() - 0.5).slice(0, 3);
}

// ─── Metrics loop ─────────────────────────────
let metricsInterval = null;
function startMetrics() {
  if (metricsInterval) return;
  metrics.startedAt = new Date().toISOString();
  metricsInterval = setInterval(() => {
    const now = Date.now();
    const recentMsgs = messages.filter(m => now - new Date(m.timestamp).getTime() < 60000);
    metrics.messagesPerMinute = recentMsgs.length;
    metrics.activeListeners = Object.keys(listeners).length;
    metrics.interactionLevel = Math.min(100, Math.round(
      (metrics.messagesPerMinute / Math.max(metrics.activeListeners, 1)) * 50
    ));
  }, 5000);
}
function stopMetrics() { if (metricsInterval) { clearInterval(metricsInterval); metricsInterval = null; } }

// ─── IA Conducting loop (REAL TTS) ────────────
let iaInterval = null;

async function doIAIntervention(io) {
  if (!iaConfig.enabled) return;
  iaConfig.state = 'generating';

  const text = pickIntervention();
  let audioUrl = null;

  try {
    const result = await generateTTS(text, iaConfig.voice);
    audioUrl = result.url;
    logger.info(`IA TTS audio generated: ${result.filename}`);
  } catch (err) {
    logger.warn(`IA TTS failed: ${err.message} — text-only fallback`);
  }

  const msg = {
    id: uuidv4(),
    sender: '🤖 Conducción IA',
    text,
    type: 'ia_intervention',
    priority: 4,
    audioUrl,
    voice: iaConfig.voice,
    timestamp: new Date().toISOString()
  };
  messages.push(msg);
  if (io) io.emit('radiosync:message', msg);

  iaConfig.state = 'conducting';
  iaConfig.nextIntervention = new Date(Date.now() + iaConfig.interventionInterval * 1000).toISOString();
}

function startIAConducting(io) {
  if (iaInterval) return;
  iaConfig.state = 'conducting';
  iaConfig.enabled = true;
  iaConfig.nextIntervention = new Date(Date.now() + iaConfig.interventionInterval * 1000).toISOString();

  // First intervention immediately
  doIAIntervention(io);

  iaInterval = setInterval(() => doIAIntervention(io), iaConfig.interventionInterval * 1000);
}

function stopIAConducting() {
  if (iaInterval) { clearInterval(iaInterval); iaInterval = null; }
  iaConfig.enabled = false;
  iaConfig.state = 'idle';
  iaConfig.nextIntervention = null;
}

// ─── Controller ───────────────────────────────
class RadioSyncController {
  getMessages = (req, res) => {
    const sorted = [...messages].sort((a, b) => priorityScore(b) - priorityScore(a));
    res.json({ messages: sorted, total: messages.length });
  };

  postMessage = async (req, res) => {
    const { sender, text, source } = req.body;
    if (!sender || !text) return res.status(400).json({ error: 'sender and text required' });

    if (isSpam(text)) {
      logger.info(`Spam blocked: ${sender}`);
      return res.json({ blocked: true, reason: 'spam' });
    }

    if (!listeners[sender]) listeners[sender] = { count: 0, firstSeen: new Date().toISOString() };
    listeners[sender].count++;
    listeners[sender].lastSeen = new Date().toISOString();

    const msg = {
      id: uuidv4(), sender, text,
      type: classifyMessage(text),
      source: source || 'web',
      priority: 1,
      timestamp: new Date().toISOString()
    };
    msg.priority = priorityScore(msg);
    messages.push(msg);

    try {
      const mod = await import('../index.js');
      if (mod.io) mod.io.emit('radiosync:message', msg);
    } catch {}

    // Auto greeting with REAL TTS
    if (msg.type === 'greeting' && autoConfig.autoReply && iaConfig.enabled) {
      const greetText = generateGreetingText(sender);
      let audioUrl = null;
      try {
        const result = await generateTTS(greetText, iaConfig.voice);
        audioUrl = result.url;
      } catch {}

      const autoMsg = {
        id: uuidv4(),
        sender: '🤖 IA',
        text: greetText,
        type: 'ia_greeting',
        priority: 2,
        audioUrl,
        timestamp: new Date().toISOString()
      };
      messages.push(autoMsg);
    }

    logger.info(`Msg [${msg.type}] ${sender}: ${text.slice(0, 50)}`);
    res.status(201).json({ message: msg });
  };

  deleteMessage = (req, res) => {
    const { id } = req.params;
    const i = messages.findIndex(m => m.id === id);
    if (i === -1) return res.status(404).json({ error: 'Not found' });
    messages.splice(i, 1);
    res.json({ success: true });
  };

  getIAStatus = (req, res) => {
    res.json({ ia: iaConfig, voices: VOICES });
  };

  toggleIA = async (req, res) => {
    const { enabled, voice, mode, intervalSeconds } = req.body;
    if (voice) iaConfig.voice = voice;
    if (mode) iaConfig.mode = mode;
    if (intervalSeconds) iaConfig.interventionInterval = Math.max(30, intervalSeconds);

    if (enabled === true) {
      let io = null;
      try { const mod = await import('../index.js'); io = mod.io; } catch {}
      startIAConducting(io);
      startMetrics();
      logger.info('IA conducting ENABLED (real TTS)');
      res.json({ ia: iaConfig, message: 'Conducción IA activada con voz real' });
    } else if (enabled === false) {
      stopIAConducting();
      logger.info('IA conducting DISABLED');
      res.json({ ia: iaConfig, message: 'Conducción IA desactivada' });
    } else {
      res.json({ ia: iaConfig });
    }
  };

  generateNow = async (req, res) => {
    const text = pickIntervention();
    let audioUrl = null;
    try {
      const result = await generateTTS(text, iaConfig.voice);
      audioUrl = result.url;
    } catch (err) {
      logger.warn(`TTS failed for manual gen: ${err.message}`);
    }

    const msg = {
      id: uuidv4(),
      sender: '🤖 Conducción IA',
      text,
      type: 'ia_intervention',
      priority: 4,
      audioUrl,
      voice: iaConfig.voice,
      timestamp: new Date().toISOString()
    };
    messages.push(msg);
    res.json({ message: msg });
  };

  getSuggestions = (req, res) => {
    res.json({ suggestions: generateContentSuggestions() });
  };

  getMetrics = (req, res) => { res.json({ metrics }); };

  getListeners = (req, res) => {
    const list = Object.entries(listeners).map(([name, data]) => ({ name, ...data }));
    res.json({ listeners: list, total: list.length });
  };

  getAutoConfig = (req, res) => { res.json({ automation: autoConfig }); };
  updateAutoConfig = (req, res) => {
    Object.assign(autoConfig, req.body);
    res.json({ automation: autoConfig });
  };

  whatsappWebhook = (req, res) => {
    const { from, body, profileName } = req.body;
    if (!body) return res.status(400).json({ error: 'body required' });
    req.body = { sender: profileName || from || 'WhatsApp', text: body, source: 'whatsapp' };
    return this.postMessage(req, res);
  };

  startSession = (req, res) => {
    messages = []; listeners = {};
    metrics = { activeListeners: 0, messagesPerMinute: 0, interactionLevel: 0, alerts: 0, startedAt: new Date().toISOString() };
    startMetrics();
    logger.info('RadioSync session started');
    res.json({ success: true, message: 'Sesión de cabina iniciada' });
  };

  endSession = (req, res) => {
    stopMetrics(); stopIAConducting();
    const summary = {
      totalMessages: messages.length,
      totalListeners: Object.keys(listeners).length,
      duration: metrics.startedAt ? `${Math.round((Date.now() - new Date(metrics.startedAt).getTime()) / 60000)} min` : '0 min'
    };
    logger.info(`RadioSync session ended: ${summary.totalMessages} msgs, ${summary.totalListeners} listeners`);
    res.json({ success: true, summary });
  };
}

export default new RadioSyncController();
