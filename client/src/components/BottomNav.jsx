import React from 'react';
import { Map, List, PlusCircle, Activity } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Map, label: 'Mapa' },
    { path: '/list', icon: List, label: 'Rede' },
    { path: '/add', icon: PlusCircle, label: 'Adicionar', primary: true },
    { path: '/logs', icon: Activity, label: 'Logs' }
  ];

  return (
    <nav className="glass-panel" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0.75rem 0.5rem',
      paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
      zIndex: 100,
      borderTop: '1px solid var(--glass-border)',
      borderBottom: 'none',
      borderLeft: 'none',
      borderRight: 'none',
    }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        if (item.primary) {
          return (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: 'linear-gradient(135deg, var(--primary), #60a5fa)',
                color: 'white',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateY(-15px)',
                boxShadow: '0 8px 24px var(--primary-glow)',
                border: '4px solid var(--bg-color)',
                transition: 'transform 0.2s'
              }}
            >
              <Icon size={24} />
            </button>
          )
        }

        return (
          <button 
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'color 0.2s',
              minWidth: '64px'
            }}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 600 : 400 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
