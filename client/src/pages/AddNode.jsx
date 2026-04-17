import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import NodeForm from '../components/NodeForm';

export default function AddNode() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/cities`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(err => console.error('Erro ao carregar cidades:', err));
  }, [token]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/nodes`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao salvar equipamento');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      <NodeForm 
        title="Novo Equipamento"
        token={token}
        cities={cities}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
