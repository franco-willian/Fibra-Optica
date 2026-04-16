import React from 'react';
import { LogOut, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="glass-panel" style={{
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid var(--glass-border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--primary), #60a5fa)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: 'white',
          boxShadow: '0 4px 10px var(--primary-glow)'
        }}>
          F
        </div>
        <div>
          <h1 style={{ fontSize: '1.2rem', margin: 0, letterSpacing: '-0.5px' }}>Fibra Gestor</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
             <User size={10} color="var(--primary)" />
             <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
               Olá, {user?.username}
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
          onClick={logout}
          style={{ width: '40px', height: '40px', color: 'var(--danger)' }}
          title="Sair"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
