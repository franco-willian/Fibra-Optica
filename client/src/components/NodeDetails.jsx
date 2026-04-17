import React, { useState } from 'react';
import { X, MapPin, Database, Hash, FileText, Server, Calendar } from 'lucide-react';

export default function NodeDetails({ node, onCancel }) {
  const [activePhoto, setActivePhoto] = useState(0);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ 
      width: '100%', maxWidth: '500px', padding: '1.5rem', borderRadius: '24px',
      maxHeight: '90vh', overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem' }}>Detalhes do Local</h3>
        <button onClick={onCancel} className="btn-icon">
          <X size={20} />
        </button>
      </div>

      {/* Carrossel de Fotos */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
        <div style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        onScroll={(e) => {
            const index = Math.round(e.target.scrollLeft / e.target.clientWidth);
            setActivePhoto(index);
        }}
        >
          {node.photos && node.photos.length > 0 ? node.photos.map((url, idx) => (
            <div key={idx} style={{ 
              minWidth: '100%', 
              scrollSnapAlign: 'start',
              aspectRatio: '4/3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img src={url} alt={`Foto ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )) : (
            <div style={{ width: '100%', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Sem fotos cadastradas
            </div>
          )}
        </div>
        
        {/* Indicadores do Carrossel */}
        {node.photos && node.photos.length > 1 && (
          <div style={{ 
            position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '6px'
          }}>
            {node.photos.map((_, idx) => (
              <div key={idx} style={{ 
                width: '6px', height: '6px', borderRadius: '50%', 
                background: activePhoto === idx ? 'var(--primary)' : 'rgba(255,255,255,0.5)' 
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Informações */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ 
                width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0
            }}>
                <Server size={20} />
            </div>
            <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Nome / Identificação</p>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{node.name}</h4>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', marginTop: '4px', display: 'inline-block' }}>
                    {node.type.toUpperCase()}
                </span>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '4px' }}>
                    <Hash size={14} /> CAPACIDADE
                </div>
                <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{node.capacity || 'N/A'} Portas</p>
            </div>
            <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '4px' }}>
                    <Database size={14} /> STATUS
                </div>
                <p style={{ fontSize: '0.9rem', fontWeight: '500', color: node.status === 'active' ? 'var(--secondary)' : 'var(--warning)' }}>
                    {node.status === 'active' ? 'Ativo' : (node.status === 'maintenance' ? 'Manutenção' : 'Inativo')}
                </p>
            </div>
        </div>

        <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '4px' }}>
                <FileText size={14} /> OBSERVAÇÕES
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--text-main)' }}>
                {node.observation || 'Sem observações técnicas registradas.'}
            </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <MapPin size={16} color="var(--primary)" />
                <span>{node.city_name || 'Cidade não vinculada'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <Calendar size={16} color="var(--primary)" />
                <span>Cadastrado em {formatDate(node.created_at)}</span>
            </div>
        </div>
      </div>

      <button 
        onClick={onCancel}
        className="btn-primary" 
        style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}
      >
        Fechar Detalhes
      </button>
    </div>
  );
}
