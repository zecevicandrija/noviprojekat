'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/app/utils/api';
import Navbar from '@/app/components/Navbar/Navbar';
import Footer from '@/app/components/Footer/Footer';
import styles from './epizodaInfo.module.css';
import { FaArrowLeft, FaPlay, FaCalendar, FaClock, FaEye, FaLinkedin, FaInstagram, FaQuoteLeft } from 'react-icons/fa';

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

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url) => {
    try {
      let videoId = '';
      
      // youtube.com/watch?v=ID
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v');
      }
      // youtu.be/ID
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
      <Navbar />

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
            {/* <div className={styles.metaItem}>
              <FaEye />
              <span>{epizoda.broj_pregleda || 0} pregleda</span>
            </div> */}
          </div>

          {/* Gosti Section */}
          {epizoda.gosti && epizoda.gosti.length > 0 && (
            <div className={styles.gostiSection}>
              <h2 className={styles.sectionTitle}>Gosti u epizodi</h2>
              <div className={styles.gostiGrid}>
                {epizoda.gosti.map((gost) => (
                  <div key={gost.id} className={styles.gostCard}>
                    {gost.slika_url && (
                      <div className={styles.gostAvatar}>
                        <Image 
                          src={gost.slika_url} 
                          alt={gost.ime_prezime}
                          width={100}
                          height={100}
                          className={styles.avatarImg}
                        />
                      </div>
                    )}
                    <div className={styles.gostInfo}>
                      <h3 className={styles.gostName}>{gost.ime_prezime}</h3>
                      {gost.pozicija && (
                        <p className={styles.gostPozicija}>{gost.pozicija}</p>
                      )}
                      {gost.kompanija && (
                        <p className={styles.gostKompanija}>{gost.kompanija}</p>
                      )}
                      {gost.biografija && (
                        <p className={styles.gostBio}>{gost.biografija}</p>
                      )}
                      
                      {(gost.linkedin_url || gost.instagram_url) && (
                        <div className={styles.gostSocials}>
                          {gost.linkedin_url && (
                            <a 
                              href={gost.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={styles.socialLink}
                            >
                              <FaLinkedin /> LinkedIn
                            </a>
                          )}
                          {gost.instagram_url && (
                            <a 
                              href={gost.instagram_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={styles.socialLink}
                            >
                              <FaInstagram /> Instagram
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citati Section */}
          {epizoda.citati && epizoda.citati.length > 0 && (
            <div className={styles.citatiSection}>
              <h2 className={styles.sectionTitle}>Najzanimljiviji citati</h2>
              <div className={styles.citatiGrid}>
                {epizoda.citati.map((citat) => (
                  <div key={citat.id} className={styles.citatCard}>
                    <FaQuoteLeft className={styles.quoteIcon} />
                    <p className={styles.citatText}>{citat.tekst_citata}</p>
                    {citat.vreme_u_epizodi && (
                      <span className={styles.citatTime}>{citat.vreme_u_epizodi}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Watch Button */}
          <div className={styles.actionSection}>
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
      </section>

      <Footer />
    </main>
  );
}