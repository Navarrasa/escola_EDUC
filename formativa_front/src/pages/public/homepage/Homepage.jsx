import styles from './Homepage.module.css';

export function Homepage() {
    return (
        <div className={styles.homepage}>
            <div className={styles.homepageContainer}>
                <div className={styles.homepageContent}>
                    <h1>Olá mundo!</h1>
                </div>
            </div>
        </div>
    );
}