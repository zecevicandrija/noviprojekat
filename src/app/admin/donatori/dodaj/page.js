'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/app/utils/api';
import styles from './dodajDonatora.module.css';
import { FaArrowLeft, FaUserPlus, FaCrown, FaEnvelope } from 'react-icons/fa';

export default function DodajDonatora() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Redirect ako nije admin
  if (user && user.uloga !== 'admin') {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Email validacija
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Molimo unesite validnu email adresu' });
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/patreon/patrons', { email });

      setMessage({ 
        type: 'success', 
        text: `Donator ${email} uspešno dodat! Pristup važi do: ${new Date(response.data.datum_isteka).toLocaleDateString('sr-Latn-RS')}` 
      });
      
      // Reset forma nakon 2 sekunde
      setTimeout(() => {
        router.push('/admin/donatori');
      }, 2000);
    } catch (error) {
      console.error('Add patron error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Greška pri dodavanju donatora' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.uloga !== 'admin') {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin/donatori" className={styles.backBtn}>
          <FaArrowLeft /> Nazad na listu
        </Link>
        <h1>
          <FaUserPlus className={styles.titleIcon} /> 
          Dodaj premium donatora
        </h1>
      </header>

      <div className={styles.formWrapper}>
        <div className={styles.infoCard}>
          <FaCrown className={styles.crownIcon} />
          <h2>Premium pristup</h2>
          <p>
            Dodavanjem email adrese, korisnik će automatski dobiti pristup premium sadržaju 
            na period od <strong>30 dana</strong>. Nakon isteka perioda, možete produžiti pristup 
            iz liste donatora.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">
              <FaEnvelope /> Email adresa donatora *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="primer@email.com"
              disabled={loading}
            />
            <p className={styles.hint}>
              💡 Ovu email adresu će korisnik koristiti za pristup premium sadržaju na sajtu
            </p>
          </div>

          {message.text && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Dodavanje...' : '✨ Dodaj donatora'}
          </button>
        </form>

        <div className={styles.noteCard}>
          <h3>📋 Napomene</h3>
          <ul>
            <li>Ako email već postoji u bazi, datum isteka će biti ažuriran</li>
            <li>Donator će moći da pristupa premium epizodama unošenjem svog email-a</li>
            <li>Status donatora možete pratiti i menjati u listi donatora</li>
          </ul>
        </div>
      </div>
    </div>
  );
}