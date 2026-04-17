import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MapPage from './pages/MapPage';
import NetworkList from './pages/NetworkList';
import AddNode from './pages/AddNode';
import LogsPage from './pages/LogsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: '#0f172a',
        color: 'white'
      }}>
        Carregando...
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Header />
      
      <main style={{ flex: 1, position: 'relative' }}>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/list" element={<NetworkList />} />
          <Route path="/add" element={<AddNode />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route 
            path="/users" 
            element={user?.role === 'admin' ? <UsersPage /> : <Navigate to="/" replace />} 
          />
          {/* Redirecionar /login para a home se já estiver logado */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
}

export default App;
