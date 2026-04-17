import React, { useState, useEffect } from 'react';
import { User, Phone, Lock, Save, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';

export default function ProfilePage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    phone: user?.phone || '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        // Opcional: Atualizar o AuthContext se necessário 
        // mas o /auth/me cuidará disso no reload ou podemos forçar
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar perfil' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up" style={{ padding: '1.5rem', paddingTop: '5rem', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} className="btn-icon" style={{ width: '40px', height: '40px' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Meu Perfil</h2>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ 
                width: '80px', height: '80px', borderRadius: '24px', 
                background: 'linear-gradient(135deg, var(--primary), #60a5fa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem', fontWeight: 'bold', color: 'white',
                margin: '0 auto 1rem auto',
                boxShadow: '0 8px 20px var(--primary-glow)'
            }}>
                {formData.name.charAt(0).toUpperCase() || formData.username.charAt(0).toUpperCase()}
            </div>
            <h3 style={{ margin: 0 }}>{formData.name || formData.username}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {user?.role === 'admin' ? 'Administrador' : 'Técnico de Campo'}
            </p>
        </div>

        {message.text && (
            <div style={{ 
                padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem',
                background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: message.type === 'success' ? 'var(--secondary)' : 'var(--danger)',
                border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
                {message.text}
            </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nome Completo</label>
            <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                    style={{ paddingLeft: '2.5rem' }} type="text" required value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>
          </div>

          <div className="input-group">
            <label>Usuário (@)</label>
            <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>

          <div className="input-group">
            <label>Telefone / WhatsApp</label>
            <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                    style={{ paddingLeft: '2.5rem' }} type="text" value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                />
            </div>
          </div>

          <div className="input-group" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <label>Nova Senha (deixe em branco para manter)</label>
            <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                    style={{ paddingLeft: '2.5rem' }} type="password" placeholder="******"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}>
            {loading ? 'Sincronizando...' : <><Save size={20} /> Atualizar Perfil</>}
          </button>
        </form>
      </div>

      <button 
        onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
        style={{ width: '100%', color: 'var(--danger)', fontSize: '0.9rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }}
      >
        Encerrar Sessão
      </button>
    </div>
  );
}
