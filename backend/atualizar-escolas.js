const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://euroace_user:gm18za4o5L4hXazADuTQCSGOE4UqlmCs@dpg-d7vkcbhj2pic73eivtig-a.oregon-postgres.render.com/euroace',
    ssl: { rejectUnauthorized: false }
});

async function atualizarEscolas() {
    try {
        const updates = [
            { antigo: '%Agostinho Roseta%', novo: 'EP Agostinho Roseta' },
            { antigo: '%Alter do Chão%', novo: 'EPDR Alter do Chão' },
            { antigo: '%Raia%', novo: 'EP Raia Idanha-a-Nova' },
            { antigo: '%Idanha%', novo: 'EP Raia Idanha-a-Nova' },
            { antigo: '%Alentejo%', novo: 'EP Região Alentejo' },
            { antigo: '%Lageosa%', novo: 'EP Agrícola Quintas da Lageosa' },
            { antigo: '%Quinta%', novo: 'EP Agrícola Quintas da Lageosa' },
            { antigo: '%Fundão%', novo: 'EP Escola Profissional do Fundão' },
            { antigo: '%San Fernando%', novo: 'IES San Fernando de Badajoz' },
            { antigo: '%Badajoz%', novo: 'IES San Fernando de Badajoz' },
            { antigo: '%Laboral%', novo: 'IES Universidad Laboral de Cáceres' },
            { antigo: '%Cáceres%', novo: 'IES Universidad Laboral de Cáceres' }
        ];
        
        for (const update of updates) {
            const result = await pool.query(
                `UPDATE receitas SET escola = $1 WHERE escola ILIKE $2`,
                [update.novo, update.antigo]
            );
            if (result.rowCount > 0) {
                console.log(`✅ Atualizado: ${update.antigo} → ${update.novo} (${result.rowCount} receitas)`);
            }
        }
        
        console.log('\n🎉 Atualização concluída!');
    } catch (err) {
        console.error('Erro:', err.message);
    } finally {
        await pool.end();
    }
}

atualizarEscolas();
