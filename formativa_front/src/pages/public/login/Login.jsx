import styles from './Login.module.css';
import logo from '../../../assets/icons/logo.png';
import arrowleft from '../../../assets/icons/arrowleft-dark.png';
import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../hooks/AuthContext';

export function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser, authTokens, loginFailError } = useContext(AuthContext);

  useEffect(() => {
    const previousTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'light');
    
    if (authTokens) {
      navigate('/');
    }

    return () => {
      if (previousTheme) {
        document.documentElement.setAttribute('data-theme', previousTheme);
      }
    };
  }, [authTokens, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await loginUser(username, password);
    setIsLoading(false);

    if (success) {
      navigate('/perfil');
    }
}

  return (
    <div className={styles.login}>
      <div className={styles.arrowleft}>
        <img src={arrowleft} alt="Voltar" onClick={() => navigate('/')} />
      </div>
      <div className={styles.loginContainer}>
        <div className={styles.loginContent}>
          <div className={styles.logo}>
            <img src={logo} alt="Logo da Escola" />
          </div>
          <div>
            <h1>Bem-vindo! Faça o seu login</h1>
            {loginFailError && <div className={styles.error}>{loginFailError}</div>}
          </div>
          <form className={styles.FormGroup} onSubmit={handleLogin}>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              required
              placeholder="nome..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
