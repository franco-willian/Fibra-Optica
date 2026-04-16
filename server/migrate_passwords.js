require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function migratePasswords() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'fibra_optica'
    });

    try {
        const [users] = await pool.query('SELECT id, username, password FROM users');
        
        for (let user of users) {
             // Só criptografa se parecer ser texto puro (curto e sem o prefixo do hash bcrypt $2a$)
             if (!user.password.startsWith('$2a$')) {
                 const hashedPassword = await bcrypt.hash(user.password, 10);
                 await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
                 console.log(`Senha atualizada para o usuário: ${user.username}`);
             }
        }
        console.log('Migração de senhas concluída!');
    } catch (err) {
        console.error('Erro na migração:', err);
    } finally {
        await pool.end();
    }
}

migratePasswords();
