import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    const storedTokens = localStorage.getItem('authTokens');
    return storedTokens ? JSON.parse(storedTokens) : null;
  });
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const loginUser = async (username, password) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/app/auth/', {
        username,
        password,
      });

      const { access, refresh, user } = response.data;
      // Armazena tokens e usuário no localStorage
      localStorage.setItem('authTokens', JSON.stringify({ access, refresh }));
      localStorage.setItem('user', JSON.stringify(user));
      // Atualiza estados
      setAuthTokens({ access, refresh });
      setUser(user);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error; // Permite que o componente chamador lide com o erro
    }
  };

  const fetchUser = async (token) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/app/usuarios/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = response.data;
      // Armazena o usuário no localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      // Opcional: Limpar tokens se a busca falhar
      logoutUser();
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    // Verifica se há tokens no localStorage ao montar o componente
    const initializeAuth = async () => {
      const storedTokens = localStorage.getItem('authTokens');
      if (storedTokens) {
        const parsedTokens = JSON.parse(storedTokens);
        setAuthTokens(parsedTokens);
        if (parsedTokens.access && isTokenValid(parsedTokens.access)) {
          await fetchUser(parsedTokens.access);
        } else {
          logoutUser();
        }
      }
    };
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authTokens,
        user,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;