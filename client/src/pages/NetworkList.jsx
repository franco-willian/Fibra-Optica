import React, { useState, useEffect } from 'react';
import { Search, Filter, Info, ChevronRight, Server } from 'lucide-react';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';

export default function NetworkList() {
  const [nodes, setNodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE_URL}/nodes`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setNodes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const filteredNodes = nodes.filter(node => 
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'var(--secondary)';
      case 'maintenance': return 'var(--warning)';
      case 'inactive': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="animate-slide-up" style={{ padding: '1.25rem' }}>
      <h2 style={{ marginBottom: '1.25rem' }}>Equipamentos da Rede</h2>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou tipo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'var(--surface-color)',
              color: 'white'
            }}
          />
        </div>
        <button className="btn-icon">
          <Filter size={20} />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Carregando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredNodes.length > 0 ? filteredNodes.map(node => (
            <div 
              key={node.id} 
              className="glass-panel" 
              style={{ padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '10px', 
                background: 'rgba(59, 130, 246, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <Server size={24} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{node.name}</h4>
                  <div style={{ 
                    fontSize: '0.65rem', 
                    padding: '2px 8px', 
                    borderRadius: '120px', 
                    background: getStatusColor(node.status),
                    color: 'white',
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}>
                    {node.status || 'Ativo'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Tipo: {node.type.toUpperCase()}</span>
                  <span>Portas: {node.used_ports}/{node.capacity}</span>
                </div>
              </div>

              <ChevronRight size={20} color="var(--text-muted)" />
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Nenhum equipamento encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
