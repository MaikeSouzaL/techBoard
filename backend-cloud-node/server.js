const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const authRoutes = require('./routes/auth');
const brandRoutes = require('./routes/brands');
const modelRoutes = require('./routes/models');
const categoryRoutes = require('./routes/categories');
const guideRoutes = require('./routes/guides');

// Inicializa o BD
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares Globais
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rota Básica de Teste
app.get('/', (req, res) => {
  res.json({ 
    service: 'LogicLens Cloud API',
    status: 'online',
    version: '1.0.0'
  });
});

// Health check para o App Desktop
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// Registrar Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/guides', guideRoutes);

// Middlewares de Tratamento de Erro
app.use(notFound);
app.use(errorHandler);

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`[Cloud API] Servidor Node.js inciado!`);
  console.log(`[Cloud API] Rodando na porta: ${PORT}`);
  console.log(`========================================`);
});
