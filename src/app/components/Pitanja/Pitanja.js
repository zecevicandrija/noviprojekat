'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import styles from './Pitanja.module.css'
import { FaQuestionCircle, FaPaperPlane, FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa'
import api from '@/app/utils/api'

export default function Pitanja() {
  const [pitanje, setPitanje] = useState('')
  const [ime, setIme] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [imageCardHeight, setImageCardHeight] = useState('auto')
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  
  const formRef = useRef(null)
  const infoRef = useRef(null)
  const guestCardRef = useRef(null)
  const imageCardRef = useRef(null)

  const gost = {
    ime: "Radomir Borisavljević",
    pozicija: "Vlasnik KULTUR salona",
    kompanija: "Privatan biznis",
    slika: "/Assets/dijalog_high.jpg",
    opis: "Poznatiji kao Raša, momak 2000. godište koji je svojim primerom pokazao kako mladi mogu da pokrenu svoj biznis. On je pokrenuo frizerski salon KULTUR koji ima 100% - 5 zvezdica na Google Mapama. Raša je neko ko nije ni imao u planu da pokreće svoj biznis, a ni da bude frizer. Međutim njegova priča je neverovatna i pokazuje kako neko ko nema afiniteta ka preduzetništvu i nema nikakve veze, a ni svoje pare - je uspeo. Topla preporuka da ga posetite, a 3 srećna dobitnika koji odgovore... DOBIĆE PO JEDNO ŠIŠANJE BESPLATNO.",
    dostignuca: [
      "Kultur frizerski salon (2+ godine)",
      "5 zvezdica na Google", 
      "Brojni zadovoljni klijenti"
    ],
    socijalniMreza: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com", 
      instagram: "https://instagram.com"
    }
  }

  const calculateTimeLeft = () => {
    const targetDate = new Date('2025-10-10T19:00:00')
    const now = new Date()
    const difference = targetDate - now

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    }
  }

  const calculateImageCardHeight = () => {
    if (formRef.current && infoRef.current && guestCardRef.current && imageCardRef.current) {
      if (window.innerWidth > 968) {
        const formHeight = formRef.current.offsetHeight
        const infoHeight = infoRef.current.offsetHeight
        const guestCardHeight = guestCardRef.current.offsetHeight
        
        const formAndInfoHeight = formHeight + infoHeight + 32
        const neededHeight = guestCardHeight - formAndInfoHeight - 32
        const minHeight = 200
        const finalHeight = Math.max(neededHeight, minHeight)
        
        setImageCardHeight(`${finalHeight}px`)
      } else {
        setImageCardHeight('auto')
      }
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      calculateTimeLeft()
    }, 1000)

    calculateTimeLeft()
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    calculateImageCardHeight()
    
    const handleResize = () => {
      calculateImageCardHeight()
    }
    
    window.addEventListener('resize', handleResize)
    
    const timer = setTimeout(() => {
      calculateImageCardHeight()
    }, 100)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timer)
    }
  }, [message])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!pitanje.trim()) {
      setMessage('Molimo unesite vaše pitanje')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Slanje na backend bez autentifikacije
      const response = await api.post('/api/pitanja', {
        ime: ime.trim() || 'Anonimno',
        pitanje: pitanje.trim()
      })
      
      if (response.status === 201) {
        setMessage('Hvala vam! Vaše pitanje je uspešno poslato.')
        setPitanje('')
        setIme('')
        
        // Skloni poruku nakon 5 sekundi
        setTimeout(() => {
          setMessage('')
        }, 5000)
      }
    } catch (error) {
      console.error('Error submitting question:', error)
      setMessage('Greška prilikom slanja. Pokušajte ponovo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={styles.pitanja}>
      <div className={styles.container}>
        <div className={styles.header}>
          <FaQuestionCircle className={styles.icon} />
          <h3 className={styles.title}>Postavite pitanje novom gostu</h3>
          <p className={styles.subtitle}>
            Imate pitanje za našeg sledećeg gosta? Podelite ga sa nama i možda će biti postavljeno u narednoj epizodi.
          </p>
          <div className={styles.countdown}>
            <p className={styles.countdownLabel}>Sledeća epizoda:</p>
            <div className={styles.countdownTimer}>
              <div className={styles.timeBlock}>
                <span className={styles.timeNumber}>{String(timeLeft.days).padStart(2, '0')}</span>
                <span className={styles.timeUnit}>dana</span>
              </div>
              <span className={styles.timeSeparator}>:</span>
              <div className={styles.timeBlock}>
                <span className={styles.timeNumber}>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className={styles.timeUnit}>sati</span>
              </div>
              <span className={styles.timeSeparator}>:</span>
              <div className={styles.timeBlock}>
                <span className={styles.timeNumber}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className={styles.timeUnit}>minuta</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.leftSide}>
            <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Vaše ime (opciono)"
                  value={ime}
                  onChange={(e) => setIme(e.target.value)}
                  className={styles.nameInput}
                />
              </div>

              <div className={styles.inputGroup}>
                <textarea
                  placeholder="Postavite vaše pitanje ovde..."
                  value={pitanje}
                  onChange={(e) => setPitanje(e.target.value)}
                  className={styles.questionInput}
                  rows={4}
                  required
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Šalje se...</>
                ) : (
                  <>
                    <FaPaperPlane className={styles.btnIcon} />
                    Pošaljite pitanje
                  </>
                )}
              </button>

              {message && (
                <div className={`${styles.message} ${
                  message.includes('Hvala') ? styles.success : styles.error
                }`}>
                  {message}
                </div>
              )}
            </form>

            <div ref={infoRef} className={styles.info}>
              <p>
                💡 <strong>Saveti za dobra pitanja:</strong> Budite konkretni, izbegavajte da/ne pitanja, 
                fokusirajte se na iskustva i uvide gosta.
              </p>
            </div>

            <div 
              ref={imageCardRef}
              className={styles.imageCard} 
              style={{ height: imageCardHeight }}
            >
              <div className={styles.imageCardContent}>
                <h4 className={styles.imageCardTitle}>Dijalog Podcast</h4>
                <div className={styles.imageContainer}>
                  <Image
                    src="/Assets/studio4.png"
                    alt="Dijalog podcast studio"
                    width={240}
                    height={135}
                    className={styles.cardImage}
                  />
                </div>
                <p className={styles.imageCardDescription}>
                  Vaše pitanje može biti deo naše sledeće epizode.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.rightSide}>
            <div ref={guestCardRef} className={styles.guestCard}>
              <div className={styles.guestHeader}>
                <h4>Sledeći gost</h4>
              </div>
              
              <div className={styles.guestImageContainer}>
                <Image
                  src={gost.slika}
                  alt={gost.ime}
                  width={120}
                  height={120}
                  className={styles.guestImage}
                />
              </div>

              <div className={styles.guestInfo}>
                <h5 className={styles.guestName}>{gost.ime}</h5>
                <p className={styles.guestPosition}>{gost.pozicija}</p>
                <p className={styles.guestCompany}>{gost.kompanija}</p>
                
                <div className={styles.guestDescription}>
                  <p>{gost.opis}</p>
                </div>

                <div className={styles.achievements}>
                  <h6>Ključna dostignuća:</h6>
                  <ul>
                    {gost.dostignuca.map((dostignuce, index) => (
                      <li key={index}>{dostignuce}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.socialLinks}>
                  <p>Pratite ga na:</p>
                  <div className={styles.socialIcons}>
                    <a href={gost.socijalniMreza.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                      <FaLinkedin />
                    </a>
                    <a href={gost.socijalniMreza.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                      <FaTwitter />
                    </a>
                    <a href={gost.socijalniMreza.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                      <FaInstagram />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}