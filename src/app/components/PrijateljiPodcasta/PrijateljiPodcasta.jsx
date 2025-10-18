'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './PrijateljiPodcasta.module.css';

const PrijateljiPodcasta = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const prijatelji = [
    {
      id: 1,
      name: "Kasia Podcast",
      logo: "/Assets/dijalog_high.jpg",
      url: "https://kasiapodcast.com",
      type: "studio",
      description: "Profesionalni Podcast Studiji",
      color: "#1e63d6"
    },
    {
      id: 2,
      name: "Zečević Andrija",
      logo: "/Assets/zeceviclogo2.png",
      url: "https://zecevicdev.netlify.app",
      type: "partner",
      description: "Programiranje i Web Design",
      color: "#f6190d"
    },
    {
      id: 3,
      name: "Media House",
      logo: "/Assets/dijalog_high.jpg",
      url: "https://example.com",
      type: "studio",
      description: "Kreativni sadržaj i video produkcija",
      color: "#4aa3ff"
    },
    {
      id: 4,
      name: "Creative Co.",
      logo: "/Assets/dijalog_high.jpg",
      url: "https://example.com",
      type: "sponzor",
      description: "Dizajn i brending studio",
      color: "#ff6b66"
    },
    {
      id: 5,
      name: "Digital Agency",
      logo: "/Assets/dijalog_high.jpg",
      url: "https://example.com",
      type: "studio",
      description: "Marketing i strategija",
      color: "#1e63d6"
    },
    {
      id: 6,
      name: "Brand Partner",
      logo: "/Assets/dijalog_high.jpg",
      url: "https://example.com",
      type: "sponzor",
      description: "Premium brendiranje",
      color: "#f6190d"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % prijatelji.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, prijatelji.length]);

  const handleChange = (newIndex) => {
    setActiveIndex(newIndex);
    setIsAutoPlaying(false);
  };

  const getPosition = (index) => {
    const diff = index - activeIndex;
    if (diff === 0) return 'center';
    if (diff === 1 || diff === -(prijatelji.length - 1)) return 'right';
    if (diff === -1 || diff === prijatelji.length - 1) return 'left';
    return 'hidden';
  };

  // Formatuje tip tako da prvo slovo bude veliko i zameni "-"/"_" razmacima.
  const formatType = (type) => {
    if (!type && type !== 0) return '';
    return String(type)
      .split(/[-_\s]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <section className={styles.prijateljiSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Prijatelji Podcasta</h3>
          <p className={styles.subtitle}>Studiji i partneri koji podržavaju naš rad</p>
        </div>

        <div className={styles.carouselWrapper}>
          <div className={styles.carouselContainer}>
            {prijatelji.map((prijatelj, index) => {
              const position = getPosition(index);
              const isCenter = position === 'center';

              return (
                <a
                  key={prijatelj.id}
                  href={isCenter ? prijatelj.url : undefined}
                  target={isCenter ? "_blank" : undefined}
                  rel={isCenter ? "noopener noreferrer" : undefined}
                  className={`${styles.card} ${styles[position]}`}
                  onClick={(e) => {
                    if (!isCenter) {
                      e.preventDefault();
                      handleChange(index);
                    }
                  }}
                  style={{ '--accent-color': prijatelj.color }}
                >
                  <div className={styles.cardGlow} style={{ background: `radial-gradient(circle at 50% 50%, ${prijatelj.color}22, transparent 70%)` }} />

                  <div className={styles.logoWrapper}>
                    <Image
                      src={prijatelj.logo}
                      alt={prijatelj.name}
                      width={140}
                      height={140}
                      className={styles.logo}
                    />
                  </div>

                  <div className={styles.cardContent}>
                    <span className={styles.badge}>
                      {formatType(prijatelj.type) || 'Partner'}
                    </span>
                    <h4 className={styles.cardTitle}>{prijatelj.name}</h4>
                    <p className={styles.cardDesc}>{prijatelj.description}</p>
                  </div>

                  {isCenter && <div className={styles.cardArrow}>→</div>}
                </a>
              );
            })}
          </div>

          <button 
            className={`${styles.navButton} ${styles.navLeft}`}
            onClick={() => handleChange((activeIndex - 1 + prijatelji.length) % prijatelji.length)}
            aria-label="Prethodni"
          >
            ‹
          </button>

          <button 
            className={`${styles.navButton} ${styles.navRight}`}
            onClick={() => handleChange((activeIndex + 1) % prijatelji.length)}
            aria-label="Sledeći"
          >
            ›
          </button>
        </div>

        <div className={styles.dots}>
          {prijatelji.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
              onClick={() => handleChange(index)}
              aria-label={`Idi na partnera ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrijateljiPodcasta;
