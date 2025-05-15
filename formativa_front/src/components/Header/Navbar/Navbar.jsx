import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import logo from '../../../assets/logo/logo.png';
import userIcon from '../../../assets/user/user.png';
import themeIcon from '../../../assets/theme/theme-option.png';
import AuthContext from '../../auth/AuthContext';

export function Navbar() {
  const { authTokens, user, logoutUser } = useContext(AuthContext);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const navigate = useNavigate();

  const handleThemeChange = (theme) => {
    // Aqui você pode adicionar a lógica para alterar o tema (claro, escuro, sistema)
    console.log('Tema escolhido:', theme);
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
  };

  return (
    <div className={styles.navbar}>
      <div>
        <img src={logo} alt="Logo Escola EDUC" />
      </div>
      <div>
        <nav className={styles.navbaritens}>
          <h2 className={styles.welcome}>
            Bem vindo, {user ? user.username : 'PROFESSOR'}.
            O que deseja fazer?
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
                      <div onClick={() => navigate('/sobre')}>Sobre a Escola</div>
                      <div onClick={() => navigate('/processo-seletivo')}>Processo Seletivo</div>
                      <div onClick={() => navigate('/missao')}>Missão Escolar</div>
                      <div onClick={() => navigate('/grade')}>Grade Escolar</div>
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
  );
}
