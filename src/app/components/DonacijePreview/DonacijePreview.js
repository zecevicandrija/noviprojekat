'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './DonacijePreview.module.css';
import { FaPatreon, FaHeart, FaCrown, FaStar, FaArrowRight, FaLock, FaGift } from 'react-icons/fa';

export default function DonacijePreview() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className={styles.donacijeSection}>
      <div className={styles.container}>
        <div className={styles.content}>
          
          {/* Leva strana - Tekst i CTA */}
          <div className={styles.textContent}>
            <div className={styles.badgeWrapper}>
              <span className={styles.badge}>
                <FaCrown className={styles.badgeIcon} /> Premium Sadržaj
              </span>
            </div>

            <h2 className={styles.title}>
              Postani deo <span className={styles.highlight}>Premium</span> zajednice
            </h2>

            <p className={styles.description}>
              Podrži podcast koji voliš i dobij pristup ekskluzivnom sadržaju 
              koji ne objavljujemo nigde drugde. Tvoja podrška nam omogućava 
              da nastavimo sa radom i donosimo ti kvalitetne razgovore.
            </p>

            {/* Benefiti sa ikonicama */}
            <div className={styles.benefits}>
              <div className={styles.benefitItem}>
                <div className={styles.benefitIconWrapper}>
                  <FaLock />
                </div>
                <div className={styles.benefitText}>
                  <strong>Ekskluzivne epizode</strong>
                  <span>Premium razgovori samo za članove</span>
                </div>
              </div>

              <div className={styles.benefitItem}>
                <div className={styles.benefitIconWrapper}>
                  <FaStar />
                </div>
                <div className={styles.benefitText}>
                  <strong>Rani pristup</strong>
                  <span>Gledaj pre svih ostalih</span>
                </div>
              </div>

              <div className={styles.benefitItem}>
                <div className={styles.benefitIconWrapper}>
                  <FaGift />
                </div>
                <div className={styles.benefitText}>
                  <strong>Bonus materijali</strong>
                  <span>Behind-the-scenes i više</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className={styles.ctaButtons}>
              <Link 
                href="/donacije"
                className={styles.primaryBtn}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <FaHeart className={styles.btnIcon} />
                <span>Podrži nas i pristupi sadržaju</span>
                <FaArrowRight className={`${styles.arrowIcon} ${isHovered ? styles.arrowHovered : ''}`} />
              </Link>

              <a 
                href="https://patreon.com/dijalog"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryBtn}
              >
                <FaPatreon className={styles.patreonIconBtn} />
                Patreon
              </a>
            </div>

            {/* Social Proof */}
            <div className={styles.socialProof}>
              <div className={styles.avatars}>
                <div className={styles.avatar}>👤</div>
                <div className={styles.avatar}>👤</div>
                <div className={styles.avatar}>👤</div>
                <div className={styles.avatarMore}>+50</div>
              </div>
              <p className={styles.socialText}>
                <strong>50+ pretplatnika</strong> već podržava podcast
              </p>
            </div>
          </div>

          {/* Desna strana - Slika sa floating elementima */}
          <div className={styles.imageContent}>
            <div className={styles.imageWrapper}>
              <div className={styles.mainImageCard}>
                <Image
                  src="/Assets/channels4_banner.jpg"
                  alt="Premium Content"
                  width={500}
                  height={500}
                  className={styles.mainImage}
                />
                <div className={styles.imageOverlay} />
              </div>

              {/* Floating Card 1 - Premium Badge */}
              <div className={styles.floatingCard1}>
                <FaCrown className={styles.floatingIcon} />
                <div className={styles.floatingText}>
                  <span className={styles.floatingTitle}>Premium Only</span>
                  <span className={styles.floatingSubtitle}>Ekskluzivan pristup</span>
                </div>
              </div>

              {/* Floating Card 2 - Stats */}
              <div className={styles.floatingCard2}>
                <div className={styles.statNumber}>5+</div>
                <div className={styles.statLabel}>Premium emisija</div>
              </div>

              {/* Floating Card 3 - Patreon */}
              <div className={styles.floatingCard3}>
                <FaPatreon className={styles.patreonFloatingIcon} />
                <span className={styles.patreonText}>Patreon Exclusive</span>
              </div>

              {/* Glow Effect */}
              <div className={styles.imageGlow} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}