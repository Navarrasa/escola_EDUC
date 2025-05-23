import styles from './School.module.css';

export function School() {
    return (
        <div className={styles.school}>
            <h1 className={styles.title}>Missão, Visão e Valores</h1>
            
            <section className={styles.section}>
                <h2 className={styles.subtitle}>Missão</h2>
                <p className={styles.text}>
                    Oferecer uma educação inclusiva, de qualidade e inovadora, que desenvolva competências acadêmicas, sociais e éticas,
                    preparando nossos alunos para um futuro consciente, crítico e responsável.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.subtitle}>Visão</h2>
                <p className={styles.text}>
                    Ser reconhecida como uma instituição referência em educação, promovendo o crescimento integral dos alunos
                    e contribuindo para uma sociedade mais justa e sustentável.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.subtitle}>Valores</h2>
                <div className={styles.cardGrid}>
                    <div className={styles.card}>Respeito e valorização da diversidade</div>
                    <div className={styles.card}>Compromisso com a ética e transparência</div>
                    <div className={styles.card}>Excelência no ensino e aprendizagem</div>
                    <div className={styles.card}>Inovação e criatividade</div>
                    <div className={styles.card}>Responsabilidade social e ambiental</div>
                    <div className={styles.card}>Colaboração e espírito de comunidade</div>
                </div>
            </section>
        </div>
    );
}
