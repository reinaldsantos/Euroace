const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models/database');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.get('/receitas', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM receitas ORDER BY created_at DESC");
        const rows = result.rows;
        rows.forEach(row => {
            if (row.ingredientes) {
                try { row.ingredientes = JSON.parse(row.ingredientes); } catch(e) { row.ingredientes = []; }
            }
            if (row.preparacao) {
                try { row.preparacao = JSON.parse(row.preparacao); } catch(e) { row.preparacao = []; }
            }
        });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/receitas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT * FROM receitas WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Receita não encontrada' });
        const row = result.rows[0];
        if (row.ingredientes) {
            try { row.ingredientes = JSON.parse(row.ingredientes); } catch(e) { row.ingredientes = []; }
        }
        if (row.preparacao) {
            try { row.preparacao = JSON.parse(row.preparacao); } catch(e) { row.preparacao = []; }
        }
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/receitas/categoria/:categoria', async (req, res) => {
    const { categoria } = req.params;
    try {
        const result = await db.query("SELECT * FROM receitas WHERE categoria = $1 ORDER BY created_at DESC", [categoria]);
        result.rows.forEach(row => {
            if (row.ingredientes) {
                try { row.ingredientes = JSON.parse(row.ingredientes); } catch(e) { row.ingredientes = []; }
            }
            if (row.preparacao) {
                try { row.preparacao = JSON.parse(row.preparacao); } catch(e) { row.preparacao = []; }
            }
        });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/receitas', authMiddleware, upload.single('imagem'), async (req, res) => {
    const { numero_ficha, nome_prato, categoria, numero_porcoes, tempo_preparacao, 
            forma_preparacao, ingredientes, preparacao, material_necessario } = req.body;
    const imagem_filename = req.file ? req.file.filename : null;
    const categoriasValidas = ['entrada', 'carne', 'peixe', 'sobremesa'];
    const categoriaFinal = categoriasValidas.includes(categoria) ? categoria : 'entrada';
    
    try {
        const result = await db.query(
            `INSERT INTO receitas (numero_ficha, nome_prato, categoria, numero_porcoes, 
             tempo_preparacao, forma_preparacao, ingredientes, preparacao, 
             material_necessario, imagem_filename)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            [numero_ficha, nome_prato, categoriaFinal, numero_porcoes || 4, 
             tempo_preparacao, forma_preparacao, ingredientes, preparacao, 
             material_necessario, imagem_filename]
        );
        res.json({ message: 'Receita salva com sucesso!', id: result.rows[0].id });
    } catch (err) {
        if (err.constraint === 'receitas_numero_ficha_key') {
            return res.status(409).json({ error: 'Número de ficha já existe' });
        }
        res.status(500).json({ error: err.message });
    }
});

router.delete('/receitas/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT imagem_filename FROM receitas WHERE id = $1", [id]);
        if (result.rows.length > 0 && result.rows[0].imagem_filename) {
            const imagePath = path.join(uploadDir, result.rows[0].imagem_filename);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }
        await db.query("DELETE FROM receitas WHERE id = $1", [id]);
        res.json({ message: 'Receita removida com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

// ATUALIZAR RECEITA (PUT)
router.put('/receitas/:id', authMiddleware, upload.single('imagem'), async (req, res) => {
    const { id } = req.params;
    const { numero_ficha, nome_prato, categoria, numero_porcoes, tempo_preparacao, 
            forma_preparacao, ingredientes, preparacao, material_necessario } = req.body;
    const imagem_filename = req.file ? req.file.filename : null;
    
    try {
        // Se houver nova imagem, apagar a antiga
        if (imagem_filename) {
            const old = await db.query("SELECT imagem_filename FROM receitas WHERE id = $1", [id]);
            if (old.rows[0] && old.rows[0].imagem_filename) {
                const oldPath = path.join(uploadDir, old.rows[0].imagem_filename);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }
        
        // Construir a query de atualização
        let query = `UPDATE receitas SET 
            numero_ficha = $1, 
            nome_prato = $2, 
            categoria = $3, 
            numero_porcoes = $4,
            tempo_preparacao = $5, 
            forma_preparacao = $6, 
            ingredientes = $7, 
            preparacao = $8, 
            material_necessario = $9`;
        let params = [numero_ficha, nome_prato, categoria, numero_porcoes, 
                      tempo_preparacao, forma_preparacao, ingredientes, preparacao, material_necessario];
        
        if (imagem_filename) {
            query += `, imagem_filename = $10`;
            params.push(imagem_filename);
            query += ` WHERE id = $11`;
            params.push(id);
        } else {
            query += ` WHERE id = $10`;
            params.push(id);
        }
        
        await db.query(query, params);
        res.json({ message: 'Receita atualizada com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar:', err);
        res.status(500).json({ error: err.message });
    }
});
