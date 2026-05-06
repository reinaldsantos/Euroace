const express = require('express');
const router = express.Router();
const db = require('../models/database');
const auth = require('../middlewares/auth');

// adicionar favorito
router.post('/', auth, (req, res) => {
  const user_id = req.userId;
  const { receita_id } = req.body;

  db.run(
    `INSERT INTO favoritos (user_id, receita_id) VALUES (?, ?)`,
    [user_id, receita_id],
    function (err) {
      if (err) {
        return res.status(400).json({ erro: 'Já está nos favoritos' });
      }
      res.json({ mensagem: 'Adicionado aos favoritos' });
    }
  );
});

// listar favoritos
router.get('/', auth, (req, res) => {
  const user_id = req.userId;

  db.all(
    `SELECT receitas.* 
     FROM favoritos 
     JOIN receitas ON favoritos.receita_id = receitas.id
     WHERE favoritos.user_id = ?`,
    [user_id],
    (err, rows) => {
      res.json(rows);
    }
  );
});

// remover favorito
router.delete('/:id', auth, (req, res) => {
  const user_id = req.userId;
  const receita_id = req.params.id;

  db.run(
    `DELETE FROM favoritos WHERE user_id = ? AND receita_id = ?`,
    [user_id, receita_id],
    () => res.json({ mensagem: 'Removido' })
  );
});

module.exports = router;