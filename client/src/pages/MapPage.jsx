import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed, Activity, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';

// Custom icons setup
const createCustomIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #0f172a; box-shadow: 0 0 15px ${color}80;"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const icons = {
  cto: createCustomIcon('#3b82f6'),
  ceo: createCustomIcon('#f59e0b'),
  dio: createCustomIcon('#10b981'),
  splitter: createCustomIcon('#9333ea')
};

export default function MapPage() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuth();
  
  // State for quick log modal/form
  const [activeLogNode, setActiveLogNode] = useState(null);
  const [logDescription, setLogDescription] = useState('Alteração Realizada');

  // Center of default city
  const defaultPosition = [-23.55052, -46.633308]; // São Paulo

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

  const handleQuickLog = async (nodeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/logs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          node_id: nodeId,
          action_description: logDescription
        })
      });

      if (response.ok) {
        alert('Mudança registrada com sucesso!');
        setActiveLogNode(null);
        setLogDescription('Alteração Realizada');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao registrar mudança');
    }
  };

  return (
    <div className="map-container animate-slide-up">
      <MapContainer 
        center={defaultPosition} 
        zoom={14} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {nodes.map(node => (
          <Marker 
            key={node.id} 
            position={[parseFloat(node.latitude), parseFloat(node.longitude)]}
            icon={icons[node.type] || icons.cto}
          >
            <Popup className="custom-popup">
              <div style={{ padding: '0.5rem', width: '200px' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '1rem' }}>{node.name}</h3>
                <span style={{ 
                    fontSize: '0.6rem', 
                    padding: '2px 8px', 
                    background: '#e2e8f0', 
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                    display: 'inline-block'
                }}>
                    {node.type.toUpperCase()}
                </span>
                
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    Ocupação: <strong>{node.used_ports}/{node.capacity}</strong>
                </div>

                <button 
                  onClick={() => setActiveLogNode(node)}
                  style={{
                    width: '100%',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Registrar Mudança
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <ZoomControl position="topright" />
      </MapContainer>

      {/* Floating Action Buttons over Map */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <button className="btn-icon glass-panel" style={{ width: '44px', height: '44px', color: 'var(--primary)' }}>
          <LocateFixed size={22} />
        </button>
        <button className="btn-icon glass-panel" onClick={() => navigate('/add')} style={{ width: '44px', height: '44px' }}>
          <Plus size={22} />
        </button>
      </div>

      {/* Quick Log Modal Overlay */}
      {activeLogNode && (
        <div className="animate-slide-up" style={{
           position: 'absolute',
           bottom: '20px',
           left: '20px',
           right: '20px',
           zIndex: 1000,
           padding: '1.5rem',
           borderRadius: '20px',
           background: 'var(--surface-color)',
           boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
           border: '1px solid var(--border-color)'
        }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="var(--primary)" /> Mudança em {activeLogNode.name}
              </h4>
              <button onClick={() => setActiveLogNode(null)} style={{ color: 'var(--text-muted)' }}>Fechar</button>
           </div>
           
           <textarea 
             autoFocus
             value={logDescription}
             onChange={e => setLogDescription(e.target.value)}
             placeholder="Descreva o que foi alterado..."
             style={{
               width: '100%',
               height: '80px',
               background: 'var(--bg-color)',
               border: '1px solid var(--border-color)',
               borderRadius: '12px',
               color: 'white',
               padding: '0.75rem',
               marginBottom: '1rem'
             }}
           />

           <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => handleQuickLog(activeLogNode.id)}
                className="btn-primary" 
                style={{ flex: 1 }}
              >
                Salvar Histórico
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
