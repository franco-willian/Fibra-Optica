require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fibra_optica',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '10m' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor durante o login' });
  }
});

// GET /api/auth/me (Check if token is valid)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// --- PROTECTED DATA ROUTES ---

// GET /api/cities (Open for now, or protect if needed)
app.get('/api/cities', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cities');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cidades' });
  }
});

// GET /api/nodes
app.get('/api/nodes', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM network_nodes');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar nós de rede' });
  }
});

// POST /api/nodes
app.post('/api/nodes', authenticateToken, async (req, res) => {
  const { type, name, latitude, longitude, capacity, city_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO network_nodes (type, name, latitude, longitude, capacity, city_id) VALUES (?, ?, ?, ?, ?, ?)',
      [type, name, latitude, longitude, capacity, city_id]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar nó de rede' });
  }
});

// GET /api/logs
app.get('/api/logs', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT change_logs.*, users.username, network_nodes.name as node_name 
      FROM change_logs 
      LEFT JOIN users ON change_logs.user_id = users.id
      LEFT JOIN network_nodes ON change_logs.node_id = network_nodes.id
      ORDER BY change_logs.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
});

// POST /api/logs
app.post('/api/logs', authenticateToken, async (req, res) => {
    const { node_id, action_description } = req.body;
    const user_id = req.user.id; // Get from token!
    try {
        const [result] = await pool.query(
            'INSERT INTO change_logs (user_id, node_id, action_description) VALUES (?, ?, ?)',
            [user_id, node_id, action_description]
        );
        res.status(201).json({ id: result.insertId, message: 'Log registrado' });
    } catch(err) {
        res.status(500).json({ error: 'Erro ao criar log' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
