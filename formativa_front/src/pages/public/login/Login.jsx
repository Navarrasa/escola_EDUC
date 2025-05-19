import styles from './Login.module.css';
import logo from '../../../assets/icons/logo.png';
import arrowleft from '../../../assets/icons/arrowleft-dark.png';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();

  // 🔒 Força o tema claro ao montar o componente
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

  const handleLogin = (e) => {
    e.preventDefault(); // impede reload
    localStorage.setItem('auth', 'true');
    navigate('/perfil');
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
            <input type="text" id="email" name="email" required placeholder="email..." />
            <input type="password" id="password" name="password" required placeholder="senha..." />
            <button type="submit">Entrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
