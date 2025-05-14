import styles from './Header.module.css';
import { Navbar } from './Navbar/Navbar'

export function Header() {
    return(
        <>
            <header className={styles.header}>
                <Navbar />
            </header>
        </>
    );
}