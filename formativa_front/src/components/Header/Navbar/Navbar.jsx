import styles from './Navbar.module.css'
import logo from '../../../assets/logo/logo.png'
import user from '../../../assets/user/user.png'
import theme from '../../../assets/theme/theme-option.png'

export function Navbar() {
    return(
        <>
        <div className={styles.navbar}>
            <div>
                <img src={logo} alt="Logo Escola EDUC" />
            </div>
            <div>
                <nav className={styles.navbaritens}>
                    <h2 className={styles.welcome}>
                        Bem vindo, PROFESSOR.
                        O que deseja fazer?
                    </h2>
                    <ul>
                        <li><img src={user} alt="Opções do Usuário" /></li>
                        <li><img src={theme} alt="Opções de Tema" /></li>
                    </ul>
                </nav>
            </div>
        </div>
        </>
    );
}