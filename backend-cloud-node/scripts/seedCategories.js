/**
 * Seed script to populate default categories into MongoDB.
 * Run: node scripts/seedCategories.js
 */
const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const DEFAULT_CATEGORIES = [
  { name: 'Não Liga / Não Inicia', icon: 'power', color: '#ef4444' },
  { name: 'Problemas de Carga', icon: 'battery', color: '#22c55e' },
  { name: 'Problemas de Tela', icon: 'smartphone', color: '#8b5cf6' },
  { name: 'Problemas de Sinal', icon: 'signal', color: '#3b82f6' },
  { name: 'Problemas de Software', icon: 'code', color: '#ec4899' },
  { name: 'Problemas de Segurança', icon: 'shield', color: '#f97316' },
  { name: 'Problemas de Câmera', icon: 'camera', color: '#f59e0b' },
  { name: 'Problemas de Áudio', icon: 'volume-2', color: '#06b6d4' },
  { name: 'Problemas de Armazenamento', icon: 'hard-drive', color: '#64748b' },
  { name: 'Problemas de Hardware', icon: 'cpu', color: '#f43f5e' },
  { name: 'Problemas de Boot', icon: 'zap', color: '#eab308' },
  { name: 'Problemas de Desempenho', icon: 'activity', color: '#14b8a6' },
  { name: 'Problemas de Backup/Dados', icon: 'database', color: '#6366f1' },
  { name: 'Problemas de Rede', icon: 'globe', color: '#0ea5e9' },
  { name: 'Problemas de Sistema', icon: 'settings', color: '#78716c' },
];

async function seed() {
  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/logiclens';
  
  console.log('Connecting to MongoDB...', MONGO_URI.replace(/\/\/.*@/, '//***@'));
  await mongoose.connect(MONGO_URI);
  console.log('Connected!');

  for (const cat of DEFAULT_CATEGORIES) {
    const exists = await Category.findOne({ name: cat.name });
    if (!exists) {
      await Category.create(cat);
      console.log(`✅ Created category: ${cat.name}`);
    } else {
      console.log(`⏭️  Already exists: ${cat.name}`);
    }
  }

  console.log('\n✅ Seed complete!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
