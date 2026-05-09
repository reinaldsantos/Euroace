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
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS receitas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_ficha TEXT UNIQUE,
      nome_prato TEXT NOT NULL,
      categoria TEXT DEFAULT 'entrada',
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

  // Todos os utilizadores como admin
  const admins = [
    { username: 'admin', password: 'Euroace2025', role: 'admin' },
    { username: 'chef', password: 'chef123', role: 'admin' },
    { username: 'cozinha', password: 'cozinha2025', role: 'admin' },
    { username: 'epf', password: 'epf2025', role: 'admin' },
    { username: 'convidado', password: 'visitante', role: 'admin' }
  ];

  admins.forEach(admin => {
    db.get("SELECT * FROM users WHERE username = ?", [admin.username], (err, row) => {
      if (err) {
        console.error('Erro ao verificar admin:', err.message);
        return;
      }
      
      if (!row) {
        const hash = bcrypt.hashSync(admin.password, 10);
        db.run(
          "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
          [admin.username, hash, admin.role],
          (err) => {
            if (err) {
              console.error('Erro ao criar admin:', err.message);
            } else {
              console.log(`✅ Usuário "${admin.username}" criado com sucesso!`);
              console.log(`   Senha: ${admin.password} | Role: ${admin.role}`);
            }
          }
        );
      } else {
        // Atualizar role para admin se não for
        db.run("UPDATE users SET role = 'admin' WHERE username = ?", [admin.username]);
        console.log(`✅ Usuário "${admin.username}" já existe (role atualizada para admin)`);
      }
    });
  });

  console.log('✅ Banco de dados SQLite inicializado com sucesso!');
});

module.exports = db;
