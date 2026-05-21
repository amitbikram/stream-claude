#!/usr/bin/env node
// Purges jsDelivr's edge cache for every asset in artifacts/assets/.
// jsDelivr caches branch refs (@main) for ~12h; tag refs (@v1.x.x) never expire.
// Run this after pushing changes so widgets pick up the new CSS/JS immediately.
//
// Requires Node 18+ (uses built-in fetch).
//
// Usage:
//   node scripts/purge-jsdelivr.js           # purges @main
//   node scripts/purge-jsdelivr.js v1.2.0    # purges @v1.2.0

const { readdirSync } = require('node:fs');
const { join } = require('node:path');

const REPO = 'amitbikram/stream-claude';
const ASSETS_DIR = 'artifacts/assets';

const ref = process.argv[2] || 'main';
const dir = join(__dirname, '..', ASSETS_DIR);

const files = readdirSync(dir).filter(f => /\.(css|js)$/.test(f)).sort();
if (files.length === 0) {
  console.error(`No assets found in ${dir}`);
  process.exit(1);
}

const paths = files.map(f => `/gh/${REPO}@${ref}/${ASSETS_DIR}/${f}`);

(async () => {
  console.log(`Purging ${paths.length} assets at @${ref}…`);

  const res = await fetch('https://purge.jsdelivr.net/', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path: paths }),
  });

  const body = await res.text();
  if (!res.ok) {
    console.error(`Purge failed (HTTP ${res.status}):`, body);
    process.exit(1);
  }

  let parsed = null;
  try { parsed = JSON.parse(body); } catch {}

  if (parsed && parsed.id) {
    console.log(`Submitted (id: ${parsed.id})`);
    if (parsed.paths) {
      for (const [p, info] of Object.entries(parsed.paths)) {
        const status = (info && info.status) || 'pending';
        console.log(`  ${String(status).padEnd(8)} ${p}`);
      }
    } else {
      for (const p of paths) console.log(`  pending  ${p}`);
    }
  } else {
    console.log(body);
  }

  console.log('\nPurge propagates across edges in a few seconds.');
  console.log(`Check status: https://www.jsdelivr.com/tools/purge?id=${(parsed && parsed.id) || ''}`);
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
