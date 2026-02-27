import { EventEmitter } from 'events';
import cron from 'node-cron';
import { logger } from '../utils/logger.js';

export class PlayoutEngine extends EventEmitter {
  constructor(obsController) {
    super();
    this.obsController = obsController;
    this.running = false;
    this.schedule = [];
    this.currentItem = null;
    this.currentItemTimer = null;
    this.cronJobs = [];
  }

  async initialize() {
    logger.info('📦 Inicializando Playout Engine...');
    // Cargar schedule desde base de datos (si existe)
    // Por ahora, schedule vacío
    return true;
  }

  async start() {
    if (this.running) {
      logger.warn('Playout ya está en ejecución');
      return;
    }

    logger.info('▶️ Iniciando Playout Engine...');
    this.running = true;
    this.emit('started');
    
    // Comenzar reproducción del primer item
    await this.playNext();
  }

  async stop() {
    if (!this.running) {
      logger.warn('Playout no está en ejecución');
      return;
    }

    logger.info('⏹️ Deteniendo Playout Engine...');
    this.running = false;
    
    if (this.currentItemTimer) {
      clearTimeout(this.currentItemTimer);
      this.currentItemTimer = null;
    }
    
    this.currentItem = null;
    this.emit('stopped');
  }

  async playNext() {
    if (!this.running) return;

    if (this.schedule.length === 0) {
      logger.warn('⚠️ No hay items en el schedule');
      // Esperar 5 segundos y verificar nuevamente
      this.currentItemTimer = setTimeout(() => this.playNext(), 5000);
      return;
    }

    // Obtener siguiente item
    const nextItem = this.schedule.shift();
    this.currentItem = nextItem;
    
    logger.info(`🎬 Reproduciendo: ${nextItem.title} (${nextItem.duration}s)`);
    this.emit('itemStarted', nextItem);

    try {
      // Cambiar a la escena del item
      if (nextItem.sceneName && this.obsController.isConnected()) {
        await this.obsController.setCurrentScene(nextItem.sceneName);
      }

      // Configurar timer para el siguiente item
      const duration = nextItem.duration * 1000; // convertir a ms
      this.currentItemTimer = setTimeout(async () => {
        logger.info(`✅ Item finalizado: ${nextItem.title}`);
        this.emit('itemEnded', nextItem);
        await this.playNext();
      }, duration);

    } catch (error) {
      logger.error(`❌ Error reproduciendo item: ${error.message}`);
      // Saltar al siguiente
      await this.playNext();
    }
  }

  async skipCurrent() {
    if (!this.currentItem) {
      logger.warn('No hay item actual para saltar');
      return;
    }

    logger.info(`⏩ Saltando item: ${this.currentItem.title}`);
    
    if (this.currentItemTimer) {
      clearTimeout(this.currentItemTimer);
      this.currentItemTimer = null;
    }
    
    this.emit('itemEnded', this.currentItem);
    await this.playNext();
  }

  async addItem(itemData) {
    const item = {
      id: Date.now().toString(),
      title: itemData.title,
      type: itemData.type || 'video',
      sceneName: itemData.sceneName,
      duration: itemData.duration || 60,
      source: itemData.source,
      scheduledTime: itemData.scheduledTime || null,
      createdAt: new Date().toISOString()
    };

    if (item.scheduledTime) {
      // Item programado para horario específico
      const scheduledDate = new Date(item.scheduledTime);
      const cronExpression = `${scheduledDate.getMinutes()} ${scheduledDate.getHours()} ${scheduledDate.getDate()} ${scheduledDate.getMonth() + 1} *`;
      
      const job = cron.schedule(cronExpression, () => {
        this.schedule.push(item);
        this.emit('scheduleUpdated', this.schedule);
        logger.info(`📅 Item programado agregado: ${item.title}`);
      });
      
      this.cronJobs.push(job);
    } else {
      // Agregar inmediatamente al schedule
      this.schedule.push(item);
      this.emit('scheduleUpdated', this.schedule);
    }

    logger.info(`➕ Item agregado al playout: ${item.title}`);
    return item;
  }

  removeItem(itemId) {
    const index = this.schedule.findIndex(item => item.id === itemId);
    if (index !== -1) {
      const removed = this.schedule.splice(index, 1);
      this.emit('scheduleUpdated', this.schedule);
      logger.info(`➖ Item removido del playout: ${removed[0].title}`);
      return removed[0];
    }
    return null;
  }

  getSchedule() {
    return [...this.schedule];
  }

  getCurrentItem() {
    return this.currentItem;
  }

  isRunning() {
    return this.running;
  }
}
