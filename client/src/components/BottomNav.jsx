import React from 'react';
import { NavLink } from 'react-router-dom';
import { Map, List, PlusCircle, Activity, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="glass-panel" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '70px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0 1rem',
      borderTop: '1px solid var(--glass-border)',
      zIndex: 100,
      backdropFilter: 'blur(20px)'
    }}>
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Map size={24} />
        <span>Mapa</span>
      </NavLink>

      <NavLink to="/list" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <List size={24} />
        <span>Rede</span>
      </NavLink>

      <NavLink to="/add" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <div style={{
          background: 'var(--primary)',
          color: 'white',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 15px var(--primary-glow)',
          border: '4px solid var(--bg-color)'
        }}>
          <PlusCircle size={32} />
        </div>
      </NavLink>

      <NavLink to="/logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Activity size={24} />
        <span>Logs</span>
      </NavLink>

      {isAdmin && (
        <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={24} />
          <span>Contas</span>
        </NavLink>
      )}
    </nav>
  );
}
