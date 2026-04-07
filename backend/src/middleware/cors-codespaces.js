/**
 * CORS middleware for GitHub Codespaces
 *
 * Allows requests from Codespaces preview URLs (*.app.github.dev)
 * as well as any origin configured via FRONTEND_URL.
 */

import { logger } from '../index.js';

const CODESPACES_ORIGIN_PATTERN = /^https:\/\/[a-zA-Z0-9-]+-\d+\.app\.github\.dev$/;

/**
 * Returns true when origin matches a GitHub Codespaces preview URL.
 * @param {string} origin
 * @returns {boolean}
 */
const isCodespacesOrigin = (origin) => {
  if (!origin) return false;
  return CODESPACES_ORIGIN_PATTERN.test(origin);
};

/**
 * Build the list of allowed origins based on environment variables.
 * Supports:
 *   - FRONTEND_URL (comma-separated list or single URL)
 *   - CODESPACE_MODE=true  → also allow all *.app.github.dev origins
 */
const buildAllowedOrigins = () => {
  const raw = process.env.FRONTEND_URL || '';
  const explicit = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return explicit;
};

const allowedOrigins = buildAllowedOrigins();
const codespaceMode = process.env.CODESPACE_MODE === 'true';

/**
 * Express middleware that sets CORS headers for Codespaces and
 * configured origins.
 */
const corsCodespaces = (req, res, next) => {
  const origin = req.headers.origin;

  const isExplicitlyAllowed =
    !origin ||
    allowedOrigins.includes('*') ||
    allowedOrigins.includes(origin);

  const isCodespaces = codespaceMode && isCodespacesOrigin(origin);
  const isAllowed = isExplicitlyAllowed || isCodespaces;

  if (isAllowed && origin) {
    if (isCodespaces && !isExplicitlyAllowed) {
      logger.info(`CORS: allowing Codespaces origin ${origin}`);
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
};

export default corsCodespaces;
