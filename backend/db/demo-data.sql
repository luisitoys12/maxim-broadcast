-- ============================================================
-- Maxim Broadcast - Demo Data
-- SQLite schema + seed data for Codespaces demo
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  username    TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user',
  created_at  TEXT NOT NULL
);

-- Scenes table
CREATE TABLE IF NOT EXISTS scenes (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);

-- Sources table
CREATE TABLE IF NOT EXISTS sources (
  id          TEXT PRIMARY KEY,
  scene_id    TEXT NOT NULL REFERENCES scenes(id),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,
  settings    TEXT,
  visible     INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL
);

-- Stream profiles table
CREATE TABLE IF NOT EXISTS stream_profiles (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  platform    TEXT NOT NULL,
  server_url  TEXT,
  stream_key  TEXT,
  bitrate     INTEGER,
  created_at  TEXT NOT NULL
);

-- ============================================================
-- Demo Users
-- Passwords are SHA-256 hashes of "demo123"
-- SHA-256("demo123") = 05a671c66aefea124cc08b76ea6d30bb
-- ============================================================
INSERT OR IGNORE INTO users (id, username, email, password, role, created_at) VALUES
  (
    'usr-admin-demo-0001',
    'Admin',
    'admin@demo.com',
    '2ab96390c7dbe3439de74d0c9b0b1767858cb9d2f56fb6ec7d5ba9c5f9e4c4ae',
    'admin',
    '2024-01-01T00:00:00.000Z'
  ),
  (
    'usr-demo-user-0002',
    'Demo User',
    'demo@demo.com',
    '2ab96390c7dbe3439de74d0c9b0b1767858cb9d2f56fb6ec7d5ba9c5f9e4c4ae',
    'user',
    '2024-01-01T00:00:01.000Z'
  );

-- ============================================================
-- Demo Scenes (5 pre-configured scenes)
-- ============================================================
INSERT OR IGNORE INTO scenes (id, name, description, is_active, created_at) VALUES
  ('scn-news-001',     'News Studio',    'Professional news broadcast with chroma key background',         1, '2024-01-01T00:00:00.000Z'),
  ('scn-gaming-002',   'Gaming Setup',   'Gaming stream with overlays, alerts and webcam frame',           0, '2024-01-01T00:00:01.000Z'),
  ('scn-music-003',    'Music Studio',   'Music broadcast with audio visualizers and stage lighting',      0, '2024-01-01T00:00:02.000Z'),
  ('scn-talkshow-004', 'Talk Show',      'Round-table talk show with multi-camera layout',                 0, '2024-01-01T00:00:03.000Z'),
  ('scn-fullscreen-005','Fullscreen',    'Simple fullscreen scene - clean canvas for any content',         0, '2024-01-01T00:00:04.000Z');

-- ============================================================
-- Demo Sources (cameras, overlays, text)
-- ============================================================
INSERT OR IGNORE INTO sources (id, scene_id, name, type, settings, visible, created_at) VALUES
  -- News Studio sources
  ('src-001', 'scn-news-001', 'Main Camera',      'camera',  '{"device":"default","width":1920,"height":1080}',                1, '2024-01-01T00:00:00.000Z'),
  ('src-002', 'scn-news-001', 'Chroma Key BG',    'image',   '{"path":"assets/chroma-green.png","chromaKey":true}',            1, '2024-01-01T00:00:01.000Z'),
  ('src-003', 'scn-news-001', 'News Ticker',      'text',    '{"text":"BREAKING: Demo Mode Active | Maxim Broadcast v1.4.0"}', 1, '2024-01-01T00:00:02.000Z'),
  ('src-004', 'scn-news-001', 'Station Logo',     'image',   '{"path":"assets/logo.png","width":200,"height":80}',             1, '2024-01-01T00:00:03.000Z'),
  -- Gaming Setup sources
  ('src-005', 'scn-gaming-002','Game Capture',    'capture', '{"window":"any","method":"auto"}',                               1, '2024-01-01T00:01:00.000Z'),
  ('src-006', 'scn-gaming-002','Webcam Overlay',  'camera',  '{"device":"default","width":320,"height":240}',                  1, '2024-01-01T00:01:01.000Z'),
  ('src-007', 'scn-gaming-002','Alert Box',       'browser', '{"url":"https://streamlabs.com/alert-box/demo"}',               1, '2024-01-01T00:01:02.000Z'),
  ('src-008', 'scn-gaming-002','Chat Overlay',    'browser', '{"url":"https://streamlabs.com/chat-box/demo"}',                1, '2024-01-01T00:01:03.000Z'),
  -- Music Studio sources
  ('src-009', 'scn-music-003','Stage Camera',     'camera',  '{"device":"default","width":1920,"height":1080}',                1, '2024-01-01T00:02:00.000Z'),
  ('src-010', 'scn-music-003','Audio Visualizer', 'browser', '{"url":"https://visualizer.demo/waveform"}',                    1, '2024-01-01T00:02:01.000Z'),
  ('src-011', 'scn-music-003','Track Info',       'text',    '{"text":"Now Playing: Demo Track - Maxim Artist"}',              1, '2024-01-01T00:02:02.000Z'),
  -- Talk Show sources
  ('src-012', 'scn-talkshow-004','Host Camera',   'camera',  '{"device":"default","width":960,"height":540}',                  1, '2024-01-01T00:03:00.000Z'),
  ('src-013', 'scn-talkshow-004','Guest Camera 1','camera',  '{"device":"secondary","width":960,"height":540}',                1, '2024-01-01T00:03:01.000Z'),
  ('src-014', 'scn-talkshow-004','Lower Third',   'text',    '{"text":"Guest Name | Topic: Maxim Broadcast Demo"}',            1, '2024-01-01T00:03:02.000Z'),
  -- Fullscreen sources
  ('src-015', 'scn-fullscreen-005','Full Camera', 'camera',  '{"device":"default","width":1920,"height":1080}',                1, '2024-01-01T00:04:00.000Z');

-- ============================================================
-- Demo Streaming Profiles
-- ============================================================
INSERT OR IGNORE INTO stream_profiles (id, name, platform, server_url, stream_key, bitrate, created_at) VALUES
  ('sp-twitch-001', 'Twitch (Demo)',   'twitch',  'rtmp://live.twitch.tv/app',         'demo-stream-key-twitch-xxxxx',  6000, '2024-01-01T00:00:00.000Z'),
  ('sp-youtube-002','YouTube (Demo)',  'youtube', 'rtmp://a.rtmp.youtube.com/live2',   'demo-stream-key-youtube-xxxxx', 8000, '2024-01-01T00:00:01.000Z'),
  ('sp-custom-003', 'Custom RTMP',     'custom',  'rtmp://your-server/live',           'your-stream-key',               4000, '2024-01-01T00:00:02.000Z');
