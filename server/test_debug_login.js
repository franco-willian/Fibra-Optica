require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testLogin() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'fibra_optica'
    });

    const username = 'admin';
    const password = 'admin123';

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            console.log('USUÁRIO NÃO ENCONTRADO NO BANCO');
            return;
        }

        const user = rows[0];
        console.log('Usuário encontrado:', user.username);
        console.log('Hash no banco:', user.password);

        const validPassword = await bcrypt.compare(password, user.password);
        console.log('Senha "admin123" válida?', validPassword);

        // Testando gerar um novo hash para admin123
        const newHash = await bcrypt.hash(password, 10);
        console.log('Exemplo de novo hash para "admin123":', newHash);

    } catch (err) {
        console.error('Erro no teste:', err);
    } finally {
        await pool.end();
    }
}

testLogin();
