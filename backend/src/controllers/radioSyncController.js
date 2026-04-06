import { logger } from '../index.js';
import { v4 as uuidv4 } from 'uuid';

// ─── In-memory stores ─────────────────────────
let messages = [];
let listeners = {};
let iaConfig = {
  enabled: false,
  voice: 'Voz Radio Pro 1',
  mode: 'assistant', // 'assistant' | 'autonomous'
  state: 'idle',     // 'idle' | 'conducting' | 'generating'
  nextIntervention: null,
  interventionInterval: 300, // seconds between IA interventions
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
  'Voz Radio Pro 1', 'Voz Radio Pro 2', 'Voz Femenina Cálida',
  'Voz Masculina Grave', 'Voz Joven Dinámica', 'Voz Nocturna Suave'
];

const SPAM_KEYWORDS = ['spam', 'compra ahora', 'enlace gratis', 'www.', 'http'];

function isSpam(text) {
  if (!autoConfig.spamFilter) return false;
  const lower = text.toLowerCase();
  return SPAM_KEYWORDS.some(k => lower.includes(k));
}

function classifyMessage(text) {
  const lower = text.toLowerCase();
  if (/pone|pon[eé]|cancion|canción|escuchar|tema|musica|música/.test(lower))
    return 'song_request';
  if (/saludo|hola|buenas|felicidades|cumple/.test(lower))
    return 'greeting';
  return 'general';
}

function priorityScore(msg) {
  if (msg.type === 'song_request') return 3;
  if (msg.type === 'greeting') return 2;
  if (listeners[msg.sender]?.count > 3) return 2; // oyente recurrente
  return 1;
}

// ─── IA Content Generation (simulated) ────────
function generateIntervention() {
  const templates = [
    '¡Buenos días, familia! Arrancamos con toda la mejor música y tu compañía de siempre.',
    'Seguimos en vivo con la mejor programación. ¡No se vayan que viene lo mejor!',
    '¡Qué buena onda esta tarde! Los acompañamos con más música. Envíen sus saludos.',
    'Gracias por seguir conectados. Recuerden que pueden pedir sus canciones favoritas.',
    '¡Esto no para! Más música, más compañía. Estamos en vivo para ustedes.',
    'Un saludo especial a todos los que nos escuchan desde el trabajo. ¡Ánimo!',
    '¡Hora de dedicatorias! Manden sus mensajes y los leemos al aire.',
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateGreeting(name) {
  const greetings = [
    `¡Un saludo enorme para ${name} que nos escucha en este momento!`,
    `¡${name}! Gracias por conectarte con nosotros.`,
    `Va un abrazo para ${name} que nos acompaña esta transmisión.`,
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
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

// ─── Metrics update loop ──────────────────────
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

function stopMetrics() {
  if (metricsInterval) { clearInterval(metricsInterval); metricsInterval = null; }
}

// ─── IA Conducting loop ───────────────────────
let iaInterval = null;

function startIAConducting(io) {
  if (iaInterval) return;
  iaConfig.state = 'conducting';
  iaConfig.enabled = true;
  iaInterval = setInterval(() => {
    if (!iaConfig.enabled) return;
    iaConfig.state = 'generating';
    const intervention = generateIntervention();
    const msg = {
      id: uuidv4(),
      sender: '🤖 Conducción IA',
      text: intervention,
      type: 'ia_intervention',
      priority: 4,
      timestamp: new Date().toISOString(),
      voice: iaConfig.voice
    };
    messages.push(msg);
    if (io) io.emit('radiosync:message', msg);
    iaConfig.state = 'conducting';
    iaConfig.nextIntervention = new Date(Date.now() + iaConfig.interventionInterval * 1000).toISOString();
    logger.info(`RadioSync IA intervention: ${intervention.slice(0, 50)}...`);
  }, iaConfig.interventionInterval * 1000);
  iaConfig.nextIntervention = new Date(Date.now() + iaConfig.interventionInterval * 1000).toISOString();
}

function stopIAConducting() {
  if (iaInterval) { clearInterval(iaInterval); iaInterval = null; }
  iaConfig.enabled = false;
  iaConfig.state = 'idle';
  iaConfig.nextIntervention = null;
}

// ─── Controller ───────────────────────────────
class RadioSyncController {
  // === MESSAGES / CABINA ===
  getMessages = (req, res) => {
    const sorted = [...messages]
      .sort((a, b) => priorityScore(b) - priorityScore(a));
    res.json({ messages: sorted, total: messages.length });
  };

  postMessage = async (req, res) => {
    const { sender, text, source } = req.body;
    if (!sender || !text) return res.status(400).json({ error: 'sender and text required' });

    if (isSpam(text)) {
      logger.info(`RadioSync: spam blocked from ${sender}`);
      return res.json({ blocked: true, reason: 'spam' });
    }

    // Track listener
    if (!listeners[sender]) listeners[sender] = { count: 0, firstSeen: new Date().toISOString() };
    listeners[sender].count++;
    listeners[sender].lastSeen = new Date().toISOString();

    const msg = {
      id: uuidv4(),
      sender,
      text,
      type: classifyMessage(text),
      source: source || 'web',
      priority: 1,
      timestamp: new Date().toISOString()
    };
    msg.priority = priorityScore(msg);
    messages.push(msg);

    // Emit via socket
    try {
      const mod = await import('../index.js');
      if (mod.io) mod.io.emit('radiosync:message', msg);
    } catch {}

    // Auto greeting
    if (msg.type === 'greeting' && autoConfig.autoReply && iaConfig.enabled) {
      const greeting = generateGreeting(sender);
      const autoMsg = {
        id: uuidv4(),
        sender: '🤖 IA',
        text: greeting,
        type: 'ia_greeting',
        priority: 2,
        timestamp: new Date().toISOString()
      };
      messages.push(autoMsg);
    }

    logger.info(`RadioSync msg [${msg.type}] from ${sender}: ${text.slice(0, 40)}`);
    res.status(201).json({ message: msg });
  };

  deleteMessage = (req, res) => {
    const { id } = req.params;
    const i = messages.findIndex(m => m.id === id);
    if (i === -1) return res.status(404).json({ error: 'Message not found' });
    messages.splice(i, 1);
    res.json({ success: true });
  };

  // === IA CONDUCTING ===
  getIAStatus = (req, res) => {
    res.json({ ia: iaConfig, voices: VOICES });
  };

  toggleIA = (req, res) => {
    const { enabled, voice, mode, intervalSeconds } = req.body;
    if (voice && VOICES.includes(voice)) iaConfig.voice = voice;
    if (mode) iaConfig.mode = mode;
    if (intervalSeconds) iaConfig.interventionInterval = Math.max(30, intervalSeconds);

    if (enabled === true) {
      const io = req.app?.get?.('io');
      startIAConducting(io);
      startMetrics();
      logger.info('RadioSync: IA conducting ENABLED');
      res.json({ ia: iaConfig, message: 'Conducción IA activada' });
    } else if (enabled === false) {
      stopIAConducting();
      logger.info('RadioSync: IA conducting DISABLED');
      res.json({ ia: iaConfig, message: 'Conducción IA desactivada' });
    } else {
      res.json({ ia: iaConfig });
    }
  };

  generateNow = (req, res) => {
    const intervention = generateIntervention();
    const msg = {
      id: uuidv4(),
      sender: '🤖 Conducción IA',
      text: intervention,
      type: 'ia_intervention',
      priority: 4,
      voice: iaConfig.voice,
      timestamp: new Date().toISOString()
    };
    messages.push(msg);
    res.json({ message: msg });
  };

  // === SUGGESTIONS ===
  getSuggestions = (req, res) => {
    res.json({ suggestions: generateContentSuggestions() });
  };

  // === METRICS ===
  getMetrics = (req, res) => {
    res.json({ metrics });
  };

  // === LISTENERS ===
  getListeners = (req, res) => {
    const list = Object.entries(listeners).map(([name, data]) => ({ name, ...data }));
    res.json({ listeners: list, total: list.length });
  };

  // === AUTOMATION CONFIG ===
  getAutoConfig = (req, res) => {
    res.json({ automation: autoConfig });
  };

  updateAutoConfig = (req, res) => {
    Object.assign(autoConfig, req.body);
    res.json({ automation: autoConfig });
  };

  // === WHATSAPP WEBHOOK (receiver) ===
  whatsappWebhook = (req, res) => {
    const { from, body, profileName } = req.body;
    if (!body) return res.status(400).json({ error: 'body required' });

    const sender = profileName || from || 'WhatsApp';
    // Re-use postMessage logic
    req.body = { sender, text: body, source: 'whatsapp' };
    return this.postMessage(req, res);
  };

  // === LIFECYCLE ===
  startSession = (req, res) => {
    messages = [];
    listeners = {};
    metrics = { activeListeners: 0, messagesPerMinute: 0, interactionLevel: 0, alerts: 0, startedAt: new Date().toISOString() };
    startMetrics();
    logger.info('RadioSync: session started');
    res.json({ success: true, message: 'Sesión de cabina iniciada' });
  };

  endSession = (req, res) => {
    stopMetrics();
    stopIAConducting();
    const summary = {
      totalMessages: messages.length,
      totalListeners: Object.keys(listeners).length,
      duration: metrics.startedAt ? `${Math.round((Date.now() - new Date(metrics.startedAt).getTime()) / 60000)} min` : '0 min'
    };
    logger.info(`RadioSync: session ended — ${summary.totalMessages} msgs, ${summary.totalListeners} listeners`);
    res.json({ success: true, summary });
  };
}

export default new RadioSyncController();
