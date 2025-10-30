'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/app/utils/api';
import styles from './biblioteka.module.css';

export default function BibliotekaPage() {
  const [email, setEmail] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [knjige, setKnjige] = useState([]);

  useEffect(() => {
    // Proveri da li korisnik već ima pristup (localStorage)
    const storedEmail = localStorage.getItem('biblioteka_email');
    if (storedEmail) {
      setHasAccess(true);
      fetchKnjige();
    }
    setIsLoading(false);
  }, []);

  const fetchKnjige = async () => {
    try {
      const response = await api.get('/api/knjige');
      setKnjige(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validacija email-a
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Molimo unesite validnu email adresu');
      setIsSubmitting(false);
      return;
    }

    try {
      // Dodaj email u Resend newsletter
      const response = await fetch('https://api.dijalogpodcast.com/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Uspešno dodat u newsletter
        console.log('Email dodat u newsletter:', data.message);
        
        // Sačuvaj email u localStorage
        localStorage.setItem('biblioteka_email', email);
        
        setHasAccess(true);
        fetchKnjige();
      } else {
        // Čak i ako je već prijavljen, dozvoli pristup
        if (data.message && data.message.includes('Već si prijavljen')) {
          localStorage.setItem('biblioteka_email', email);
          setHasAccess(true);
          fetchKnjige();
        } else {
          setError(data.message || 'Greška pri prijavi. Pokušajte ponovo.');
        }
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setError('Greška pri povezivanju sa serverom. Pokušajte ponovo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('biblioteka_email');
    setHasAccess(false);
    setEmail('');
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <main className={styles.container}>
        <div className={styles.gateWrapper}>
          <div className={styles.gateCard}>
            <div className={styles.gateIcon}>📚</div>
            <h1 className={styles.gateTitle}>Dobrodošli u našu Biblioteku</h1>
            <p className={styles.gateDescription}>
              Pristupite ekskluzivnoj kolekciji e-knjiga. Unesite vašu email adresu da biste nastavili.
            </p>
            
            <form onSubmit={handleSubmit} className={styles.gateForm}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vaš@email.com"
                className={styles.gateInput}
                disabled={isSubmitting}
                required
              />
              <button 
                type="submit" 
                className={styles.gateButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Prijavljujem...' : 'Pristup Biblioteci'}
              </button>
            </form>

            {error && <p className={styles.error}>{error}</p>}

            <p className={styles.gateNote}>
              💡 Vaša email adresa će biti sačuvana i automatski ćete biti prijavljeni na naš newsletter
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Biblioteka E-Knjiga</h1>
          <p className={styles.subtitle}>
            Ekskluzivna kolekcija knjiga za sve ljubitelje znanja
          </p>
          <button onClick={handleReset} className={styles.resetButton}>
            Promeni email
          </button>
        </div>
      </section>

      <section className={styles.booksSection}>
        {knjige.length === 0 ? (
          <div className={styles.noBooks}>
            <p>Trenutno nema dostupnih knjiga u biblioteci.</p>
          </div>
        ) : (
          <div className={styles.booksGrid}>
            {knjige.map((book) => (
              <a
                key={book.id}
                href={book.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.bookCard}
              >
                <div className={styles.bookGlow} />
                
                <div className={styles.bookCover}>
                  <Image
                    src={book.url_slike}
                    alt={book.ime}
                    width={200}
                    height={280}
                    className={styles.coverImage}
                  />
                  <div className={styles.coverOverlay}>
                    <span className={styles.viewIcon}>📖</span>
                  </div>
                </div>

                <div className={styles.bookInfo}>
                  <h3 className={styles.bookTitle}>{book.ime}</h3>
                  <p className={styles.bookAuthor}>{book.autor}</p>
                  {book.kategorija && (
                    <span className={styles.bookCategory}>{book.kategorija}</span>
                  )}
                  <p className={styles.bookDescription}>{book.opis}</p>
                  <span className={styles.downloadBadge}>Preuzmi PDF</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}