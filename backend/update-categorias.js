const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'euroace.db');
const db = new sqlite3.Database(dbPath);

// Adicionar coluna subcategoria
db.run("ALTER TABLE receitas ADD COLUMN subcategoria TEXT DEFAULT 'carne'", (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('Erro:', err.message);
  } else {
    console.log('✅ Coluna "subcategoria" adicionada!');
  }
});

// Adicionar coluna origem_geografica
db.run("ALTER TABLE receitas ADD COLUMN origem_geografica TEXT", (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('Erro:', err.message);
  } else {
    console.log('✅ Coluna "origem_geografica" adicionada!');
  }
});

// Adicionar coluna epoca_ano
db.run("ALTER TABLE receitas ADD COLUMN epoca_ano TEXT", (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('Erro:', err.message);
  } else {
    console.log('✅ Coluna "epoca_ano" adicionada!');
  }
});

// Adicionar coluna ocasiao_especial
db.run("ALTER TABLE receitas ADD COLUMN ocasiao_especial TEXT", (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('Erro:', err.message);
  } else {
    console.log('✅ Coluna "ocasiao_especial" adicionada!');
  }
});

// Adicionar coluna saberes_tradicoes
db.run("ALTER TABLE receitas ADD COLUMN saberes_tradicoes TEXT", (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('Erro:', err.message);
  } else {
    console.log('✅ Coluna "saberes_tradicoes" adicionada!');
  }
});

setTimeout(() => db.close(), 500);
