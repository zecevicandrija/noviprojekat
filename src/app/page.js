'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image'
import styles from './page.module.css'
import NewsletterForm from './NewsletterForm'
import ContactForms from './components/ContactForms/ContactForms';
import Multimedia from './components/Multimedia/Multimedia';
import { FaPlay } from 'react-icons/fa';
import Pitanja from './components/Pitanja/Pitanja';
import BlogPreview from './components/BlogPreview/BlogPreview';
import PrijateljiPodcasta from './components/PrijateljiPodcasta/PrijateljiPodcasta';
import DonacijePreview from './components/DonacijePreview/DonacijePreview';
import BibliotekaPreview from './components/BibliotekaPreview/BibliotekaPreview';

// AnimatedSection sa INLINE STYLES - ovo 100% radi
function AnimatedSection({ children, animation = 'fade-up', delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);

  // INLINE STYLES - nema zavisnosti od CSS fajlova
  const getStyle = () => {
    const baseStyle = {
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      willChange: isVisible ? 'auto' : 'opacity, transform',
    };

    if (!isVisible) {
      // Početno stanje
      switch(animation) {
        case 'fade-up':
          return { ...baseStyle, opacity: 0, transform: 'translateY(40px)' };
        case 'fade-in':
          return { ...baseStyle, opacity: 0 };
        case 'slide-left':
          return { ...baseStyle, opacity: 0, transform: 'translateX(-60px)' };
        case 'slide-right':
          return { ...baseStyle, opacity: 0, transform: 'translateX(60px)' };
        case 'scale-in':
          return { ...baseStyle, opacity: 0, transform: 'scale(0.85)' };
        default:
          return { ...baseStyle, opacity: 0, transform: 'translateY(40px)' };
      }
    }

    // Vidljivo stanje
    return { 
      ...baseStyle, 
      opacity: 1, 
      transform: 'translateY(0) translateX(0) scale(1)' 
    };
  };

  return (
    <div ref={ref} style={getStyle()}>
      {children}
    </div>
  );
}

// Hero sa inline animacijama
function HeroSection({ najnovijaEpizoda }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Pokreni animacije nakon što komponenta mount-uje
    setTimeout(() => setMounted(true), 50);
  }, []);

  const heroItemStyle = (delayMs) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delayMs}ms`,
  });

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle} style={heroItemStyle(100)}>
            Dijalog Podcast
          </h2>
          <p className={styles.lead} style={heroItemStyle(250)}>
            Naša ideja je da gledaocima, kroz razgovor sa gostima, prenesemo dobru ili lošu informaciju na adekvatan način kako bi oni sami doneli najbolje zaključke.
          </p>

          <div className={styles.actions} style={heroItemStyle(400)}>
            <a 
              href={najnovijaEpizoda?.video_url || "https://www.youtube.com/@dijalog/videos"} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.playBtn} 
              aria-label="Pusti najnoviju epizodu"
            >
              <FaPlay className={styles.playIcon} /> Pusti najnoviju
            </a>
            <a href="#newsletter" className={styles.subscribe}>Pretplati se</a>
          </div>

          <div className={styles.badges} style={heroItemStyle(550)}>
            <span className={styles.badge}>YouTube</span>
          </div>
        </div>

        <div className={styles.heroMedia} style={heroItemStyle(700)}>
          <div className={styles.card}>
            <Image 
              src="/Assets/channels4_banner.jpg" 
              alt="Dijalog hero" 
              width={760} 
              height={430} 
              className={styles.heroImage}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Episode kartice sa inline animacijama + dinamičko učitavanje iz baze
function EpisodesSection() {
  const [mounted, setMounted] = useState(false);
  const [epizode, setEpizode] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
    
    // Učitaj najnovije epizode iz baze
    const fetchEpizode = async () => {
      try {
        const response = await fetch('https://dijalog.undovrbas.com/api/epizode');
        const data = await response.json();
        // Uzmi samo 2 najnovije epizode
        setEpizode(data.slice(0, 2));
      } catch (error) {
        console.error('Greška pri učitavanju epizoda:', error);
        // Fallback na hardkodovane epizode ako API ne radi
        setEpizode([
          {
            id: 1,
            naslov: "dijalog Podcast 107 | DRAGOSLAV BOKAN - Srbi treba da nauče nešto iz istorije ili ćemo propasti",
            thumbnail_url: "/Assets/dijalogthumb.jpg",
            video_url: "https://youtu.be/Oq9OgAyInVo?si=UC-pebisjbUrdmLM",
            trajanje: "2h 18min",
            datum_objavljivanja: "2025-09-09"
          },
          {
            id: 2,
            naslov: "dijalog 106 | BARBARA O'NEILL - Božija bašta je najbolja apoteka / God's garden is the best pharmacy",
            thumbnail_url: "/Assets/ddd.jpg",
            video_url: "https://youtu.be/bU5tD_yyGww?si=YZmKh5ithiYbpuq6",
            trajanje: "45min",
            datum_objavljivanja: "2025-08-18"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchEpizode();
  }, []);

  const cardStyle = (delayMs) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${delayMs}ms`,
  });

  // Formatiraj datum u DD.MM.YYYY format
  const formatDatum = (datum) => {
    const date = new Date(datum);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}.`;
  };

  if (loading) {
    return (
      <section id="epizode" className={styles.section}>
        <h3 className={styles.sectionTitle}>Najnovije epizode</h3>
        <div className={styles.grid}>
          <p>Učitavanje...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="epizode" className={styles.section}>
      <h3 className={styles.sectionTitle} style={cardStyle(0)}>
        Najnovije epizode
      </h3>
      <div className={styles.grid}>
        {epizode.map((epizoda, index) => (
          <article 
            key={epizoda.id} 
            className={styles.episodeCard} 
            style={cardStyle(150 * (index + 1))}
          >
            <a 
              href={epizoda.video_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.episodeLink}
            >
              <div className={styles.thumb}>
                <Image 
                  src={epizoda.thumbnail_url} 
                  alt={epizoda.naslov} 
                  width={320} 
                  height={180} 
                />
              </div>
              <div className={styles.epContent}>
                <h4>{epizoda.naslov}</h4>
                <p className={styles.epMeta}>
                  {epizoda.trajanje} • {formatDatum(epizoda.datum_objavljivanja)}
                </p>
              </div>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Page() {
  const [najnovijaEpizoda, setNajnovijaEpizoda] = useState(null);

  useEffect(() => {
    // Učitaj najnoviju epizodu za Hero sekciju
    const fetchNajnovija = async () => {
      try {
        const response = await fetch('https://dijalog.undovrbas.com/api/epizode');
        const data = await response.json();
        if (data.length > 0) {
          setNajnovijaEpizoda(data[0]); // Prva epizoda je najnovija
        }
      } catch (error) {
        console.error('Greška pri učitavanju najnovije epizode:', error);
      }
    };

    fetchNajnovija();
  }, []);

  return (
    <main className={styles.container}>
      <HeroSection najnovijaEpizoda={najnovijaEpizoda} />

      <AnimatedSection animation="fade-up" delay={0}>
        <EpisodesSection />
      </AnimatedSection>

      <AnimatedSection animation="fade-up" delay={0}>
        <section id="newsletter">
          <NewsletterForm />
        </section>
      </AnimatedSection>

      <AnimatedSection animation="slide-left" delay={0}>
        <section id='pitanja'>
          <Pitanja />
        </section>
      </AnimatedSection>

      <AnimatedSection animation="scale-in" delay={0}>
        <Multimedia />
      </AnimatedSection>

      <AnimatedSection animation="fade-up" delay={0}>
        <section id='prijatelji'>
          <PrijateljiPodcasta />
        </section>
      </AnimatedSection>

      <AnimatedSection animation="slide-right" delay={0}>
        <section id='donacije'>
          <DonacijePreview />
        </section>
      </AnimatedSection>

      <AnimatedSection animation="fade-up" delay={0}>
        <section id='biblioteka'>
          <BibliotekaPreview />
        </section>
      </AnimatedSection>

      <AnimatedSection animation="fade-up" delay={0}>
        <section id='kontakt'>
          <ContactForms />
        </section>
      </AnimatedSection>

      <AnimatedSection animation="fade-in" delay={0}>
        <section id='blog'>
          <BlogPreview />
        </section>
      </AnimatedSection>
    </main>
  )
}