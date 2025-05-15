import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    return localStorage.getItem('authTokens')
      ? JSON.parse(localStorage.getItem('authTokens'))
      : null;
  });
  const [user, setUser] = useState(null);

  const loginUser = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        username,
        password,
      });
      setAuthTokens(response.data);
      localStorage.setItem('authTokens', JSON.stringify(response.data));
      fetchUser(response.data.access);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  const fetchUser = async (accessToken) => {
    try {
      const response = await axios.get('http://localhost:8000/api/user/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
  };

  useEffect(() => {
    if (authTokens) {
      fetchUser(authTokens.access);
    }
  }, [authTokens]);

  return (
    <AuthContext.Provider
      value={{
        user,
        authTokens,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
