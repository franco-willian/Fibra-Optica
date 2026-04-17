require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT=3001 || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração do Multer para Upload de Fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

// Prevenção de quedas do servidor
process.on('uncaughtException', (err) => {
  console.error('EXCEÇÃO NÃO TRATADA:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('REJEIÇÃO NÃO TRATADA EM:', promise, 'motivo:', reason);
});

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
  console.log(`Tentativa de login: usuário=${username}`);
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name, phone: user.phone },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '10y' } // Aumentado para evitar deslogue constante em campo
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name, phone: user.phone } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor durante o login' });
  }
});

// GET /api/auth/me (Check if token is valid)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, username, role, phone FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
});

// PUT /api/auth/profile (Update self profile)
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  const { name, username, password, phone } = req.body;
  const userId = req.user.id;
  
  try {
    let query = 'UPDATE users SET name=?, username=?, phone=?';
    let params = [name, username, phone];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password=?';
      params.push(hashedPassword);
    }

    query += ' WHERE id=?';
    params.push(userId);

    await pool.query(query, params);
    
    // Busca dados atualizados para retornar
    const [rows] = await pool.query('SELECT id, name, username, role, phone FROM users WHERE id = ?', [userId]);
    res.json({ message: 'Perfil atualizado com sucesso', user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar perfil (username pode já existir)' });
  }
});

// --- USER MANAGEMENT ROUTES (ADMIN ONLY) ---

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

// GET /api/users
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, username, role, cpf, phone, state, city, created_at FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// POST /api/users
app.post('/api/users', authenticateToken, isAdmin, async (req, res) => {
  const { name, username, password, role, cpf, phone, state, city } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, username, password, role, cpf, phone, state, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, username, hashedPassword, role, cpf, phone, state, city]
    );
    res.status(201).json({ id: result.insertId, message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário (verifique se o username já existe)' });
  }
});

// PUT /api/users/:id
app.put('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, username, password, role, cpf, phone, state, city } = req.body;
  try {
    let query = 'UPDATE users SET name=?, username=?, role=?, cpf=?, phone=?, state=?, city=?';
    let params = [name, username, role, cpf, phone, state, city];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password=?';
      params.push(hashedPassword);
    }

    query += ' WHERE id=?';
    params.push(id);

    await pool.query(query, params);
    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover usuário' });
  }
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
    const [rows] = await pool.query(`
      SELECT n.*, c.name as city_name, GROUP_CONCAT(p.photo_url) as photos
      FROM network_nodes n
      LEFT JOIN cities c ON n.city_id = c.id
      LEFT JOIN node_photos p ON n.id = p.node_id
      GROUP BY n.id
    `);
    
    // Converte a string do GROUP_CONCAT em um array
    const nodes = rows.map(node => ({
      ...node,
      photos: node.photos ? node.photos.split(',') : []
    }));
    
    res.json(nodes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar nós de rede' });
  }
});

// POST /api/nodes (Multiple Photos)
app.post('/api/nodes', authenticateToken, upload.array('photos', 5), async (req, res) => {
  const { type, name, latitude, longitude, capacity, city_id, observation } = req.body;
  const files = req.files || [];

  if (files.length === 0) {
    return res.status(400).json({ error: 'Pelo menos uma foto é obrigatória!' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO network_nodes (type, name, latitude, longitude, capacity, city_id, observation) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [type, name, latitude, longitude, capacity || null, city_id, observation]
    );
    const nodeId = result.insertId;

    // Insere as fotos na tabela node_photos
    for (const file of files) {
      await pool.query('INSERT INTO node_photos (node_id, photo_url) VALUES (?, ?)', [nodeId, `/uploads/${file.filename}`]);
    }

    res.status(201).json({ id: nodeId, name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar nó de rede' });
  }
});

// PUT /api/nodes/:id (Update Equipment with Multiple Photos)
app.put('/api/nodes/:id', authenticateToken, upload.array('photos', 5), async (req, res) => {
  const { id } = req.params;
  const { type, name, latitude, longitude, capacity, city_id, observation, status } = req.body;
  const files = req.files || [];

  try {
    await pool.query(
      'UPDATE network_nodes SET type=?, name=?, latitude=?, longitude=?, capacity=?, city_id=?, observation=?, status=? WHERE id=?',
      [type, name, latitude, longitude, capacity || null, city_id, observation, status || 'active', id]
    );

    // Se novas fotos foram enviadas, elas substititruem as antigas (conforme pedido do usuário)
    if (files.length > 0) {
      // 1. Opcional: deletar arquivos físicos aqui (para economizar espaço)
      // 2. Deletar registros antigos no banco
      await pool.query('DELETE FROM node_photos WHERE node_id = ?', [id]);
      
      // 3. Inserir novas fotos
      for (const file of files) {
        await pool.query('INSERT INTO node_photos (node_id, photo_url) VALUES (?, ?)', [id, `/uploads/${file.filename}`]);
      }
    }

    res.json({ message: 'Equipamento atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar equipamento' });
  }
});

// GET /api/logs
app.get('/api/logs', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        change_logs.*, 
        users.username, 
        network_nodes.name as node_name,
        cities.name as city_name
      FROM change_logs 
      LEFT JOIN users ON change_logs.user_id = users.id
      LEFT JOIN network_nodes ON change_logs.node_id = network_nodes.id
      LEFT JOIN cities ON network_nodes.city_id = cities.id
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

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port} (All interfaces)`);
});
