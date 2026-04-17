import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, Shield, User, MapPin, Phone, Hash, X, Save } from 'lucide-react';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'technician',
    cpf: '',
    phone: '',
    state: '',
    city: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || '',
        username: user.username,
        password: '', // Don't show password
        role: user.role,
        cpf: user.cpf || '',
        phone: user.phone || '',
        state: user.state || '',
        city: user.city || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'technician',
        cpf: '',
        phone: '',
        state: '',
        city: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingUser ? `${API_BASE_URL}/users/${editingUser.id}` : `${API_BASE_URL}/users`;
    const method = editingUser ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao processar usuário');
      }
    } catch (err) {
      alert('Erro de conexão');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este usuário?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      alert('Erro ao remover');
    }
  };

  return (
    <>
      <div className="animate-slide-up" style={{ padding: '1.25rem', paddingTop: '5rem', paddingBottom: '100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Gestão de Usuários</h2>
          <button onClick={() => handleOpenModal()} className="btn-primary" style={{ padding: '0.6rem 1rem' }}>
            <UserPlus size={18} /> Novo Usuário
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {users.map(u => (
              <div key={u.id} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '50%', 
                      background: u.role === 'admin' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: u.role === 'admin' ? 'var(--secondary)' : 'var(--primary)'
                    }}>
                      {u.role === 'admin' ? <Shield size={24} /> : <User size={24} />}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem' }}>{u.name || u.username}</h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{u.username} • {u.role === 'admin' ? 'Administrador' : 'Técnico'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleOpenModal(u)} className="btn-icon" style={{ width: '36px', height: '36px' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="btn-icon" style={{ width: '36px', height: '36px', color: 'var(--danger)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div style={{ 
                  marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Hash size={12} /> CPF: {u.cpf || 'N/A'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} /> Tel: {u.phone || 'N/A'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', gridColumn: 'span 2' }}>
                    <MapPin size={12} /> {u.city || 'N/A'}/{u.state || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal User Form - FIX PARA TELA CHEIA E POSICIONAMENTO CORRETO NO TOPO */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, // Cobre 100% (top, left, right, bottom: 0)
          background: 'rgba(0,0,0,0.85)', 
          zIndex: 9999, 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'flex-start', // Começa do topo para evitar cortes
          // Aumentei o espaço para garantir que o título sempre apareça abaixo do notch/barras
          padding: '5rem 1rem', 
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {/* Removi a classe animate-slide-up aqui para evitar conflitos de transform que escondem o topo */}
          <div className="glass-panel" style={{ 
            width: '100%', 
            maxWidth: '500px', 
            borderRadius: '24px',
            overflow: 'visible', // Permitir que sombras e labels apareçam
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0 }}>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div className="input-group">
                <label>Nome Completo</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="responsive-grid">
                <div className="input-group">
                  <label>Usuário (@)</label>
                  <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Senha</label>
                  <input type="password" placeholder={editingUser ? 'Manter atual' : '******'} required={!editingUser} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
              
              <div className="input-group">
                <label>Cargo</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="technician">Técnico de Campo</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="responsive-grid">
                <div className="input-group">
                  <label>CPF</label>
                  <input type="text" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Telefone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div className="responsive-grid">
                <div className="input-group">
                  <label>Cidade</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Estado</label>
                  <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '1rem' }}>
                <Save size={20} /> {editingUser ? 'Salvar Alterações' : 'Criar Conta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
