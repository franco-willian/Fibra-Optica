const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'fibra_optica'
});

async function importCities() {
  console.log('--- Iniciando Importação de Cidades do RS ---');
  try {
    // API do IBGE para municípios do RS (UF 43)
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/43/municipios');
    const ibgeCities = await response.json();
    
    console.log(`Detectadas ${ibgeCities.length} cidades na API do IBGE.`);

    let count = 0;
    for (const city of ibgeCities) {
      // Verifica se a cidade já existe (pelo nome e estado)
      const [rows] = await pool.query('SELECT id FROM cities WHERE name = ? AND state = ?', [city.nome, 'RS']);
      
      if (rows.length === 0) {
        await pool.query('INSERT INTO cities (name, state) VALUES (?, ?)', [city.nome, 'RS']);
        count++;
      }
    }

    console.log(`Sucesso! ${count} novas cidades foram adicionadas ao banco.`);
  } catch (error) {
    console.error('Erro na importação:', error);
  } finally {
    process.exit();
  }
}

importCities();
