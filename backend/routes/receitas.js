const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models/database');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

// Garantir que a pasta uploads existe
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar armazenamento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, unique + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WEBP)'), false);
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Rota para criar receita COM imagem
router.post('/receitas', authMiddleware, (req, res) => {
    upload.single('imagem')(req, res, (err) => {
        if (err) {
            console.error('Erro no upload:', err.message);
            return res.status(400).json({ error: err.message });
        }
        
        const { numero_ficha, nome_prato, categoria, numero_porcoes, tempo_preparacao, 
                forma_preparacao, ingredientes, preparacao, material_necessario } = req.body;
        
        const imagem_filename = req.file ? req.file.filename : null;
        
        const categoriasValidas = ['entrada', 'carne', 'peixe', 'sobremesa'];
        const categoriaFinal = categoriasValidas.includes(categoria) ? categoria : 'entrada';
        
        db.run(
            `INSERT INTO receitas (numero_ficha, nome_prato, categoria, numero_porcoes, 
             tempo_preparacao, forma_preparacao, ingredientes, preparacao, 
             material_necessario, imagem_filename)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [numero_ficha, nome_prato, categoriaFinal, numero_porcoes || 4, 
             tempo_preparacao, forma_preparacao, ingredientes, preparacao, 
             material_necessario, imagem_filename],
            function(err) {
                if (err) {
                    console.error('Erro ao inserir:', err.message);
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Receita salva com sucesso!', id: this.lastID, imagem: imagem_filename });
            }
        );
    });
});

// Rota para atualizar receita
router.put('/receitas/:id', authMiddleware, (req, res) => {
    upload.single('imagem')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        const { id } = req.params;
        const { numero_ficha, nome_prato, categoria, numero_porcoes, tempo_preparacao, 
                forma_preparacao, ingredientes, preparacao, material_necessario } = req.body;
        const imagem_filename = req.file ? req.file.filename : null;
        
        if (imagem_filename) {
            db.get("SELECT imagem_filename FROM receitas WHERE id = ?", [id], (err, row) => {
                if (row && row.imagem_filename) {
                    const oldPath = path.join(uploadDir, row.imagem_filename);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
            });
        }
        
        let sql = `UPDATE receitas SET numero_ficha=?, nome_prato=?, categoria=?, numero_porcoes=?,
                    tempo_preparacao=?, forma_preparacao=?, ingredientes=?, preparacao=?, material_necessario=?`;
        let params = [numero_ficha, nome_prato, categoria, numero_porcoes, tempo_preparacao, 
                      forma_preparacao, ingredientes, preparacao, material_necessario];
        
        if (imagem_filename) {
            sql += `, imagem_filename=?`;
            params.push(imagem_filename);
        }
        
        sql += ` WHERE id=?`;
        params.push(id);
        
        db.run(sql, params, function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Receita atualizada com sucesso!' });
        });
    });
});

// Listar receitas
router.get('/receitas', (req, res) => {
    db.all("SELECT * FROM receitas ORDER BY created_at DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        rows.forEach(row => {
            if (row.ingredientes) {
                try { row.ingredientes = JSON.parse(row.ingredientes); } catch(e) { row.ingredientes = []; }
            }
            if (row.preparacao) {
                try { row.preparacao = JSON.parse(row.preparacao); } catch(e) { row.preparacao = []; }
            }
        });
        res.json(rows);
    });
});

router.get('/receitas/categoria/:categoria', (req, res) => {
    const { categoria } = req.params;
    db.all("SELECT * FROM receitas WHERE categoria = ? ORDER BY created_at DESC", [categoria], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        rows.forEach(row => {
            if (row.ingredientes) {
                try { row.ingredientes = JSON.parse(row.ingredientes); } catch(e) { row.ingredientes = []; }
            }
            if (row.preparacao) {
                try { row.preparacao = JSON.parse(row.preparacao); } catch(e) { row.preparacao = []; }
            }
        });
        res.json(rows);
    });
});

router.get('/receitas/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM receitas WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Receita não encontrada' });
        if (row.ingredientes) {
            try { row.ingredientes = JSON.parse(row.ingredientes); } catch(e) { row.ingredientes = []; }
        }
        if (row.preparacao) {
            try { row.preparacao = JSON.parse(row.preparacao); } catch(e) { row.preparacao = []; }
        }
        res.json(row);
    });
});

router.delete('/receitas/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    db.get("SELECT imagem_filename FROM receitas WHERE id = ?", [id], (err, row) => {
        if (row && row.imagem_filename) {
            const imagePath = path.join(uploadDir, row.imagem_filename);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }
        db.run("DELETE FROM receitas WHERE id = ?", [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Receita não encontrada' });
            res.json({ message: 'Receita removida com sucesso' });
        });
    });
});

module.exports = router;
