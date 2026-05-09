const { Pool } = require('pg');
const bcrypt = require('bcrypt');

let pool;

// Configuração para Render ou local
if (process.env.DATABASE_URL) {
  // Render PostgreSQL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // Local development (usando SQLite ou PostgreSQL local)
  // Se quiseres usar PostgreSQL local, descomenta as linhas abaixo
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'euroace',
  });
}

// Criar tabelas
async function initDatabase() {
  const client = await pool.connect();
  try {
    // Tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de receitas
    await client.query(`
      CREATE TABLE IF NOT EXISTS receitas (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inserir administradores padrão
    const admins = [
      { username: 'admin', password: 'Euroace2025', role: 'admin' },
      { username: 'chef', password: 'chef123', role: 'admin' },
      { username: 'cozinha', password: 'cozinha2025', role: 'admin' },
      { username: 'epf', password: 'epf2025', role: 'admin' },
      { username: 'convidado', password: 'visitante', role: 'admin' }
    ];

    for (const admin of admins) {
      const existing = await client.query('SELECT * FROM users WHERE username = $1', [admin.username]);
      if (existing.rows.length === 0) {
        const hash = bcrypt.hashSync(admin.password, 10);
        await client.query(
          'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
          [admin.username, hash, admin.role]
        );
        console.log(`✅ Usuário "${admin.username}" criado com sucesso!`);
      } else {
        console.log(`✅ Usuário "${admin.username}" já existe`);
      }
    }

    console.log('✅ Banco de dados PostgreSQL inicializado com sucesso!');
  } catch (err) {
    console.error('Erro ao inicializar banco:', err.message);
  } finally {
    client.release();
  }
}

initDatabase();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
