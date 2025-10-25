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
          <p>Pregledajte sva pitanja koja su korisnici postavili.</p>
        </Link>
        
        <Link href='/admin/epizode' className={styles.card}>
          <h2>Upravljanje epizodama</h2>
          <p>Ovde možete upravljati epizodama.</p>
        </Link>

        <Link href="/admin/sledeca-epizoda" className={styles.card}>
          <h2>Upravljanje sledećom epizodom</h2>
          <p>Postavite datum i gosta za sledeću emisiju.</p>
        </Link>

        <Link href="/admin/gosti" className={styles.card}>
          <h2>Upravljanje gostima</h2>
          <p>Menjajte, dodavajte ili obrišite goste podcasta.</p>
        </Link>

        <Link href="/shop/upravljanje" className={styles.card}>
          <h2>Upravljanje proizvodima</h2>
          <p>Menjajte, dodavajte ili obrišite proizvode.</p>
        </Link>

        <Link href="/admin/popusti" className={styles.card}>
          <h2>Upravljanje popustima</h2>
          <p>Menjajte, dodavajte ili obrišite popuste.</p>
        </Link>

        <Link href="/admin/statistika" className={styles.card}>
          <h2>Statistika Transakcija</h2>
          <p>Uvid u statistiku transakcija preko našeg shop-a.</p>
        </Link>

        <Link href="/admin/premium" className={styles.card}>
          <h2>Upravljanje Premium Kontenta</h2>
          <p>Upravljanje kontenta za Patreon donatore.</p>
        </Link>

        <Link href="/admin/donatori" className={styles.card}>
          <h2>Upravljanje Premium Korisnika</h2>
          <p>Upravljanje i pregled Patreon donatora.</p>
        </Link>

        <Link href="/admin/knjige" className={styles.card}>
          <h2>Upravljanje Knjigama</h2>
          <p>Upravljanje i pregled e-knjiga iz biblioteke.</p>
        </Link>
      </main>
    </div>
  );
}