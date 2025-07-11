import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './hooks/AuthContext';

import { DefaultLayout } from './pages/DefaultLayout';

import { Homepage } from './pages/public/homepage/Homepage';
import { Login } from './pages/public/login/Login';
import { Profile } from './pages/private/profile/Profile';
import { Process } from './pages/public/process/Process';
import { School } from './pages/public/school/School';
import { Classroom } from './pages/private/classroom/Classroom';
import { Discipline } from './pages/private/discipline/Discipline';
import { Reservation } from './pages/private/reservation/Reservation';
import { TeacherRegistration } from './pages/private/teacherRegistration/TeacherRegistration';

// Definir ProtectedRoute fora de App, para evitar re-renderizações desnecessárias
const ProtectedRoute = ({ children }) => {
  const { authTokens } = useContext(AuthContext);
  if (!authTokens) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  // Efeito para verificar o estado de autenticação ao iniciar o aplicativo
  useEffect(() => { 
    // Verifica se os tokens de autenticação estão presentes e válidos
  }, [useContext(AuthContext).authTokens]);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas com layout padrão (Header + Footer) */}
          <Route element={<DefaultLayout />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/processo-seletivo" element={<Process />} />
            <Route path="/missao" element={<School />} />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/disciplinas"
              element={
                <ProtectedRoute>
                  <Discipline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reservas"
              element={
                <ProtectedRoute>
                  <Reservation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sala-de-aula"
              element={
                <ProtectedRoute>
                  <Classroom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cadastro-professor"
              element={
                <ProtectedRoute>
                  <TeacherRegistration />
                </ProtectedRoute>
              }
            />
          </Route>
          {/* Rota sem layout (ex: login) */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;