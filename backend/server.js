const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

// Garantir que a pasta uploads existe
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (imagens)
app.use('/uploads', express.static('uploads'));

// Importar rotas
const authRoutes = require('./routes/auth');
const receitasRoutes = require('./routes/receitas');

// Usar rotas
app.use('/api', authRoutes);
app.use('/api', receitasRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'API EuroACE - Showcooking',
    version: '1.0.0',
    endpoints: {
      public: ['GET /api/receitas', 'GET /api/receitas/:id'],
      auth: ['POST /api/login', 'GET /api/verify'],
      protected: ['POST /api/receitas', 'DELETE /api/receitas/:id']
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📁 Endereço: http://localhost:${PORT}`);
});
