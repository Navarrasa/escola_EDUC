import styles from './Header.module.css';
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../hooks/AuthContext';
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
    // console.log(user[0]?.username);
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
        } else if (option === 'Meu Perfil') {
        // Redireciona para a página de perfil do usuário
        navigate('/perfil');
        }
        else if (option === 'Reservas') {
        // Redireciona para a página de reservas
        navigate('/reservas');
        } else if (option === 'Disciplinas') {
        // Redireciona para a página de disciplinas
        navigate('/disciplinas');
        }
        else if (option === 'Sala de Aula') {
        // Redireciona para a página de sala de aula
        navigate('/sala-de-aula');
        }
        else if (option === 'Cadastro Professor') {
        // Redireciona para a página de cadastro de professor
        navigate('/cadastro-professor');
        }
        else {
        // Redireciona para as páginas relacionadas ao usuário
        console.log('Redirecionando para a página:', option);
            }
        setShowUserMenu(false);
    }
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
                                : `Bem-vindo(a), ${user?.username || 'Usuário'}. O que deseja fazer?`}
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
                                    {user?.tipo === 'GESTOR' && (
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