import styles from './Login.module.css';
import logo from '../../../assets/icons/logo.png';
import arrowleft from '../../../assets/icons/arrowleft-dark.png';
import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../components/auth/AuthContext';

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser } = useContext(AuthContext);

  useEffect(() => {
    const previousTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'light');

    // Ao desmontar, restaura o tema anterior
    return () => {
      if (previousTheme) {
        document.documentElement.setAttribute('data-theme', previousTheme);
      }
    };
  }, []);

  // Verifica se o usuário já está logado
  useEffect(() => {
    const authTokens = localStorage.getItem('authTokens');
    if (authTokens) {
      navigate('/home');
    }
  }, [navigate]);

  // Função para lidar com o envio do formulário de login
  const handleLogin = async (e) => {
  e.preventDefault();
  await loginUser(email, password);
  };

  return (
    <div className={styles.login}>
      <div className={styles.arrowleft}>
        <img src={arrowleft} alt="Left Arrow" onClick={() => navigate('/')}/>
      </div>
      <div className={styles.loginContainer}>
        <div className={styles.loginContent}>
          <div className={styles.logo}>
            <img src={logo} alt="Logo da Escola" />
          </div>
          <div>
            <h1>Bem vindo! Faça o seu login</h1>
          </div>
          <form className={styles.FormGroup} onSubmit={handleLogin}>
            <input
              type="text"
              id="email"
              name="email"
              required
              placeholder="email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Entrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
