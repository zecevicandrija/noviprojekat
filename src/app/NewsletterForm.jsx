'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './NewsletterForm.module.css';
import { FaEnvelope, FaPaperPlane, FaBell } from 'react-icons/fa';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setStatus({ ok: false, msg: 'Unesi email' });
    
    // Validacija email-a
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setStatus({ ok: false, msg: 'Unesite validnu email adresu' });
    }

    try {
      setStatus({ ok: null, msg: 'Slanje...' });
      
      // Ovde dodaj API call za newsletter
      // await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
      
      await new Promise((r) => setTimeout(r, 1000));
      setEmail('');
      setStatus({ ok: true, msg: 'Uspešno si se prijavio! 🎉' });
      
      // Reset status nakon 5 sekundi
      setTimeout(() => setStatus(null), 5000);
    } catch {
      setStatus({ ok: false, msg: 'Greška prilikom prijave. Pokušaj ponovo.' });
    }
  };

  return (
    <section className={styles.newsletterSection}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.textContent}>
            <div className={styles.iconWrapper}>
              <FaBell className={styles.bellIcon} />
              <div className={styles.iconGlow} />
            </div>
            
            <h2 className={styles.title}>
              Ostani u toku sa svim novostima
            </h2>
            
            <p className={styles.description}>
              Pridruži se našoj zajednici i budi prvi koji će saznati za nove epizode, 
              ekskluzivne intervjue i bonus sadržaj koji ne objavljujemo nigde drugde.
            </p>

            <div className={styles.benefits}>
              <div className={styles.benefit}>
                <span className={styles.checkIcon}>✓</span>
                <span>Nove epizode direktno u inbox</span>
              </div>
              <div className={styles.benefit}>
                <span className={styles.checkIcon}>✓</span>
                <span>Ekskluzivni bonus sadržaj</span>
              </div>
              <div className={styles.benefit}>
                <span className={styles.checkIcon}>✓</span>
                <span>Rani pristup specijalnim gostima</span>
              </div>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputWrapper}>
                <FaEnvelope className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="tvoj@email.com"
                  aria-label="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              
              <button type="submit" className={styles.submitBtn}>
                <span>Prijavi se</span>
                <FaPaperPlane className={styles.planeIcon} />
              </button>
            </form>

            {status?.msg && (
              <div
                role="status"
                className={`${styles.statusMessage} ${
                  status.ok === true ? styles.success
                  : status.ok === false ? styles.error
                  : styles.loading
                }`}
              >
                {status.msg}
              </div>
            )}

            <p className={styles.privacy}>
              🔒 Tvoji podaci su sigurni. Bez spam-a, odjavi se bilo kada.
            </p>
          </div>

          <div className={styles.imageContent}>
            <div className={styles.imageWrapper}>
              <Image
                src="/Assets/dijalog_high.jpg"
                alt="Newsletter"
                width={500}
                height={500}
                className={styles.image}
              />
              <div className={styles.imageGlow} />
              
              <div className={styles.floatingCard}>
                <div className={styles.cardIcon}>📧</div>
                <div className={styles.cardText}>
                  <div className={styles.cardTitle}>Nedeljni Newsletter</div>
                  <div className={styles.cardSub}>Svakog ponedeljka</div>
                </div>
              </div>

              <div className={styles.statsCard}>
                <div className={styles.statNumber}>100+</div>
                <div className={styles.statLabel}>Pretplatnika</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}