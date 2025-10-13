'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import styles from './Pitanja.module.css'
import { FaQuestionCircle, FaPaperPlane, FaLinkedin, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'
import api from '@/app/utils/api'

export default function Pitanja() {
  const [pitanje, setPitanje] = useState('')
  const [ime, setIme] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [imageCardHeight, setImageCardHeight] = useState('auto')
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [loading, setLoading] = useState(true)
  const [epizodaData, setEpizodaData] = useState(null)
  
  const formRef = useRef(null)
  const infoRef = useRef(null)
  const guestCardRef = useRef(null)
  const imageCardRef = useRef(null)

  // Fetch podataka o sledećoj epizodi
  useEffect(() => {
    const fetchEpizodaData = async () => {
      try {
        const response = await api.get('/api/sledeceEpizode/sledeca-epizoda')
        setEpizodaData(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching epizoda data:', error)
        setLoading(false)
      }
    }

    fetchEpizodaData()
  }, [])

  const calculateTimeLeft = () => {
    if (!epizodaData?.datumEpizode) return

    const targetDate = new Date(epizodaData.datumEpizode)
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
    if (!epizodaData) return

    const timer = setInterval(() => {
      calculateTimeLeft()
    }, 1000)

    calculateTimeLeft()
    return () => clearInterval(timer)
  }, [epizodaData])

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
  }, [message, loading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!pitanje.trim()) {
      setMessage('Molimo unesite vaše pitanje')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await api.post('/api/pitanja', {
        ime: ime.trim() || 'Anonimno',
        pitanje: pitanje.trim()
      })
      
      if (response.status === 201) {
        setMessage('Hvala vam! Vaše pitanje je uspešno poslato.')
        setPitanje('')
        setIme('')
        
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

  // Loading state
  if (loading) {
    return (
      <section className={styles.pitanja}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <p>Učitavanje...</p>
          </div>
        </div>
      </section>
    )
  }

  // No data state
  if (!epizodaData) {
    return (
      <section className={styles.pitanja}>
        <div className={styles.container}>
          <div className={styles.header}>
            <FaQuestionCircle className={styles.icon} />
            <h3 className={styles.title}>Postavite pitanje novom gostu</h3>
            <p className={styles.subtitle}>
              Trenutno nema zakazane sledeće epizode. Pratite nas za najnovije vesti!
            </p>
          </div>
        </div>
      </section>
    )
  }

  const gost = epizodaData.gost

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
                  src={gost.slika || '/Assets/dijalog_high.jpg'}
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

                {gost.dostignuca && gost.dostignuca.length > 0 && (
                  <div className={styles.achievements}>
                    <h6>Ključna dostignuća:</h6>
                    <ul>
                      {gost.dostignuca.map((dostignuce, index) => (
                        <li key={index}>{dostignuce}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={styles.socialLinks}>
                  <p>Pratite ga na:</p>
                  <div className={styles.socialIcons}>
                    {gost.socijalniMreza.linkedin && (
                      <a href={gost.socijalniMreza.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <FaLinkedin />
                      </a>
                    )}
                    {gost.socijalniMreza.twitter && (
                      <a href={gost.socijalniMreza.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                        <FaTwitter />
                      </a>
                    )}
                    {gost.socijalniMreza.instagram && (
                      <a href={gost.socijalniMreza.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <FaInstagram />
                      </a>
                    )}
                    {gost.socijalniMreza.youtube && (
                      <a href={gost.socijalniMreza.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                        <FaYoutube />
                      </a>
                    )}
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