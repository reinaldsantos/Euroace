const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, 'euroace.db');
const db = new sqlite3.Database(dbPath);

// Lista de novos administradores
const novosAdmins = [
    { username: 'chef', password: 'chef123', role: 'editor' },
    { username: 'cozinha', password: 'cozinha2025', role: 'editor' },
    { username: 'epf', password: 'epf2025', role: 'viewer' },
    { username: 'convidado', password: 'visitante', role: 'viewer' }
];

// Verificar se já existem e adicionar se não existirem
novosAdmins.forEach(admin => {
    db.get("SELECT * FROM users WHERE username = ?", [admin.username], (err, row) => {
        if (err) {
            console.error('Erro:', err.message);
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
                        console.log(`✅ Administrador "${admin.username}" criado com sucesso!`);
                        console.log(`   Senha: ${admin.password} | Role: ${admin.role}`);
                    }
                }
            );
        } else {
            console.log(`⚠️ Administrador "${admin.username}" já existe.`);
        }
    });
});

setTimeout(() => {
    console.log('\n📋 Todos os administradores processados!');
    db.close();
}, 1000);
