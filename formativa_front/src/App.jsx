import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext'; // Aqui, AuthProvider é nomeado
import { Header } from './components/Header/Header';
import { Homepage } from './pages/homepage/Homepage';
import { Login } from './pages/login/Login';
import { Profile } from './pages/profile/Profile';
import { Process } from './pages/process/Process'; // Exemplo de página
import { School } from './pages/school/School'; // Exemplo de página

import AuthContext from './components/auth/AuthContext'; // Aqui, AuthContext é a importação padrão

function App() {
  const { authTokens } = useContext(AuthContext);

  // Função para proteger rotas que exigem autenticação
  const ProtectedRoute = ({ children }) => {
    if (!authTokens) {
      return <Navigate to="/login" />;  // Redireciona para login se não estiver autenticado
    }
    return children;
  };

  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          {/* Rota pública - Home para usuários não logados */}
          <Route path="/" element={<Homepage />} />

          {/* Rota para login - onde o usuário pode fazer login */}
          <Route path="/login" element={<Login />} />

          {/* Rota protegida - só acessível por usuários logados */}
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Outras rotas públicas */}
          <Route path="/processo-seletivo" element={<Process />} />
          <Route path="/missao" element={<School />} />
          
          {/* Você pode adicionar outras rotas públicas ou protegidas aqui */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
