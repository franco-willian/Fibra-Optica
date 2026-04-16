import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, MapPin, Database, Hash } from 'lucide-react';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';

export default function AddNode() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'cto',
    name: '',
    latitude: '',
    longitude: '',
    capacity: 16,
    city_id: ''
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/cities`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCities(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, city_id: data[0].id }));
        }
      })
      .catch(err => console.error('Erro ao carregar cidades:', err));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/nodes`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            ...formData,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            capacity: parseInt(formData.capacity)
        })
      });

      if (response.ok) {
        navigate('/');
      } else {
        alert('Erro ao salvar equipamento');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(8),
          longitude: position.coords.longitude.toFixed(8)
        }));
      });
    } else {
      alert("Geolocalização não é suportada por este navegador.");
    }
  };

  return (
    <div className="animate-slide-up" style={{ padding: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Novo Equipamento</h2>
        <button onClick={() => navigate(-1)} className="btn-icon">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div className="input-group">
          <label>Tipo de Equipamento</label>
          <select 
            value={formData.type} 
            onChange={e => setFormData({...formData, type: e.target.value})}
          >
            <option value="cto">CTO (Atendimento)</option>
            <option value="ceo">CEO (Emenda)</option>
            <option value="dio">DIO (Distribuição)</option>
            <option value="splitter">Splitter</option>
          </select>
        </div>

        <div className="input-group">
          <label>Nome / Identificação</label>
          <div style={{ position: 'relative' }}>
            <Database size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              style={{ paddingLeft: '2.5rem' }}
              type="text" 
              placeholder="Ex: CTO-04 Centro" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label>Latitude</label>
            <input 
              type="number" 
              step="any" 
              required 
              value={formData.latitude}
              onChange={e => setFormData({...formData, latitude: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Longitude</label>
            <input 
              type="number" 
              step="any" 
              required 
              value={formData.longitude}
              onChange={e => setFormData({...formData, longitude: e.target.value})}
            />
          </div>
        </div>

        <button 
          type="button" 
          onClick={handleGetCurrentLocation}
          style={{ 
            width: '100%', 
            marginBottom: '1.5rem', 
            padding: '0.5rem', 
            borderRadius: '8px',
            background: 'var(--surface-color)',
            color: 'var(--primary)',
            border: '1px dashed var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}
        >
          <MapPin size={16} /> Usar Localização Atual
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label>Capacidade (Portas)</label>
            <div style={{ position: 'relative' }}>
               <Hash size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
               <input 
                 style={{ paddingLeft: '2.5rem' }}
                 type="number" 
                 required 
                 value={formData.capacity}
                 onChange={e => setFormData({...formData, capacity: e.target.value})}
               />
            </div>
          </div>
          <div className="input-group">
            <label>Cidade</label>
            <select 
              value={formData.city_id} 
              onChange={e => setFormData({...formData, city_id: e.target.value})}
            >
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name} - {city.state}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={loading}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {loading ? 'Salvando...' : <><Save size={20} /> Salvar Equipamento</>}
        </button>
      </form>
    </div>
  );
}
