'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.uloga !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.uloga !== 'admin') {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Admin Panel</h1>
        <div className={styles.userInfo}>
          <span className={styles.welcome}>Dobrodošli, {user.ime} {user.prezime}</span>
          <button onClick={logout} className={styles.logoutBtn}>
            Odjavi se
          </button>
        </div>
      </header>
      
      <main className={styles.main}>
        <Link href="/admin/pitanja" className={styles.card}>
          <h2>Pitanja gostima</h2>
          <p>Pregledajte sva pitanja koja su korisnici postavili</p>
        </Link>
        
        <Link href='/admin/epizode' className={styles.card}>
          <h2>Upravljanje epizodama</h2>
          <p>Ovde možete upravljati epizodama</p>
        </Link>
        
        <div className={styles.card}>
          <h2>Blog postovi</h2>
          <p>Upravljajte blog postovima</p>
        </div>
      </main>
    </div>
  );
}