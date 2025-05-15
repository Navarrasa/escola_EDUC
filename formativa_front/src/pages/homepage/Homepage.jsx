import styles from './Homepage.module.css';
import { Navbar } from '../../components/Header/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';

export function Homepage() {
    return (
        <div className={styles.homepage}>
            <Navbar />
            <div className={styles.homepageContainer}>
                <div className={styles.homepageContent}>
                    <h1>Bem vindo, PROFESSOR.</h1>
                    <h2>O que deseja fazer?</h2>
                </div>
            </div>
            <Footer />
        </div>
    );
}