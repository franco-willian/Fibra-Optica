import React, { useState, useEffect } from 'react';
import { Search, Edit3, Server, ChevronRight } from 'lucide-react';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import NodeForm from '../components/NodeForm';
import NodeDetails from '../components/NodeDetails';

export default function NetworkList() {
  const [nodes, setNodes] = useState([]);
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingNode, setEditingNode] = useState(null);
  const [viewingNode, setViewingNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchData();
    fetchCities();
  }, [token]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/nodes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNodes(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/cities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCities(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (e, node) => {
    e.stopPropagation();
    setEditingNode(node);
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (formData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/nodes/${editingNode.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Erro ao atualizar');
      }
    } catch (err) {
      alert('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const filteredNodes = nodes.filter(node => 
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'var(--secondary)';
      case 'maintenance': return 'var(--warning)';
      case 'inactive': return 'var(--danger)';
      default: return 'var(--secondary)';
    }
  };

  return (
    <>
      <div className="animate-slide-up" style={{ padding: '1rem', paddingTop: '5rem', paddingBottom: '100px' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Equipamentos</h2>

        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar equipamento..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '12px',
              border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'white',
              fontSize: '0.9rem'
            }}
          />
        </div>

        {loading && nodes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Sincronizando...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredNodes.length > 0 ? filteredNodes.map(node => (
              <div 
                key={node.id} 
                className="glass-panel" 
                onClick={() => setViewingNode(node)}
                style={{ padding: '0.85rem 1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
              >
                <div style={{ 
                  width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
                  flexShrink: 0
                }}>
                  <Server size={22} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {node.name}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={(e) => handleOpenEdit(e, node)} className="btn-icon" style={{ width: '32px', height: '32px' }}>
                        <Edit3 size={16} />
                      </button>
                      <ChevronRight size={18} color="var(--text-muted)" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <span style={{ textTransform: 'uppercase' }}>{node.type}</span>
                    <span style={{ color: getStatusColor(node.status) }}>● {node.status === 'maintenance' ? 'Manutenção' : (node.status === 'inactive' ? 'Inativo' : 'Ativo')}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhum item encontrado na rede.</div>
            )}
          </div>
        )}
      </div>

      {/* MODAIS FORA DA DIV ANIMADA PARA GARANTIR POSIÇÃO FIXA EM TELA CHEIA */}
      {(isModalOpen || viewingNode) && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, // Garante que cobre tudo (top, left, right, bottom: 0)
          background: 'rgba(0,0,0,0.85)', 
          zIndex: 9999, // Z-index muito alto
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'flex-start',
          padding: '5rem 1rem',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch' // Suaviza scroll em iOS
        }}>
          
          <div style={{ width: '100%', maxWidth: '500px', pointerEvents: 'auto' }}>
            {isModalOpen && (
              <NodeForm 
                title="Editar Equipamento"
                initialData={editingNode}
                onSubmit={handleEditSubmit}
                onCancel={() => setIsModalOpen(false)}
                loading={loading}
                token={token}
                cities={cities}
              />
            )}

            {viewingNode && !isModalOpen && (
              <NodeDetails 
                node={viewingNode} 
                onCancel={() => setViewingNode(null)} 
              />
            )}
          </div>

        </div>
      )}
    </>
  );
}
