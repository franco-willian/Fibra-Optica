import React, { useState, useEffect } from 'react';
import { Save, X, MapPin, Database, Hash, FileText, Camera, CheckCircle, Trash2 } from 'lucide-react';
import API_BASE_URL from '../config';

export default function NodeForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  loading, 
  token, 
  cities,
  title = "Equipamento"
}) {
  const [formData, setFormData] = useState({
    type: initialData.type || 'cto',
    name: initialData.name || '',
    latitude: initialData.latitude || '',
    longitude: initialData.longitude || '',
    capacity: initialData.capacity || '',
    city_id: initialData.city_id || (cities.length > 0 ? cities[0].id : ''),
    observation: initialData.observation || '',
    status: initialData.status || 'active',
  });

  const [photos, setPhotos] = useState([]); // Array de arquivos (File)
  const [previews, setPreviews] = useState(initialData.photos || []); // Array de URLs (string)
  const [locating, setLocating] = useState(false);

  // Se as cidades carregarem depois, garante que city_id esteja preenchido
  useEffect(() => {
    if (cities.length > 0 && !formData.city_id) {
      setFormData(prev => ({ ...prev, city_id: cities[0].id }));
    }
  }, [cities]);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (previews.length + files.length > 5) {
      alert("Limite de 5 fotos atingido.");
      return;
    }

    // Adiciona os novos arquivos à lista de upload
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    // Gera previews para os novos arquivos
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    
    // Se era uma foto nova (estava no array 'photos'), remove de lá também
    // Note: Fotos iniciais da edição vêm em 'initialData.photos' e não estão no array 'photos'
    // Como o backend substitui tudo, remover do preview é o suficiente para o usuário sentir que removeu.
    // No submit, enviamos apenas o que estiver em 'photos' (novas). 
    // Se o usuário removeu uma foto antiga na edição mas não subiu nenhuma nova, 
    // o submit precisa lidar com isso. Mas o pedido do usuário foi: "novas fotos devem substituir as que já estavam lá".
    
    // Ajuste: se o usuário remove QUALQUER foto, assumimos que ele quer mudar o set de fotos.
    setPreviews(newPreviews);
    
    // Se a foto removida era uma "nova":
    const photoIdxInNew = index - (previews.length - photos.length);
    if (photoIdxInNew >= 0) {
        const newPhotosList = [...photos];
        newPhotosList.splice(photoIdxInNew, 1);
        setPhotos(newPhotosList);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setFormData(prev => ({ ...prev, latitude: lat.toFixed(8), longitude: lon.toFixed(8) }));
        
        // Reverse Geocoding
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
          const data = await res.json();
          if (data && data.address) {
            const cityName = data.address.city || data.address.town || data.address.village || data.address.municipality;
            if (cityName) {
              const matched = cities.find(c => 
                c.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === 
                cityName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
              );
              if (matched) setFormData(prev => ({ ...prev, city_id: matched.id }));
            }
          }
        } finally {
          setLocating(false);
        }
      }, () => {
        alert("Erro ao obter localização");
        setLocating(false);
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (previews.length === 0) {
      alert("Pelo menos uma foto é obrigatória!");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    photos.forEach(file => data.append('photos', file));
    
    onSubmit(data);
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ width: '100%', borderRadius: '24px', overflow: 'hidden' }}>
      {/* Header unificado dentro do painel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{title}</h2>
        <button onClick={onCancel} className="btn-icon" style={{ width: '38px', height: '38px' }}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
        <div className="input-group">
          <label>Tipo de Equipamento</label>
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
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
              style={{ paddingLeft: '2.5rem' }} type="text" required value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </div>

        <div className="responsive-grid">
          <div className="input-group">
            <label>Capacidade (Portas)</label>
            <div style={{ position: 'relative' }}>
               <Hash size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
               <input style={{ paddingLeft: '2.5rem' }} type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
            </div>
          </div>
          <div className="input-group">
            <label>Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="active">Ativo</option>
              <option value="maintenance">Manutenção</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label>Observação</label>
          <textarea 
            style={{ minHeight: '60px' }}
            value={formData.observation} onChange={e => setFormData({...formData, observation: e.target.value})} 
          />
        </div>

        <div className="input-group">
          <label>Fotos do Local (Mín. 1, Máx. 5)</label>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            * Novas fotos substituirão as anteriores.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px', marginBottom: '12px' }}>
            {previews.map((src, idx) => (
              <div key={idx} style={{ position: 'relative', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={src} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  onClick={() => removePhoto(idx)}
                  style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', borderRadius: '4px', padding: '2px' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <div style={{ 
                height: '70px', border: '2px dashed var(--border-color)', borderRadius: '8px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer'
              }}>
                <Camera size={22} color="var(--text-muted)" />
                <input 
                  type="file" multiple accept="image/*" capture="environment" onChange={handlePhotoChange}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="responsive-grid">
          <div className="input-group">
            <label>Latitude</label>
            <input type="number" step="any" required value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Longitude</label>
            <input type="number" step="any" required value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} />
          </div>
        </div>

        <button 
          type="button" onClick={handleGetCurrentLocation} disabled={locating}
          style={{ 
            width: '100%', marginBottom: '1.25rem', padding: '0.5rem', borderRadius: '8px',
            background: 'var(--surface-color)', color: locating ? 'var(--text-muted)' : 'var(--primary)',
            border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem'
          }}
        >
          <MapPin size={14} /> {locating ? 'Detectando...' : 'Obter Local Localização (GPS)'}
        </button>

        <div className="input-group">
          <label>Cidade</label>
          <select value={formData.city_id} onChange={e => setFormData({...formData, city_id: e.target.value})}>
            {cities.map(city => <option key={city.id} value={city.id}>{city.name} - {city.state}</option>)}
          </select>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
          {loading ? 'Sincronizando...' : <><Save size={20} /> Salvar Equipamento</>}
        </button>
      </form>
    </div>
  );
}
