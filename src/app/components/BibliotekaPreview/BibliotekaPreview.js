'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './BibliotekaPreview.module.css';
import { FaBook, FaDownload, FaUnlockAlt, FaArrowRight, FaBookOpen, FaFileAlt } from 'react-icons/fa';

export default function BibliotekaPreview() {
  const [hoveredBook, setHoveredBook] = useState(null);

  const featuredBooks = [
    { id: 1, color: '#1e63d6' },
    { id: 2, color: '#f6190d' },
    { id: 3, color: '#4aa3ff' }
  ];

  return (
    <section className={styles.bibliotekaSection}>
      <div className={styles.container}>
        <div className={styles.content}>
          
          {/* Desna strana - Slika sa knjigama */}
          <div className={styles.imageContent}>
            <div className={styles.booksDisplay}>
              {/* Stack of Books */}
              <div className={styles.bookStack}>
                {featuredBooks.map((book, index) => (
                  <div 
                    key={book.id}
                    className={styles.bookCard}
                    style={{
                      '--book-color': book.color,
                      '--book-index': index,
                      transform: `translateY(${index * -20}px) rotate(${index * -3}deg)`
                    }}
                    onMouseEnter={() => setHoveredBook(book.id)}
                    onMouseLeave={() => setHoveredBook(null)}
                  >
                    <div className={styles.bookCover}>
                      <FaBook className={styles.bookIcon} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating Stats */}
              <div className={styles.floatingStats}>
                <FaBookOpen className={styles.statsIcon} />
                <div className={styles.statsText}>
                  <span className={styles.statsNumber}>20+</span>
                  <span className={styles.statsLabel}>E-knjiga</span>
                </div>
              </div>

              {/* Floating Download Badge */}
              <div className={styles.floatingDownload}>
                <FaDownload className={styles.downloadIcon} />
                <span>Besplatno preuzimanje</span>
              </div>

              {/* Background Glow */}
              <div className={styles.booksGlow} />
            </div>
          </div>

          {/* Leva strana - Tekst i CTA */}
          <div className={styles.textContent}>
            <div className={styles.badgeWrapper}>
              <span className={styles.badge}>
                <FaBookOpen className={styles.badgeIcon} /> Besplatno
              </span>
            </div>

            <h2 className={styles.title}>
              Ekskluzivna <span className={styles.highlight}>E-Biblioteka</span>
            </h2>

            <p className={styles.description}>
              Pristupite našoj kolekciji pažljivo odabranih knjiga potpuno 
              besplatno. Samo ostavite svoj email i preuzimajte PDF knjige 
              kada god želite. Bez skrivenih troškova, bez pretplate.
            </p>

            {/* Features Lista */}
            <div className={styles.features}>
              <div className={styles.featureItem}>
                <div className={styles.featureIconWrapper}>
                  <FaUnlockAlt />
                </div>
                <div className={styles.featureText}>
                  <strong>Potpuno besplatno</strong>
                  <span>Samo email za pristup</span>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIconWrapper}>
                  <FaDownload />
                </div>
                <div className={styles.featureText}>
                  <strong>PDF format</strong>
                  <span>Preuzmi i čitaj offline</span>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIconWrapper}>
                  <FaFileAlt />
                </div>
                <div className={styles.featureText}>
                  <strong>Redovno ažuriranje</strong>
                  <span>Nove knjige svake nedelje</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Link 
              href="/biblioteka"
              className={styles.ctaButton}
            >
              <span>Pristup Biblioteci</span>
              <FaArrowRight className={styles.arrowIcon} />
            </Link>

            {/* Info Note */}
            <p className={styles.infoNote}>
              💡 <strong>Tip:</strong> Email se čuva automatski - unesite samo jednom!
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}