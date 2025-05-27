import styles from './Profile.module.css';
import React, { useContext } from 'react';
import { AuthContext } from '../../../components/auth/AuthContext';

export function Profile() {
  const { user, logoutUser } = useContext(AuthContext);

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>Perfil do Professor</h1>
      {user ? (
        <div className={styles.userInfo}>
          <p className={styles.infoItem}>
            <span className={styles.label}>Usuário:</span> {user[0]?.username}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>Primeiro Nome:</span> {user[0]?.first_name}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>Último Nome:</span> {user[0]?.last_name}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>Telefone:</span> {user[0]?.telefone}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>Email:</span> {user[0]?.email}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>Cargo:</span> {user[0]?.tipo}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>NI:</span> {user[0]?.ni}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>Data de Nascimento:</span> {user[0]?.data_nascimento}
          </p>
          <p className={styles.infoItem}>
            <span className={styles.label}>Data de Contratação:</span> {user[0]?.data_contratacao}
          </p>
        </div>
      ) : (
        <p className={styles.noUser}>Nenhum usuário logado</p>
      )}
    </div>
  );
}

export default Profile;