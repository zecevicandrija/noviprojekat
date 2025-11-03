'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './donacije.module.css';
import { FaPatreon, FaHeart, FaLock, FaUnlock, FaCrown, FaStar, FaPlay } from 'react-icons/fa';
import api from '../utils/api';

export default function DonacijePage() {
  const [email, setEmail] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [premiumEpizode, setPremiumEpizode] = useState([]);
  const [datumIsteka, setDatumIsteka] = useState(null);
  const [patreonName, setPatreonName] = useState('');

  useEffect(() => {
    // Proveri localStorage
    const storedEmail = localStorage.getItem('patreon_email');
    if (storedEmail) {
      verifyAccess(storedEmail);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyAccess = async (emailToVerify) => {
    try {
      setIsLoading(true);
      setError('');

      // Proveri pristup
      const verifyRes = await api.post('/api/patreon/verify-access', {
        email: emailToVerify
      });

      const verifyData = verifyRes.data;

      if (verifyData.hasAccess) {
        setHasAccess(true);
        setEmail(emailToVerify);
        setDatumIsteka(verifyData.datum_isteka);
        setPatreonName(verifyData.patreon_name || '');
        localStorage.setItem('patreon_email', emailToVerify);

        // Učitaj premium epizode
        const epizodeRes = await api.get(`/api/premium-epizode?email=${emailToVerify}`);
        setPremiumEpizode(epizodeRes.data);
      } else {
        setError(verifyData.message || 'Nemate pristup. Podržite nas na Patreon-u!');
        localStorage.removeItem('patreon_email');
      }
    } catch (err) {
      console.error('Verify error:', err);
      if (err.response?.status === 403) {
        setError(err.response.data.message || 'Nemate pristup. Podržite nas na Patreon-u!');
      } else {
        setError('Greška pri proveri pristupa. Pokušajte ponovo.');
      }
      localStorage.removeItem('patreon_email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Molimo unesite validnu email adresu');
      setIsSubmitting(false);
      return;
    }

    await verifyAccess(email);
    setIsSubmitting(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('patreon_email');
    setHasAccess(false);
    setEmail('');
    setPremiumEpizode([]);
    setDatumIsteka(null);
    setPatreonName('');
    setError('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Proveravamo pristup...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <main className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.iconWrapper}>
              <FaHeart className={styles.heartIcon} />
              <div className={styles.iconGlow} />
            </div>

            <h1 className={styles.title}>
              Podrži Dijalog Podcast
            </h1>

            <p className={styles.subtitle}>
              Tvoja podrška nam omogućava da nastavljamo sa radom i donosimo ti 
              ekskluzivan sadržaj koji nećeš naći nigde drugde.
            </p>

            <a 
              href="https://www.patreon.com/c/dijalog" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.patreonBtn}
            >
              <FaPatreon className={styles.patreonIcon} />
              Podrži na Patreon-u
            </a>
          </div>

          <div className={styles.heroImage}>
            <div className={styles.imageCard}>
              <Image
                src="/Assets/channels4_banner.jpg"
                alt="Dijalog Podcast"
                width={600}
                height={400}
                className={styles.image}
              />
              <div className={styles.imageOverlay}>
                <FaCrown className={styles.crownIcon} />
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className={styles.benefits}>
          <h2 className={styles.benefitsTitle}>Šta dobijaš kao Patreon član?</h2>
          
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <FaUnlock />
              </div>
              <h3>Ekskluzivne Epizode</h3>
              <p>Pristup premium epizodama sa gostima koje nećeš videti na YouTube-u</p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <FaStar />
              </div>
              <h3>Rani Pristup</h3>
              <p>Gledaj nove epizode pre svih ostalih i budi u toku sa najnovijim sadržajem</p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                <FaCrown />
              </div>
              <h3>Bonus Sadržaj</h3>
              <p>Behind-the-scenes materijali, produženi razgovori i specijalni segmenti</p>
            </div>
          </div>
        </section>

        {/* Email Gate */}
        <section className={styles.accessGate}>
          <div className={styles.gateCard}>
            <FaLock className={styles.lockIcon} />
            <h2>Već si Patreon član?</h2>
            <p>Unesi svoj email koji si koristio na Patreon-u za pristup premium sadržaju</p>

            <form onSubmit={handleSubmit} className={styles.gateForm}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tvoj@email.com"
                className={styles.gateInput}
                disabled={isSubmitting}
                required
              />
              <button 
                type="submit" 
                className={styles.gateButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Proveravamo...' : 'Pristup Sadržaju'}
              </button>
            </form>

            {error && <p className={styles.error}>{error}</p>}

            <p className={styles.gateNote}>
              💡 Tvoj email će biti sačuvan i nećeš morati ponovo da ga unosiš
            </p>
          </div>
        </section>
      </main>
    );
  }

  // Premium Content View
  return (
    <main className={styles.container}>
      <section className={styles.premiumHero}>
        <div className={styles.premiumHeader}>
          <div className={styles.welcomeContent}>
            <FaCrown className={styles.premiumCrown} />
            <div>
              <h1 className={styles.welcomeTitle}>
                Dobrodošao nazad{patreonName ? `, ${patreonName}` : ''}!
              </h1>
              <p className={styles.welcomeEmail}>{email}</p>
              {datumIsteka && (
                <p className={styles.expiryDate}>
                  Pristup važi do: <strong>{formatDate(datumIsteka)}</strong>
                </p>
              )}
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Odjavi se
          </button>
        </div>
      </section>

      <section className={styles.premiumSection}>
        <h2 className={styles.sectionTitle}>Premium Epizode</h2>
        
        {premiumEpizode.length === 0 ? (
          <div className={styles.emptyState}>
            <FaLock className={styles.emptyIcon} />
            <p>Trenutno nema dostupnih premium epizoda</p>
            <p className={styles.emptySubtext}>Uskoro ćemo dodati novi ekskluzivan sadržaj!</p>
          </div>
        ) : (
          <div className={styles.epizodeGrid}>
            {premiumEpizode.map((epizoda) => (
              <article key={epizoda.id} className={styles.epizodaCard}>
                <a 
                  href={epizoda.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.epizodaLink}
                >
                  <div className={styles.thumbnail}>
                    <Image
                      src={epizoda.thumbnail_url}
                      alt={epizoda.naslov}
                      width={400}
                      height={225}
                      className={styles.thumbnailImage}
                    />
                    <div className={styles.playOverlay}>
                      <FaPlay className={styles.playIcon} />
                    </div>
                    <span className={styles.premiumBadge}>
                      <FaCrown /> Premium
                    </span>
                  </div>

                  <div className={styles.epizodaContent}>
                    <h3 className={styles.epizodaTitle}>{epizoda.naslov}</h3>
                    {epizoda.opis && (
                      <p className={styles.epizodaDesc}>{epizoda.opis}</p>
                    )}
                    <div className={styles.epizodaMeta}>
                      <span>{epizoda.trajanje}</span>
                      <span>•</span>
                      <span>{formatDate(epizoda.datum_objavljivanja)}</span>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.supportCta}>
        <div className={styles.ctaCard}>
          <h3>Hvala na podršci! ❤️</h3>
          <p>Tvoja podrška omogućava nam da nastavljamo sa radom i donosimo ti kvalitetan sadržaj.</p>
          <a 
            href="https://www.patreon.com/c/dijalog" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.ctaButton}
          >
            Upravljaj pretplatom
          </a>
        </div>
      </section>
    </main>
  );
}