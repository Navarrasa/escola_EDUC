// src/components/Footer/Footer.jsx
import React from 'react';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h3>Escola EDUC</h3>
          <p>Formando cidadãos para o futuro com educação de qualidade.</p>
        </div>

        <div className={styles.section}>
          <h4>Contato</h4>
          <p>Email: contato@escolaeduc.com.br</p>
          <p>Telefone: (11) 1234-5678</p>
          <p>Endereço: Rua da Aprendizagem, 123 - São Paulo, SP</p>
        </div>

        <div className={styles.section}>
          <h4>Links Rápidos</h4>
          <ul>
            <li><a href="/">Início</a></li>
            <li><a href="/processo-seletivo">Processo Seletivo</a></li>
            <li><a href="/missao">Nossa Missão</a></li>
            <li><a href="/processo-seletivo">Área do Aluno</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>&copy; {new Date().getFullYear()} Escola EDUC. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
