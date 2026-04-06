import { exec } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../index.js';

const AUDIO_PATH = process.env.AUDIO_PATH || './uploads/audio';
mkdirSync(AUDIO_PATH, { recursive: true });

/**
 * Generate real TTS audio using Microsoft Edge-TTS (free, no API key needed).
 * @param {string} text - Text to speak
 * @param {string} voice - Voice ID (e.g. 'es-MX-DaliaNeural')
 * @param {string} [rate] - Speed: '+0%', '+10%', '-10%'
 * @returns {Promise<{filePath: string, filename: string, url: string}>}
 */
export async function generateTTS(text, voice = 'es-MX-DaliaNeural', rate = '+0%') {
  const filename = `tts-${uuidv4()}.mp3`;
  const filePath = join(AUDIO_PATH, filename);

  // Escape quotes in text for shell
  const safeText = text.replace(/"/g, '\\"').replace(/'/g, "\\'");

  const cmd = `edge-tts --voice "${voice}" --rate="${rate}" --text "${safeText}" --write-media "${filePath}"`;

  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        logger.error(`TTS failed: ${error.message}`);
        return reject(error);
      }
      if (!existsSync(filePath)) {
        return reject(new Error('TTS file not created'));
      }
      logger.info(`TTS generated: ${filename} (${voice})`);
      resolve({
        filePath,
        filename,
        url: `/audio/${filename}`
      });
    });
  });
}

/**
 * List available Edge-TTS voices for a language.
 */
export async function listVoices(lang = 'es') {
  return new Promise((resolve, reject) => {
    exec(`edge-tts --list-voices`, { timeout: 15000 }, (error, stdout) => {
      if (error) return reject(error);
      const voices = stdout.split('\n')
        .filter(line => line.includes(lang))
        .map(line => {
          const parts = line.trim().split(/\s{2,}/);
          return { id: parts[0], gender: parts[1], styles: parts[2] || '' };
        })
        .filter(v => v.id);
      resolve(voices);
    });
  });
}
