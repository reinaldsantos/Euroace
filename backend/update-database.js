const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'euroace.db');
const db = new sqlite3.Database(dbPath);

// Adicionar coluna categoria na tabela receitas
db.run("ALTER TABLE receitas ADD COLUMN categoria TEXT DEFAULT 'entrada'", (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('Erro:', err.message);
  } else {
    console.log('✅ Coluna "categoria" adicionada com sucesso!');
  }
});

db.close();
