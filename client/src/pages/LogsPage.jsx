import React, { useState, useEffect } from 'react';
import { Activity, Clock, User, ClipboardList, MapPin, Globe } from 'lucide-react';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCity, setUserCity] = useState(null);
  const [filterByCity, setFilterByCity] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchLogs();
    detectUserCity();
  }, [token]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const detectUserCity = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          const data = await res.json();
          if (data && data.address) {
            const cityName = data.address.city || data.address.town || data.address.village || data.address.municipality;
            setUserCity(cityName);
            console.log("Localização atual para logs:", cityName);
          }
        } catch (err) {
          console.error("Erro ao detectar cidade para logs:", err);
        }
      });
    }
  };

  const filteredLogs = (filterByCity && userCity) 
    ? logs.filter(log => 
        log.city_name && 
        log.city_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === 
        userCity.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      )
    : logs;

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="animate-slide-up" style={{ padding: '1.25rem', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity size={24} color="var(--primary)" />
          <h2 style={{ fontSize: '1.5rem' }}>Histórico</h2>
        </div>
        
        {userCity && (
          <button 
            onClick={() => setFilterByCity(!filterByCity)}
            className="glass-panel"
            style={{ 
              padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', 
              display: 'flex', alignItems: 'center', gap: '6px',
              border: filterByCity ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              color: filterByCity ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            {filterByCity ? <MapPin size={14} /> : <Globe size={14} />}
            {filterByCity ? `Apenas ${userCity}` : 'Todos os Logs'}
          </button>
        )}
      </div>

      {!userCity && !loading && (
        <div style={{ 
          margin: '0 0 1.5rem 0', padding: '0.75rem', borderRadius: '12px', 
          background: 'rgba(59, 130, 246, 0.05)', fontSize: '0.8rem', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <MapPin size={16} /> Detectando sua cidade para filtrar o histórico...
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Carregando histórico...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredLogs.length > 0 ? filteredLogs.map((log) => (
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
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{log.node_name || 'Equipamento'}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '1.5rem' }}>
                  {log.action_description}
                </p>
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> {log.city_name || 'Geral'}
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface-color)', borderRadius: '16px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Nenhum registro encontrado {filterByCity ? `em ${userCity}` : ''}.</p>
              {filterByCity && (
                <button 
                    onClick={() => setFilterByCity(false)}
                    style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '0.5rem', textDecoration: 'underline' }}
                >
                    Ver logs de todas as cidades
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
