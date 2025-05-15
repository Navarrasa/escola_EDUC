import styles from './Login.module.css';
import logo from '../../assets/logo/logo.png';
import arrowleft from '../../assets/media/arrowleft.png';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {

    const handleLogin = () => {
        // Simula login
        localStorage.setItem('auth', 'true');
        
        navigate('/homepage');
      };

    return (
        <div className={styles.login}>
        <div className={styles.arrowleft}>
            <img src={arrowleft} alt="Left Arrow" />
        </div>
        <div className={styles.loginContainer}>
            <div className={styles.loginContent}>
                <div>
                    <img src={logo} alt="Logo da Escola" />
                </div>
                <div>
                    <h1>Bem vindo! Faça o seu login</h1>
                </div>
                <form className={styles.FormGroup}>
                    <input type="text" id="email" name="email" required  placeholder='email...'/>
                    <input type="password" id="password" name="password" required placeholder='senha...'/>
                    <button type="submit" onClick={handleLogin}>Entrar</button>
                </form>
                </div>
            </div>
        </div>
    );
}