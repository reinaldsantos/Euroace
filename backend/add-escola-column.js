const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function addColumn() {
    try {
        await pool.query("ALTER TABLE receitas ADD COLUMN IF NOT EXISTS escola TEXT DEFAULT 'Geral'");
        console.log('✅ Coluna "escola" adicionada com sucesso!');
    } catch (err) {
        console.error('Erro:', err.message);
    } finally {
        await pool.end();
    }
}

addColumn();
