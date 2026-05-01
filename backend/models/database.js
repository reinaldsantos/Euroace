const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, '../euroace.db');
const db = new sqlite3.Database(dbPath);

db.run('PRAGMA foreign_keys = ON');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS receitas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_ficha TEXT UNIQUE,
      nome_prato TEXT NOT NULL,
      numero_porcoes INTEGER,
      pax INTEGER DEFAULT 100,
      tempo_preparacao TEXT,
      forma_preparacao TEXT,
      ingredientes TEXT,
      preparacao TEXT,
      material_necessario TEXT,
      imagem_filename TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
    if (err) {
      console.error('Erro ao verificar admin:', err.message);
      return;
    }
    
    if (!row) {
      const hash = bcrypt.hashSync('Euroace2025', 10);
      db.run(
        "INSERT INTO users (username, password_hash) VALUES (?, ?)",
        ['admin', hash],
        (err) => {
          if (err) {
            console.error('Erro ao criar admin:', err.message);
          } else {
            console.log('✅ Usuário admin criado com sucesso!');
            console.log('   Usuário: admin');
            console.log('   Senha: Euroace2025');
          }
        }
      );
    } else {
      console.log('✅ Usuário admin já existe');
    }
  });

  console.log('✅ Banco de dados SQLite inicializado com sucesso!');
});

module.exports = db;
