import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

/**
 * @typedef {Object} AuthTokens
 * @property {string} access - O token de acesso JWT para autenticação.
 * @property {string} refresh - O token de atualização JWT para renovação.
 */

/**
 * @typedef {Object} User
 * @property {string} username - O nome de usuário do usuário autenticado.
 * @property {string} email - O email do usuário autenticado.
 * @property {string} [first_name] - O primeiro nome do usuário (opcional).
 * @property {string} [last_name] - O sobrenome do usuário (opcional).
 * @property {string} [id] - O ID único do usuário (opcional).
 */

/**
 * Contexto global para gerenciamento de autenticação no aplicativo.
 * Fornece estados e funções para login, logout e validação de tokens.
 * @type {React.Context<{
 *   authTokens: AuthTokens | null,
 *   user: User | null,
 *   loginUser: (username: string, password: string) => Promise<{ success: boolean, tokens?: AuthTokens }>,
 *   logoutUser: () => void,
 *   isLoading: boolean,
 *   loginFailError: string | null
 * }>}
 */
export const AuthContext = createContext();

/**
 * Provedor de contexto para autenticação, gerenciando o estado de autenticação
 * e fornecendo métodos para login, logout e validação de tokens.
 * @param {Object} props - Propriedades do componente.
 * @param {React.ReactNode} props.children - Componentes filhos que utilizarão o contexto.
 * @returns {React.ReactElement} O provedor de contexto com os valores de autenticação.
 */
export const AuthProvider = ({ children }) => {
  /**
   * Estado que armazena os tokens de autenticação (access e refresh).
   * Inicializado a partir do localStorage ou null se não houver tokens.
   * @type {AuthTokens | null}
   */
  const [authTokens, setAuthTokens] = useState(() => {
    const tokens = localStorage.getItem('authTokens');
    return tokens ? JSON.parse(tokens) : null;
  });

  /**
   * Estado que armazena os dados do usuário autenticado.
   * Inicializado a partir do localStorage ou null se não houver usuário.
   * @type {User | null}
   */
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  /**
   * Estado que armazena a mensagem de erro de falha no login, se houver.
   * @type {string | null}
   */
  const [loginFailError, setLoginFailError] = useState(null);

  /**
   * Estado que indica se a autenticação ou inicialização está em progresso.
   * @type {boolean}
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Efeito colateral que inicializa a autenticação ao montar o componente.
   * Verifica se há tokens no estado e valida o token de acesso.
   * Em caso de erro ou token inválido, realiza o logout.
   * @effect
   * @returns {void}
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!authTokens) {
          setIsLoading(false);
          return;
        }

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
  }, [authTokens]); // Dependência em authTokens para reavaliação

  /**
   * Efeito colateral que sincroniza o estado authTokens com o localStorage.
   * Atualiza ou remove os tokens no localStorage com base no estado atual.
   * @effect
   * @returns {void}
   */
  useEffect(() => {
    if (authTokens) {
      localStorage.setItem('authTokens', JSON.stringify(authTokens));
    } else {
      localStorage.removeItem('authTokens');
    }
  }, [authTokens]); // Reage a mudanças em authTokens

  /**
   * Realiza o login do usuário enviando as credenciais ao endpoint de autenticação.
   * Atualiza o estado e o localStorage com os tokens e dados do usuário retornados.
   * @async
   * @param {string} username - O nome de usuário para autenticação.
   * @param {string} password - A senha do usuário para autenticação.
   * @returns {Promise<{ success: boolean, tokens?: AuthTokens }>} Objeto indicando sucesso e tokens, se aplicável.
   * @throws {Error} Erro de rede ou resposta inválida do servidor.
   */
  const loginUser = async (username, password) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/app/auth/', {
        username,
        password,
      });
      // console.log('Resposta do backend:', response.data);
      const { access, refresh, user: userData } = response.data;
      const userObj = typeof userData === 'string' ? JSON.parse(userData) : userData;
      const tokens = { access, refresh };
      localStorage.setItem('authTokens', JSON.stringify(tokens));
      localStorage.setItem('user', JSON.stringify(userObj));
      setAuthTokens(tokens);
      setUser(userObj);
      setLoginFailError(null);
      setIsLoading(false);
      // console.log('authTokens atualizado:', tokens);
      return { success: true, tokens };
    } catch (error) {
      console.error('Erro no login:', error.response?.data || error.message);
      setLoginFailError("Erro ao realizar o login! Verifique login e senha!");
      setIsLoading(false);
      return { success: false };
    }
  };

  /**
   * Realiza o logout do usuário, limpando o estado e o localStorage.
   * @returns {void}
   */
  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    localStorage.removeItem('user');
    setIsLoading(false);
  };

  /**
   * Valida se um token JWT ainda é válido com base na data de expiração.
   * @param {string} token - O token JWT a ser validado.
   * @returns {boolean} Verdadeiro se o token é válido, falso caso contrário.
   * @throws {Error} Erro ao decodificar o token.
   */
  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authTokens,
        user,
        loginUser,
        logoutUser,
        isLoading,
        loginFailError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;