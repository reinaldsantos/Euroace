const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/auth');
const receitasRoutes = require('./routes/receitas');

app.use('/api', authRoutes);
app.use('/api', receitasRoutes);

app.get('/', (req, res) => {
    res.json({ 
        message: 'API EuroACE - Showcooking',
        version: '1.0.0',
        database: 'PostgreSQL'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📁 Endereço: http://localhost:${PORT}`);
});
