/**
 * Seed default categories using the HTTP API (server must be running).
 * Run: node scripts/seedCategoriesHttp.js
 */
const http = require('http');

const BASE_URL = 'http://localhost:5000';

const DEFAULT_CATEGORIES = [
  { name: 'Áudio',           icon: 'volume2',   color: '#06b6d4' },
  { name: 'Bateria / Carga', icon: 'battery',   color: '#22c55e' },
  { name: 'Câmera',          icon: 'camera',    color: '#f59e0b' },
  { name: 'Conectividade',   icon: 'wifi',      color: '#3b82f6' },
  { name: 'Display / Tela',  icon: 'monitor',   color: '#8b5cf6' },
  { name: 'Outros',          icon: 'clipboard', color: '#78909c' },
  { name: 'Placa / Chip',    icon: 'cpu',       color: '#ef4444' },
  { name: 'Software',        icon: 'code',      color: '#ec4899' },
];

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const req = http.request(opts, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: raw }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve(JSON.parse(raw)));
    }).on('error', reject);
  });
}

async function seed() {
  console.log('Checking existing categories...');
  const existing = await get('/api/categories');
  const existingNames = existing.map(c => c.name);
  console.log(`Found ${existing.length} existing categories.`);

  let created = 0;
  for (const cat of DEFAULT_CATEGORIES) {
    if (existingNames.includes(cat.name)) {
      console.log(`⏭️  Skipping existing: ${cat.name}`);
      continue;
    }
    const res = await post('/api/categories', cat);
    if (res.status === 201) {
      console.log(`✅ Created: ${cat.name}`);
      created++;
    } else {
      console.log(`❌ Failed (${res.status}): ${cat.name} — ${res.body}`);
    }
  }

  console.log(`\n✅ Done! Created ${created} new categories.`);
}

seed().catch(err => {
  console.error('\n❌ Error:', err.message);
  console.error('Make sure the server is running: node server.js');
  process.exit(1);
});
