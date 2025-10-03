'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/app/utils/api';
import Navbar from '@/app/components/Navbar/Navbar';
import Footer from '@/app/components/Footer/Footer';
import styles from './epizode.module.css';
import { FaPlay, FaClock, FaSearch, FaTimes } from 'react-icons/fa';

export default function Epizode() {
  const [epizode, setEpizode] = useState([]);
  const [allGosti, setAllGosti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGost, setSelectedGost] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch epizode
      const epizodeResponse = await api.get('/api/epizode');
      setEpizode(epizodeResponse.data);
      
      // Fetch all gosti za filter
      const gostiResponse = await api.get('/api/gosti');
      setAllGosti(gostiResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-Latn-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getFilteredAndSortedEpizode = () => {
    let filtered = [...epizode];
    
    // Filter po pretrazi (naslov)
    if (searchQuery.trim()) {
      filtered = filtered.filter(ep => 
        ep.naslov.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter po gostu
    if (selectedGost) {
      filtered = filtered.filter(ep => 
        ep.gosti && ep.gosti.some(g => g.id === selectedGost.id)
      );
    }
    
    // Sortiranje
    switch(filter) {
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.datum_objavljivanja) - new Date(b.datum_objavljivanja));
      case 'latest':
      default:
        return filtered.sort((a, b) => new Date(b.datum_objavljivanja) - new Date(a.datum_objavljivanja));
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGost(null);
  };

  const sortedEpizode = getFilteredAndSortedEpizode();
  const hasActiveFilters = searchQuery.trim() || selectedGost;

  return (
    <main className={styles.container}>
      <Navbar />

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Sve epizode</h1>
          <p className={styles.heroDescription}>
            Istražite sve naše razgovore sa kreativnim ljudima o idejama, pameti i veri.
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className={styles.filtersSection}>
        <div className={styles.filtersContainer}>
          
          {/* Search Bar */}
          <div className={styles.searchWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Pretraži po naslovu..."
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

          {/* Gost Filter */}
          <div className={styles.gostFilterWrapper}>
            <label className={styles.filterLabel}>Gost:</label>
            <select
              value={selectedGost?.id || ''}
              onChange={(e) => {
                const gostId = parseInt(e.target.value);
                const gost = allGosti.find(g => g.id === gostId);
                setSelectedGost(gost || null);
              }}
              className={styles.gostSelect}
            >
              <option value="">Svi gosti</option>
              {allGosti.map(gost => (
                <option key={gost.id} value={gost.id}>
                  {gost.ime_prezime}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className={styles.sortWrapper}>
            <label className={styles.filterLabel}>Sortiraj:</label>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterBtn} ${filter === 'latest' ? styles.active : ''}`}
                onClick={() => setFilter('latest')}
              >
                Najnovije
              </button>
              <button
                className={`${styles.filterBtn} ${filter === 'oldest' ? styles.active : ''}`}
                onClick={() => setFilter('oldest')}
              >
                Najstarije
              </button>
            </div>
          </div>

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
                Pretraga: "{searchQuery}"
                <button onClick={() => setSearchQuery('')}>
                  <FaTimes />
                </button>
              </span>
            )}
            {selectedGost && (
              <span className={styles.filterChip}>
                Gost: {selectedGost.ime_prezime}
                <button onClick={() => setSelectedGost(null)}>
                  <FaTimes />
                </button>
              </span>
            )}
          </div>
        )}
      </section>

      <section className={styles.epizodeSection}>
        {loading ? (
          <div className={styles.loading}>Učitavanje epizoda...</div>
        ) : sortedEpizode.length === 0 ? (
          <div className={styles.empty}>
            <p>
              {hasActiveFilters 
                ? 'Nema epizoda koje odgovaraju vašoj pretrazi.'
                : 'Trenutno nema dostupnih epizoda.'
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
              Pronađeno {sortedEpizode.length} {sortedEpizode.length === 1 ? 'epizoda' : 'epizoda'}
            </div>
            <div className={styles.epizodeGrid}>
              {sortedEpizode.map((epizoda) => (
                <Link 
                  href={`/epizode/${epizoda.id}`} 
                  key={epizoda.id}
                  className={styles.epizodaCard}
                >
                  <div className={styles.thumbnail}>
                    <Image 
                      src={epizoda.thumbnail_url} 
                      alt={epizoda.naslov}
                      width={400}
                      height={225}
                      className={styles.thumbnailImg}
                    />
                    <div className={styles.playOverlay}>
                      <FaPlay className={styles.playIcon} />
                    </div>
                    <div className={styles.duration}>
                      <FaClock /> {epizoda.trajanje}
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{epizoda.naslov}</h3>
                    
                    {epizoda.gosti && epizoda.gosti.length > 0 && (
                      <div className={styles.gosti}>
                        {epizoda.gosti.map((gost, idx) => (
                          <span key={idx} className={styles.gostName}>
                            {gost.ime_prezime}
                            {gost.pozicija && <span className={styles.gostPozicija}> • {gost.pozicija}</span>}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={styles.cardMeta}>
                      <span className={styles.metaDate}>
                        {formatDate(epizoda.datum_objavljivanja)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}