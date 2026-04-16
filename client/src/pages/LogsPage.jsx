import React, { useState, useEffect } from 'react';
import { Activity, Clock, User, ClipboardList } from 'lucide-react';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE_URL}/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="animate-slide-up" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Activity size={24} color="var(--primary)" />
        <h2 style={{ fontSize: '1.5rem' }}>Histórico de Alterações</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Carregando histórico...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {logs.length > 0 ? logs.map((log) => (
            <div 
              key={log.id} 
              className="glass-panel" 
              style={{ padding: '1.25rem', borderRadius: '16px', borderLeft: '4px solid var(--primary)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <Clock size={14} />
                  <span>{formatDate(log.created_at)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                  <User size={14} />
                  <span>{log.username || 'Sistema'}</span>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <ClipboardList size={16} color="var(--text-main)" />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{log.node_name || 'Equipamento Removido'}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  {log.action_description}
                </p>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface-color)', borderRadius: '16px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Nenhum registro encontrado ainda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
