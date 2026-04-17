import React from 'react';
import { LogOut, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      logout();
      navigate('/login');
    }
  };

  // Pega a inicial do nome ou do username
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.username ? user.username.charAt(0).toUpperCase() : 'U');

  return (
    <header className="glass-panel" style={{
      padding: '0.75rem 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid var(--glass-border)',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/profile" style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--primary), #60a5fa)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: 'white',
          fontSize: '1.2rem',
          boxShadow: '0 4px 10px var(--primary-glow)',
          textDecoration: 'none'
        }}>
          {initial}
        </Link>
        <div>
          <h1 style={{ fontSize: '1.2rem', margin: 0, letterSpacing: '-0.5px' }}>Gestor De Trampa</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
             <User size={10} color="var(--primary)" />
             <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
               Olá, {user?.name?.split(' ')[0] || user?.username}
             </p>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn-icon" style={{ width: '40px', height: '40px' }}>
          <Bell size={20} />
        </button>
        <button 
          className="btn-icon" 
          onClick={handleLogout}
          style={{ width: '40px', height: '40px', color: 'var(--danger)' }}
          title="Sair"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
