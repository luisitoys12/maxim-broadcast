#!/usr/bin/env node
/**
 * generate-demo-data.js
 * Seeds the in-memory users store with demo accounts by hitting the
 * backend /api/auth/register endpoint.  Run after the server starts.
 *
 * Usage:  node scripts/generate-demo-data.js [base-url]
 *   base-url defaults to http://localhost:4000
 */

const BASE_URL = process.argv[2] || 'http://localhost:4000';

const DEMO_USERS = [
  { username: 'Admin',     email: 'admin@demo.com', password: 'demo123' },
  { username: 'Demo User', email: 'demo@demo.com',  password: 'demo123' },
];

async function register(user) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`✅ Registered: ${user.email} (role: ${data.user?.role})`);
    return data.token;
  }
  if (res.status === 409) {
    console.log(`ℹ️  Already exists: ${user.email}`);
    return null;
  }
  console.warn(`⚠️  Could not register ${user.email}: ${JSON.stringify(data)}`);
  return null;
}

async function createDemoScenes(token) {
  if (!token) return;

  const SCENES = [
    { name: 'News Studio',  description: 'Professional news broadcast with chroma key background' },
    { name: 'Gaming Setup', description: 'Gaming stream with overlays, alerts and webcam frame'   },
    { name: 'Music Studio', description: 'Music broadcast with audio visualizers'                 },
    { name: 'Talk Show',    description: 'Round-table talk show with multi-camera layout'         },
    { name: 'Fullscreen',   description: 'Simple fullscreen scene - clean canvas'                 },
  ];

  for (const scene of SCENES) {
    const res = await fetch(`${BASE_URL}/api/scenes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(scene),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`🎬 Scene created: ${scene.name}`);
    } else {
      console.warn(`⚠️  Scene "${scene.name}": ${JSON.stringify(data)}`);
    }
  }
}

async function main() {
  console.log(`\n🚀 Generating demo data against ${BASE_URL}\n`);

  // Register admin first to get token
  const adminToken = await register(DEMO_USERS[0]);

  // Register remaining users
  for (const user of DEMO_USERS.slice(1)) {
    await register(user);
  }

  // Create demo scenes using admin token
  await createDemoScenes(adminToken);

  console.log('\n✅ Demo data generation complete.\n');
}

main().catch((err) => {
  console.error('❌ Error generating demo data:', err.message);
  process.exit(1);
});
