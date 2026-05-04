const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../models/database');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Rotas públicas
router.get('/receitas', (req, res) => {
  db.all("SELECT * FROM receitas ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    rows.forEach(row => {
      if (row.ingredientes) {
        try {
          row.ingredientes = JSON.parse(row.ingredientes);
        } catch(e) { row.ingredientes = []; }
      }
      if (row.preparacao) {
        try {
          row.preparacao = JSON.parse(row.preparacao);
        } catch(e) { row.preparacao = []; }
      }
    });
    
    res.json(rows);
  });
});

router.get('/receitas/:id', (req, res) => {
  const { id } = req.params;
  
  db.get("SELECT * FROM receitas WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Receita não encontrada' });
    }
    
    if (row.ingredientes) {
      try {
        row.ingredientes = JSON.parse(row.ingredientes);
      } catch(e) { row.ingredientes = []; }
    }
    if (row.preparacao) {
      try {
        row.preparacao = JSON.parse(row.preparacao);
      } catch(e) { row.preparacao = []; }
    }
    
    res.json(row);
  });
});

// Rotas protegidas
router.post('/receitas', authMiddleware, upload.single('imagem'), (req, res) => {
  const { numero_ficha, nome_prato, numero_porcoes, pax, tempo_preparacao, 
          forma_preparacao, ingredientes, preparacao, material_necessario } = req.body;
  
  const imagem_filename = req.file ? req.file.filename : null;
  
  db.run(
    `INSERT INTO receitas (numero_ficha, nome_prato, numero_porcoes, pax, 
     tempo_preparacao, forma_preparacao, ingredientes, preparacao, 
     material_necessario, imagem_filename)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [numero_ficha, nome_prato, numero_porcoes, pax, tempo_preparacao, 
     forma_preparacao, ingredientes, preparacao, material_necessario, imagem_filename],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Número de ficha já existe' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Ficha técnica salva com sucesso!', id: this.lastID });
    }
  );
});

router.delete('/receitas/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM receitas WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Receita não encontrada' });
    }
    res.json({ message: 'Receita removida com sucesso' });
  });
});

module.exports = router;
