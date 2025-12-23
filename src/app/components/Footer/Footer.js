'use client'

import { FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa'
import styles from './Footer.module.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>dijalog</h3>
          <p className={styles.footerDescription}>
            Istorija, teologija, medicina, politika, tradicija, sport i biznis.
          </p>
          <p>Web-sajt radio: <a href='https://zecevicdev.com' target='_blank'><b>zecevicdev.com</b></a></p>
        </div>
        
        <div className={styles.footerSection}>
          <h4 className={styles.sectionTitle}>Prati nas</h4>
          <div className={styles.socialIcons}>
            <a 
              href="https://www.instagram.com/dijalogvladimir" 
              className={styles.socialLink}
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram className={styles.icon} />
              <span>Instagram</span>
            </a>
            <a 
              href="https://www.youtube.com/@dijalog" 
              className={styles.socialLink}
              aria-label="YouTube"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube className={styles.icon} />
              <span>YouTube</span>
            </a>
            <a 
              href="https://www.tiktok.com/@dijalog" 
              className={styles.socialLink}
              aria-label="TikTok"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTiktok className={styles.icon} />
              <span>TikTok</span>
            </a>
          </div>
        </div>
        
        <div className={styles.footerSection}>
          <h4 className={styles.sectionTitle}>Linkovi</h4>
          <div className={styles.footerLinks}>
            <a href="/epizode">Epizode</a>
            <a href="/blog">Blog</a>
            <a href="/#kontakt">Kontakt</a>
            <a href="/donacije">Donacije</a>
          </div>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <p className={styles.copyright}>
          © {currentYear} Dijalog Podcast — Sva prava zadržana
        </p>
      </div>
    </footer>
  )
}