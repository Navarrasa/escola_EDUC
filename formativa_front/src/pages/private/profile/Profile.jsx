import styles from './Profile.module.css';
import React, { useContext } from 'react';
import { AuthContext } from '../../../hooks/AuthContext';

export function Profile() {
  const { user } = useContext(AuthContext);

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>Perfil do Professor</h1>
      {user ? (
        <div className={styles.userInfo}>
          <p className={styles.infoItem}>
            <span className={styles.label}>Usuário:</span> {user?.username}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>Primeiro Nome:</span> {user?.first_name}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>Último Nome:</span> {user?.last_name}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>Telefone:</span> {user?.telefone}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>Email:</span> {user?.email}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>Cargo:</span> {user?.tipo}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>NI:</span> {user?.ni}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>Data de Nascimento:</span> {user?.data_nascimento}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>Data de Contratação:</span> {user?.data_contratacao}
          </p>
        </div>
      ) : (
        <p className={styles.noUser}>Nenhum usuário logado</p>
      )}
    </div>
  );
}

export default Profile;