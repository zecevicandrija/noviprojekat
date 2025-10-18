'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './biblioteka.module.css';

export default function BibliotekaPage() {
  const [email, setEmail] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const ebooks = [
    {
      id: 1,
      title: "The Harbinger",
      author: "Jonathan Cahn",
      cover: "/Assets/harbinger.jpg",
      pdfUrl: "https://example.com/book1.pdf",
      description: "Proročansko upozorenje Americi kroz biblijsku simboliku",
      color: "#1e63d6"
    },
    {
      id: 2,
      title: "Biblija",
      author: "Bog",
      cover: "/Assets/biblija.jpg",
      pdfUrl: "https://example.com/book2.pdf",
      description: "Božija reč i putokaz za život i spasenje",
      color: "#f6190d"
    },
    {
      id: 3,
      title: "Sin Hamasa",
      author: "Mosab Hassan Yousef",
      cover: "/Assets/sinhamasa.png",
      pdfUrl: "https://example.com/book3.pdf",
      description: "Ispovest sina osnivača Hamasa i njegovo obraćenje Hristu",
      color: "#4aa3ff"
    },
    {
      id: 4,
      title: "Povratak bogova",
      author: "Jonathan Cahn",
      cover: "/Assets/povratak.png",
      pdfUrl: "https://example.com/book4.pdf",
      description: "Otkrivanje povratka drevnih paganskih bogova u savremeni svet",
      color: "#ff6b66"
    },
    {
      id: 5,
      title: "Knjiga 5",
      author: "Autor",
      cover: "/Assets/book5.jpg",
      pdfUrl: "https://example.com/book5.pdf",
      description: "Kratka deskripcija knjige",
      color: "#1e63d6"
    },
  ];

  useEffect(() => {
    // Proveri da li korisnik već ima pristup (localStorage)
    const storedEmail = localStorage.getItem('biblioteka_email');
    if (storedEmail) {
      setHasAccess(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validacija email-a
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Molimo unesite validnu email adresu');
      return;
    }

    // Sačuvaj email u localStorage
    localStorage.setItem('biblioteka_email', email);
    
    // Ovde možeš dodati API call da sačuvaš email na backend
    // await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }) });

    setHasAccess(true);
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
                required
              />
              <button type="submit" className={styles.gateButton}>
                Pristup Biblioteci
              </button>
            </form>

            {error && <p className={styles.error}>{error}</p>}

            <p className={styles.gateNote}>
              💡 Vaša email adresa će biti sačuvana i nećete morati ponovo da je unosite
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
        <div className={styles.booksGrid}>
          {ebooks.map((book) => (
            <a
              key={book.id}
              href={book.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.bookCard}
              style={{ '--accent-color': book.color }}
            >
              <div className={styles.bookGlow} style={{ background: `radial-gradient(circle at 50% 50%, ${book.color}22, transparent 70%)` }} />
              
              <div className={styles.bookCover}>
                <Image
                  src={book.cover}
                  alt={book.title}
                  width={200}
                  height={280}
                  className={styles.coverImage}
                />
                <div className={styles.coverOverlay}>
                  <span className={styles.viewIcon}>📖</span>
                </div>
              </div>

              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>{book.title}</h3>
                <p className={styles.bookAuthor}>{book.author}</p>
                <p className={styles.bookDescription}>{book.description}</p>
                <span className={styles.downloadBadge}>Preuzmi PDF</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}