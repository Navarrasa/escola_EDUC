import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    return localStorage.getItem('authTokens')
      ? JSON.parse(localStorage.getItem('authTokens'))
      : null;
  });
  const [user, setUser] = useState(null);

const loginUser = async (username, password) => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/app/auth/', {
      username: username,
      password: password
    });

    const { access, refresh, user } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthTokens({ access, refresh });
    localStorage.setItem('authTokens', JSON.stringify({ access, refresh }));
    await fetchUser(access);
  } catch (error) {
    console.error('Erro ao fazer login:', error);
  }
};

  const fetchUser = async (token) => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/app/usuarios/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              name,
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
