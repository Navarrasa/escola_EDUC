import styles from './Process.module.css';

export function Process() {
    return (
        <div className={styles.selectionProcess}>
            <h1>Processo Seletivo 2025</h1>
            
            <section className={styles.section}>
                <h2>Período de Inscrição</h2>
                <p>De 01 de junho a 15 de julho de 2025</p>
            </section>

            <section className={styles.section}>
                <h2>Quem pode participar?</h2>
                <div className={styles.requirements}>
                    <p>Estudantes de graduação de qualquer curso.</p>
                    <p>Pessoas com interesse em aprender e colaborar em equipe.</p>
                    <p>Disponibilidade de pelo menos 10h semanais.</p>
                </div>
            </section>

            <section className={styles.section}>
                <h2>Etapas do Processo</h2>
                <ol>
                    <li>Inscrição online</li>
                    <li>Envio de portfólio ou currículo</li>
                    <li>Entrevista com a equipe</li>
                    <li>Resultado final</li>
                </ol>
            </section>

            <section className={styles.section}>
                <h2>Como se inscrever</h2>
                <p>
                    Preencha o formulário disponível no botão abaixo. Certifique-se de que todas as informações estão corretas.
                </p>
                <a className={styles.button} href="https://example.com/inscricao" target="_blank" rel="noopener noreferrer">
                    Fazer Inscrição
                </a>
            </section>
        </div>
    );
}