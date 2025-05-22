import styles from './Homepage.module.css';
import schoolLogo from '../../../assets/images/school.jpg';
import ensinoMedio from '../../../assets/images/ensino_medio.png';
import ensinoFundamental from '../../../assets/images/ensino_fundamental.jpg';
import ensinoSuperior from '../../../assets/images/ensino_superior.jpg';


export function Homepage() {
    return (
        <div className={styles.homepage}>
            <div className={styles.homepageContainer}>
                <div className={styles.homepageContent}>
                    {/* Apresentação */}
                    <section className={styles.section}>
                        <div className={styles.container}>
                            <h2 className={styles.sectionTitle}>Bem-vindo à Escola EDUC</h2>
                            <p className={styles.sectionText}>
                                A Escola EDUC é dedicada a oferecer uma educação acessível e de qualidade, 
                                focada no desenvolvimento integral dos alunos. Nossa missão é inspirar e preparar 
                                os estudantes para um futuro brilhante.
                            </p>
                            <img 
                                src={schoolLogo} 
                                alt="Fachada da Escola EDUC" 
                                className={styles.sectionImage}
                            />
                        </div>
                    </section>

                    {/* Cursos */}
                    <section className={styles.coursesSection}>
                        <div className={styles.container}>
                            <h2 className={styles.sectionTitle}>Nossos Cursos</h2>
                            <p className={styles.sectionText}>
                                Oferecemos uma variedade de cursos para atender às necessidades de nossos alunos, 
                                desde o ensino fundamental até cursos técnicos.
                            </p>
                            <div className={styles.coursesGrid}>
                                <div className={styles.courseItem}>
                                    <img 
                                        src={ensinoFundamental}
                                        alt="Ensino Fundamental" 
                                        className={styles.courseImage}
                                    />
                                    <h3 className={styles.courseTitle}>Ensino Fundamental</h3>
                                    <p className={styles.courseText}>Base sólida para o aprendizado inicial.</p>
                                </div>
                                <div className={styles.courseItem}>
                                    <img 
                                        src={ensinoMedio}
                                        alt="Ensino Médio" 
                                        className={styles.courseImage}
                                    />
                                    <h3 className={styles.courseTitle}>Ensino Médio</h3>
                                    <p className={styles.courseText}>Preparação para o vestibular e mercado de trabalho.</p>
                                </div>
                                <div className={styles.courseItem}>
                                    <img 
                                        src={ensinoSuperior}
                                        alt="Cursos Técnicos" 
                                        className={styles.courseImage}
                                    />
                                    <h3 className={styles.courseTitle}>Cursos Técnicos</h3>
                                    <p className={styles.courseText}>Formação prática para carreiras promissoras.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contato */}
                    <section className={styles.section}>
                        <div className={styles.container}>
                            <h2 className={styles.sectionTitle}>Entre em Contato</h2>
                            <p className={styles.sectionText}>
                                Ficou interessado? Entre em contato conosco para saber mais sobre nossas atividades 
                                e processo de matrícula.
                            </p>
                            <p className={styles.sectionText}>
                                📍 Endereço: Rua da Educação, 123, Cidade, Estado<br/>
                                📧 Email: contato@escolaeduc.com.br<br/>
                                📞 Telefone: (11) 1234-5678
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}