import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    
    const [authTokens, setAuthTokens] = useState(() => {
    const tokens = localStorage.getItem('authTokens');
    return tokens ? JSON.parse(tokens) : null;
    });
    const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
    });

    const [isLoading, setIsLoading] = useState(true);

    // console.log(authTokens);
    // console.log(user);

    useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Se não houver tokens, define isLoading como false e retorna
        if (!authTokens) {
          setIsLoading(false);
          return;
        }

        // Verifica se o token de acesso é válido
        if (!authTokens.access || !isTokenValid(authTokens.access)) {
          logoutUser();
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        logoutUser();
      }
    };

    initializeAuth();
  }, []); // Dependência vazia, executa apenas na montagem

    const loginUser = async (username, password) => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/app/auth/', {
      username,
      password,
    });

    const { access, refresh, user: userData } = response.data;
    // Garante que userData seja um objeto
    const userObj = typeof userData === 'string' ? JSON.parse(userData) : userData;
    localStorage.setItem('authTokens', JSON.stringify({ access, refresh }));
    localStorage.setItem('user', JSON.stringify(userObj));
    setAuthTokens({ access, refresh });
    setUser(userObj);
    setIsLoading(false);

    // Depuração: verifique o valor de user após login
    // console.log('user após login:', userObj);
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        localStorage.removeItem('user');
        setIsLoading(false);
    };

    const isTokenValid = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp * 1000 > Date.now();
        } catch (error) {
            return false;
        }
    };
    // console.log(user);
    return (
        <AuthContext.Provider
            value={{
                authTokens,
                user,
                loginUser,
                logoutUser,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;