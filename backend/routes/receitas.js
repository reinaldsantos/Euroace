const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models/database');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// LISTAR TODAS
router.get('/receitas', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM receitas ORDER BY created_at DESC");
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

// BUSCAR POR ESCOLA
router.get('/receitas/escola/:escola', async (req, res) => {
    const { escola } = req.params;
    try {
        const result = await db.query("SELECT * FROM receitas WHERE escola = $1 ORDER BY created_at DESC", [escola]);
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

// LISTAR ESCOLAS DISTINTAS
router.get('/escolas', async (req, res) => {
    try {
        const result = await db.query("SELECT DISTINCT escola FROM receitas ORDER BY escola");
        res.json(result.rows.map(r => r.escola));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// BUSCAR POR ID
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

// BUSCAR POR CATEGORIA
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

// CRIAR
router.post('/receitas', authMiddleware, upload.single('imagem'), async (req, res) => {
    const { numero_ficha, nome_prato, categoria, escola, numero_porcoes, tempo_preparacao, 
            forma_preparacao, ingredientes, preparacao, material_necessario } = req.body;
    const imagem_filename = req.file ? req.file.filename : null;
    const categoriasValidas = ['entrada', 'carne', 'peixe', 'sobremesa'];
    const categoriaFinal = categoriasValidas.includes(categoria) ? categoria : 'entrada';
    const escolaFinal = escola && escola.trim() !== '' ? escola : 'Geral';
    
    try {
        const result = await db.query(
            `INSERT INTO receitas (numero_ficha, nome_prato, categoria, escola, numero_porcoes, 
             tempo_preparacao, forma_preparacao, ingredientes, preparacao, 
             material_necessario, imagem_filename)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
            [numero_ficha, nome_prato, categoriaFinal, escolaFinal, numero_porcoes || 4, 
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

// ATUALIZAR
router.put('/receitas/:id', authMiddleware, upload.single('imagem'), async (req, res) => {
    const { id } = req.params;
    const { numero_ficha, nome_prato, categoria, escola, numero_porcoes, tempo_preparacao, 
            forma_preparacao, ingredientes, preparacao, material_necessario } = req.body;
    const imagem_filename = req.file ? req.file.filename : null;
    const escolaFinal = escola && escola.trim() !== '' ? escola : 'Geral';
    
    try {
        if (imagem_filename) {
            const old = await db.query("SELECT imagem_filename FROM receitas WHERE id = $1", [id]);
            if (old.rows[0] && old.rows[0].imagem_filename) {
                const oldPath = path.join(uploadDir, old.rows[0].imagem_filename);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }
        
        await db.query(
            `UPDATE receitas SET 
                numero_ficha = $1, nome_prato = $2, categoria = $3, escola = $4,
                numero_porcoes = $5, tempo_preparacao = $6, forma_preparacao = $7,
                ingredientes = $8, preparacao = $9, material_necessario = $10
                ${imagem_filename ? ', imagem_filename = $11' : ''}
             WHERE id = ${imagem_filename ? '$12' : '$11'}`,
            imagem_filename 
                ? [numero_ficha, nome_prato, categoria, escolaFinal, numero_porcoes, 
                   tempo_preparacao, forma_preparacao, ingredientes, preparacao, 
                   material_necessario, imagem_filename, id]
                : [numero_ficha, nome_prato, categoria, escolaFinal, numero_porcoes, 
                   tempo_preparacao, forma_preparacao, ingredientes, preparacao, 
                   material_necessario, id]
        );
        res.json({ message: 'Receita atualizada com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETAR
router.delete('/receitas/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT imagem_filename FROM receitas WHERE id = $1", [id]);
        if (result.rows[0] && result.rows[0].imagem_filename) {
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
