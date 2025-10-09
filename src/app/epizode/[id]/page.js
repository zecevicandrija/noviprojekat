'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/app/utils/api';
import Navbar from '@/app/components/Navbar/Navbar';
import Footer from '@/app/components/Footer/Footer';
import styles from './epizodaInfo.module.css';
import { FaArrowLeft, FaPlay, FaCalendar, FaClock, FaLinkedin, FaInstagram, FaTwitter, FaYoutube, FaQuoteLeft, FaUserTie, FaBriefcase, FaStar } from 'react-icons/fa';

export default function EpizodaInfo() {
  const params = useParams();
  const router = useRouter();
  const [epizoda, setEpizoda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchEpizoda();
    }
  }, [params.id]);

  const fetchEpizoda = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/epizode/${params.id}`);
      setEpizoda(response.data);
      
      // SEO - Update document title and meta
      if (response.data) {
        document.title = `${response.data.naslov} - Dijalog Podcast`;
        
        // Meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          const gostNames = response.data.gosti?.map(g => g.ime_prezime).join(', ') || '';
          metaDescription.setAttribute('content', 
            `Gledajte epizodu "${response.data.naslov}" sa gostima: ${gostNames}. ${response.data.trajanje} - Dijalog Podcast`
          );
        }
      }
    } catch (error) {
      console.error('Error fetching epizoda:', error);
      if (error.response?.status === 404) {
        router.push('/epizode');
      }
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

  const getYouTubeEmbedUrl = (url) => {
    try {
      let videoId = '';
      
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v');
      }
      else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }
      
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <Navbar />
        <div className={styles.loading}>Učitavanje epizode...</div>
        <Footer />
      </main>
    );
  }

  if (!epizoda) {
    return null;
  }

  const embedUrl = getYouTubeEmbedUrl(epizoda.video_url);

  return (
    <main className={styles.container}>
      {/* <Navbar /> */}

      {/* Breadcrumb za SEO */}
      <div className={styles.breadcrumb}>
        <Link href="/">Početna</Link>
        <span>/</span>
        <Link href="/epizode">Epizode</Link>
        <span>/</span>
        <span>{epizoda.naslov}</span>
      </div>

      <div className={styles.backSection}>
        <Link href="/epizode" className={styles.backBtn}>
          <FaArrowLeft /> Nazad na sve epizode
        </Link>
      </div>

      <section className={styles.videoSection}>
        <div className={styles.videoWrapper}>
          {embedUrl && !videoError ? (
            <iframe
              src={embedUrl}
              title={epizoda.naslov}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.videoIframe}
              onError={() => setVideoError(true)}
            />
          ) : (
            <div className={styles.videoFallback}>
              <Image 
                src={epizoda.thumbnail_url} 
                alt={epizoda.naslov}
                fill
                className={styles.fallbackImage}
              />
              <a 
                href={epizoda.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.fallbackBtn}
              >
                <FaPlay /> Gledaj na YouTube
              </a>
            </div>
          )}
        </div>
      </section>

      <section className={styles.infoSection}>
        <div className={styles.mainContent}>
          <header className={styles.episodeHeader}>
            <h1 className={styles.title}>{epizoda.naslov}</h1>

            <div className={styles.metadata}>
              <div className={styles.metaItem}>
                <FaCalendar />
                <span>{formatDate(epizoda.datum_objavljivanja)}</span>
              </div>
              <div className={styles.metaItem}>
                <FaClock />
                <span>{epizoda.trajanje}</span>
              </div>
            </div>
          </header>

          {/* Gosti Section - Poboljšano */}
          {epizoda.gosti && epizoda.gosti.length > 0 && (
            <article className={styles.gostiSection}>
              <h2 className={styles.sectionTitle}>
                <FaUserTie /> Gosti u epizodi
              </h2>
              <div className={styles.gostiGrid}>
                {epizoda.gosti.map((gost) => (
                  <div key={gost.id} className={styles.gostCard}>
                    {gost.slika_url && (
                      <div className={styles.gostAvatar}>
                        <Image 
                          src={gost.slika_url} 
                          alt={`${gost.ime_prezime} - ${gost.pozicija || 'Gost'}`}
                          width={120}
                          height={120}
                          className={styles.avatarImg}
                        />
                      </div>
                    )}
                    <div className={styles.gostInfo}>
                      <h3 className={styles.gostName}>{gost.ime_prezime}</h3>
                      
                      {gost.pozicija && (
                        <p className={styles.gostPozicija}>
                          <FaBriefcase /> {gost.pozicija}
                        </p>
                      )}
                      
                      {gost.kompanija && (
                        <p className={styles.gostKompanija}>{gost.kompanija}</p>
                      )}

                      {/* Biografija gosta */}
                      {gost.biografija && (
                        <div className={styles.biografija}>
                          <h4>O gostu</h4>
                          <p>{gost.biografija}</p>
                        </div>
                      )}

                      {/* Dostignuća gosta */}
                      {(gost.dostignuce_1 || gost.dostignuce_2 || gost.dostignuce_3) && (
                        <div className={styles.dostignuca}>
                          <h4>
                            <FaStar /> Ključna dostignuća
                          </h4>
                          <ul>
                            {gost.dostignuce_1 && <li>{gost.dostignuce_1}</li>}
                            {gost.dostignuce_2 && <li>{gost.dostignuce_2}</li>}
                            {gost.dostignuce_3 && <li>{gost.dostignuce_3}</li>}
                          </ul>
                        </div>
                      )}
                      
                      {/* Social Links */}
                      {(gost.linkedin_url || gost.instagram_url || gost.twitter_url || gost.youtube_url) && (
                        <div className={styles.gostSocials}>
                          <p className={styles.socialsLabel}>Pratite na:</p>
                          <div className={styles.socialLinks}>
                            {gost.linkedin_url && (
                              <a 
                                href={gost.linkedin_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.socialLink}
                                aria-label={`${gost.ime_prezime} LinkedIn profil`}
                              >
                                <FaLinkedin />
                              </a>
                            )}
                            {gost.twitter_url && (
                              <a 
                                href={gost.twitter_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.socialLink}
                                aria-label={`${gost.ime_prezime} Twitter profil`}
                              >
                                <FaTwitter />
                              </a>
                            )}
                            {gost.instagram_url && (
                              <a 
                                href={gost.instagram_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.socialLink}
                                aria-label={`${gost.ime_prezime} Instagram profil`}
                              >
                                <FaInstagram />
                              </a>
                            )}
                            {gost.youtube_url && (
                              <a 
                                href={gost.youtube_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.socialLink}
                                aria-label={`${gost.ime_prezime} YouTube kanal`}
                              >
                                <FaYoutube />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}

          {/* Citati Section */}
          {epizoda.citati && epizoda.citati.length > 0 && (
            <article className={styles.citatiSection}>
              <h2 className={styles.sectionTitle}>
                <FaQuoteLeft /> Najzanimljiviji citati
              </h2>
              <div className={styles.citatiGrid}>
                {epizoda.citati.map((citat) => (
                  <blockquote key={citat.id} className={styles.citatCard}>
                    <FaQuoteLeft className={styles.quoteIcon} />
                    <p className={styles.citatText}>{citat.tekst_citata}</p>
                    {citat.vreme_u_epizodi && (
                      <cite className={styles.citatTime}>
                        <FaClock /> {citat.vreme_u_epizodi}
                      </cite>
                    )}
                  </blockquote>
                ))}
              </div>
            </article>
          )}

          {/* Poziv na akciju */}
          <div className={styles.actionSection}>
            <div className={styles.ctaBox}>
              <h3>Pogledajte celu epizodu</h3>
              <p>Saznajte više iz ove inspirativne priče</p>
              <a 
                href={epizoda.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.watchBtn}
              >
                <FaPlay /> Gledaj na YouTube
              </a>
            </div>
          </div>

          {/* Deljenje na društvenim mrežama */}
          <div className={styles.shareSection}>
            <h3>Podelite ovu epizodu</h3>
            <div className={styles.shareButtons}>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareBtn}
              >
                Facebook
              </a>
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(epizoda.naslov)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareBtn}
              >
                Twitter
              </a>
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareBtn}
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* <Footer /> */}
    </main>
  );
}