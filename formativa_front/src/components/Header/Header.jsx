import styles from './Header.module.css';
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { useTheme } from '../../hooks/useTheme';

import logo from '../../assets/icons/logo.png';
import userDark from '../../assets/icons/user-dark.png';
import userLight from '../../assets/icons/user-light.png';
import themeDark from '../../assets/icons/theme-dark.png';
import themeLight from '../../assets/icons/theme-light.png';

export function Header() {

    const { authTokens, user, logoutUser } = useContext(AuthContext);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const navigate = useNavigate();

    const { theme, changeTheme } = useTheme(); 
    const isDark = theme == 'dark';

    const userIcon = isDark ? userLight : userDark;
    const themeIcon = isDark ? themeLight : themeDark;

    const handleThemeChange = (theme) => {
        changeTheme(theme); 
        // console.log("Tema atual:", theme);
        // console.log(userLight);
        setShowThemeMenu(false);
  };

    const handleUserOptionClick = (option) => {
        if (option === 'Sair') {
        logoutUser();
        navigate('/login');
        } else {
        // Redireciona para as páginas relacionadas ao usuário
        console.log('Redirecionando para a página:', option);
            }
        setShowUserMenu(false);
    }

    console.log(!authTokens
                            ? 'Bem-vindo(a)! O que deseja fazer?'
                            : !user
                            ? 'Carregando usuário...'
                            : `Bem-vindo(a), ${user.username}. O que deseja fazer?`
                        )

    console.log(localStorage)


    return(
        <>
            <header className={styles.header}>
                <div className={styles.navbar}>
                    <div className={styles.logoContainer}>
                        <img src={logo} alt="Logo Escola EDUC" onClick={() => navigate('/')} />
                    </div>
                    <div>
                        <nav className={styles.navbaritens}>
                        <h2 className={styles.welcome}>
                        {!authTokens
                            ? 'Bem-vindo(a)! O que deseja fazer?'
                            : !user
                            ? 'Carregando usuário...'
                            : `Bem-vindo(a), ${user.username}. O que deseja fazer?`}
                        </h2>
                        <ul>
                            {/* Menu de usuário */}
                            <li onClick={() => setShowUserMenu(!showUserMenu)}>
                            <img src={userIcon} alt="Opções do Usuário" />
                            {showUserMenu && (
                                <div className={styles.userMenu}>
                                {authTokens ? (
                                    // Opções para usuários logados
                                    <>
                                    <div onClick={() => handleUserOptionClick('Meu Perfil')}>Meu Perfil</div>
                                    <div onClick={() => handleUserOptionClick('Reservas')}>Reservas</div>
                                    <div onClick={() => handleUserOptionClick('Disciplinas')}>Disciplinas</div>
                                    <div onClick={() => handleUserOptionClick('Sala de Aula')}>Sala de Aula</div>
                                    {user?.isGestor && (
                                        <div onClick={() => handleUserOptionClick('Cadastro Professor')}>Cadastro Professor</div>
                                    )}
                                    <div onClick={() => handleUserOptionClick('Sair')}>Sair</div>
                                    </>
                                ) : (
                                    // Opções para usuários não logados
                                    <>
                                    <div onClick={() => navigate('/')}>Sobre a Escola</div>
                                    <div onClick={() => navigate('/processo-seletivo')}>Processo Seletivo</div>
                                    <div onClick={() => navigate('/missao')}>Missão Escolar</div>
                                    <div onClick={() => navigate('/login')}>Entrar</div>
                                    </>
                                )}
                                </div>
                            )}
                            </li>

                            {/* Menu de tema */}
                            <li onClick={() => setShowThemeMenu(!showThemeMenu)}>
                            <img src={themeIcon} alt="Opções de Tema" />
                            {showThemeMenu && (
                                <div className={styles.themeMenu}>
                                <div onClick={() => handleThemeChange('Claro')}>Tema Claro</div>
                                <div onClick={() => handleThemeChange('Escuro')}>Tema Escuro</div>
                                <div onClick={() => handleThemeChange('Sistema')}>Tema do Sistema</div>
                                </div>
                            )}
                            </li>
                        </ul>
                        </nav>
                    </div>
                </div>
            </header>
        </>
    );
}