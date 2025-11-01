'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/app/utils/api';
import styles from './biblioteka.module.css';
import { FaSearch, FaTimes } from 'react-icons/fa';

export default function BibliotekaPage() {
  const [email, setEmail] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [knjige, setKnjige] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

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
      
      // Izvuci jedinstvene kategorije
      const uniqueCategories = [...new Set(
        response.data
          .map(book => book.kategorija)
          .filter(cat => cat && cat.trim() !== '')
      )].sort();
      
      setCategories(uniqueCategories);
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

  const getFilteredKnjige = () => {
    let filtered = [...knjige];
    
    // Filter po pretrazi (ime knjige ili autor)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book => 
        book.ime.toLowerCase().includes(query) ||
        book.autor.toLowerCase().includes(query)
      );
    }
    
    // Filter po kategoriji
    if (selectedCategory) {
      filtered = filtered.filter(book => book.kategorija === selectedCategory);
    }
    
    return filtered;
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  const filteredKnjige = getFilteredKnjige();
  const hasActiveFilters = searchQuery.trim() || selectedCategory;

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

      {/* Filters Section */}
      <section className={styles.filtersSection}>
        <div className={styles.filtersContainer}>
          
          {/* Search Bar */}
          <div className={styles.searchWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Pretraži po naslovu ili autoru..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className={styles.clearSearchBtn}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className={styles.categoryFilterWrapper}>
              <label className={styles.filterLabel}>Kategorija:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.categorySelect}
              >
                <option value="">Sve kategorije</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button 
              onClick={handleClearFilters}
              className={styles.clearFiltersBtn}
            >
              <FaTimes /> Obriši filtere
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className={styles.activeFilters}>
            <span className={styles.activeFiltersLabel}>Aktivni filteri:</span>
            {searchQuery && (
              <span className={styles.filterChip}>
                Pretraga: '{searchQuery}'
                <button onClick={() => setSearchQuery('')}>
                  <FaTimes />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className={styles.filterChip}>
                Kategorija: {selectedCategory}
                <button onClick={() => setSelectedCategory('')}>
                  <FaTimes />
                </button>
              </span>
            )}
          </div>
        )}
      </section>

      <section className={styles.booksSection}>
        {filteredKnjige.length === 0 ? (
          <div className={styles.noBooks}>
            <p>
              {hasActiveFilters 
                ? 'Nema knjiga koje odgovaraju vašoj pretrazi.'
                : 'Trenutno nema dostupnih knjiga u biblioteci.'
              }
            </p>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} className={styles.emptyBtn}>
                Obriši filtere
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.resultsCount}>
              Pronađeno {filteredKnjige.length} {filteredKnjige.length === 1 ? 'knjiga' : filteredKnjige.length < 5 ? 'knjige' : 'knjiga'}
            </div>
            <div className={styles.booksGrid}>
              {filteredKnjige.map((book) => (
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
          </>
        )}
      </section>
    </main>
  );
}