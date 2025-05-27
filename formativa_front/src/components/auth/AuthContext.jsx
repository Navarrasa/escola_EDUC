import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    const [user, setUser] = useState(() =>
        localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
    );
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedTokens = localStorage.getItem('authTokens');
            // console.log(storedTokens);
            if (storedTokens) {
                const parsedTokens = JSON.parse(storedTokens);
                setAuthTokens(parsedTokens);  
                if (!parsedTokens.access || isTokenValid(!parsedTokens.access)) {
                    logoutUser();
                }
            } else {
                setIsLoading(false);
            }
        };
        initializeAuth();
    }, []);

    const loginUser = async (username, password) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/app/auth/', {
                username,
                password,
            });

            const { access, refresh, user } = response.data;
            localStorage.setItem('authTokens', JSON.stringify({ access, refresh }));
            localStorage.setItem('user', JSON.stringify(user));
            setAuthTokens({ access, refresh });
            setUser(user);
            setIsLoading(false);
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
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
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