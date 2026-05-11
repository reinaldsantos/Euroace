const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://euroace_user:gm18za4o5L4hXazADuTQCSGOE4UqlmCs@dpg-d7vkcbhj2pic73eivtig-a.oregon-postgres.render.com/euroace',
    ssl: { rejectUnauthorized: false }
});

async function padronizar() {
    try {
        // Atualizar Região Alentejo (remover espaço no final)
        let result = await pool.query(
            "UPDATE receitas SET escola = 'Região Alentejo' WHERE escola LIKE 'Região Alentejo%'"
        );
        console.log(`✅ Região Alentejo: ${result.rowCount} receitas atualizadas`);
        
        // Atualizar Escola Profissional do Fundão
        result = await pool.query(
            "UPDATE receitas SET escola = 'Escola Profissional do Fundão' WHERE escola LIKE 'Escola Profissional do Fundão%' OR escola = 'Escola Profissional Fundão'"
        );
        console.log(`✅ Escola Profissional do Fundão: ${result.rowCount} receitas atualizadas`);
        
        // Atualizar Agrícola Quintas da Lageosa (mapear o nome antigo)
        result = await pool.query(
            "UPDATE receitas SET escola = 'Agrícola Quintas da Lageosa' WHERE escola = 'Escola Profissional Agricola Quinta da Lageosa'"
        );
        console.log(`✅ Agrícola Quintas da Lageosa: ${result.rowCount} receitas atualizadas`);
        
        // Atualizar IES Universidad Laboral de Cáceres
        result = await pool.query(
            "UPDATE receitas SET escola = 'IES Universidad Laboral de Cáceres' WHERE escola = 'Profissional'"
        );
        console.log(`✅ IES Universidad Laboral de Cáceres: ${result.rowCount} receitas atualizadas`);
        
        console.log('\n🎉 Todas as escolas foram padronizadas!');
    } catch (err) {
        console.error('Erro:', err.message);
    } finally {
        await pool.end();
    }
}

padronizar();
