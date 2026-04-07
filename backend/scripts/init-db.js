// backend/scripts/init-db.js
// Database initialization script for Railway and fresh installs.
// Creates the SQLite database with default tables, admin user, and sample data.
//
// Usage: node backend/scripts/init-db.js
//    or: node scripts/init-db.js  (from /app/backend working directory)

import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Resolve DB path from env or default
const DB_PATH = process.env.DB_PATH || join(__dirname, '../db/maxim.db');
const DB_DIR = dirname(DB_PATH);

if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

// Dynamic import of better-sqlite3 (optional dep) — gracefully skip if not installed
let Database;
try {
  Database = (await import('better-sqlite3')).default;
} catch {
  console.log('ℹ️  better-sqlite3 not installed — skipping SQLite initialization.');
  console.log('   The app will use in-memory storage on first run.');
  process.exit(0);
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log(`📊 Initializing database at: ${DB_PATH}`);

// ─── Schema ──────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    name        TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'user',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scenes (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    is_active   INTEGER NOT NULL DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sources (
    id          TEXT PRIMARY KEY,
    scene_id    TEXT NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL,
    settings    TEXT NOT NULL DEFAULT '{}',
    visible     INTEGER NOT NULL DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stream_profiles (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    rtmp_url    TEXT,
    stream_key  TEXT,
    bitrate     INTEGER DEFAULT 3000,
    resolution  TEXT DEFAULT '1920x1080',
    fps         INTEGER DEFAULT 30,
    is_active   INTEGER NOT NULL DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS media (
    id          TEXT PRIMARY KEY,
    filename    TEXT NOT NULL,
    original    TEXT NOT NULL,
    mimetype    TEXT NOT NULL,
    size        INTEGER NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS schedule (
    id          TEXT PRIMARY KEY,
    media_id    TEXT REFERENCES media(id) ON DELETE SET NULL,
    title       TEXT NOT NULL,
    start_time  DATETIME NOT NULL,
    end_time    DATETIME,
    repeat_type TEXT DEFAULT 'none',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ Schema created');

// ─── Seed admin user ─────────────────────────────────────────────────────────
const { default: bcrypt } = await import('bcrypt');
const { v4: uuidv4 } = await import('uuid');

const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@maxim.local');

let adminPassword;
if (!existing) {
  adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');
  const hashed = await bcrypt.hash(adminPassword, 12);
  const adminId = uuidv4();

  db.prepare(`
    INSERT INTO users (id, email, password, name, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(adminId, 'admin@maxim.local', hashed, 'Admin', 'admin');

  console.log('');
  // Print initial credentials to stderr so they appear in Railway logs but are not
  // captured by log-aggregation pipelines that only collect stdout.
  process.stderr.write('========================================\n');
  process.stderr.write('👤 INITIAL ADMIN CREDENTIALS (one-time display):\n');
  process.stderr.write(`   📧 Email:    admin@maxim.local\n`);
  process.stderr.write(`   🔑 Password: ${adminPassword}\n`);
  process.stderr.write('   ⚠️  Save this password — it will not be shown again!\n');
  process.stderr.write('========================================\n');
  console.log('');
} else {
  console.log('👤 Admin user already exists — skipping');
}

// ─── Seed sample scenes ───────────────────────────────────────────────────────
const sceneCount = db.prepare('SELECT COUNT(*) AS c FROM scenes').get().c;
if (sceneCount === 0) {
  const sampleScenes = [
    { id: uuidv4(), name: 'Main Broadcast', is_active: 1 },
    { id: uuidv4(), name: 'Commercial Break', is_active: 0 },
    { id: uuidv4(), name: 'Intermission', is_active: 0 },
  ];

  const insertScene = db.prepare('INSERT INTO scenes (id, name, is_active) VALUES (?, ?, ?)');
  for (const s of sampleScenes) {
    insertScene.run(s.id, s.name, s.is_active);
  }
  console.log(`🎬 ${sampleScenes.length} sample scenes created`);
}

// ─── Seed default stream profile ─────────────────────────────────────────────
const profileCount = db.prepare('SELECT COUNT(*) AS c FROM stream_profiles').get().c;
if (profileCount === 0) {
  db.prepare(`
    INSERT INTO stream_profiles (id, name, rtmp_url, bitrate, resolution, fps, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), 'Default Profile', 'rtmp://live.twitch.tv/app/', 3000, '1920x1080', 30, 1);
  console.log('📡 Default stream profile created');
}

db.close();
console.log('');
console.log('✅ Database initialization complete');
