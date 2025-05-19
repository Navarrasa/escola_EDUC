import { Outlet } from 'react-router-dom';
import { Header } from '../components/header/Header';
import { Footer } from '../components/footer/Footer';
import styles from './DefaultLayout.module.css'; 

export function DefaultLayout() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
