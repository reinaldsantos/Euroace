const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://euroace_user:gm18za4o5L4hXazADuTQCSGOE4UqlmCs@dpg-d7vkcbhj2pic73eivtig-a.oregon-postgres.render.com/euroace',
    ssl: { rejectUnauthorized: false }
});

async function updateEscola() {
    try {
        // Atualizar receitas com escola "Profissional" para o novo nome
        const result = await pool.query(
            "UPDATE receitas SET escola = $1 WHERE escola = $2",
            ['IES Universidad Laboral de Cáceres', 'Profissional']
        );
        console.log(`✅ ${result.rowCount} receitas atualizadas para "IES Universidad Laboral de Cáceres"`);
    } catch (err) {
        console.error('Erro:', err.message);
    } finally {
        await pool.end();
    }
}

updateEscola();
