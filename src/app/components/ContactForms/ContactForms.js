'use client'

import { useState } from 'react'
import styles from './ContactForms.module.css'

export default function ContactForms() {
  const [activeForm, setActiveForm] = useState('general')
  const [formData, setFormData] = useState({
    general: { name: '', email: '', question: '' },
    sponsorship: { name: '', email: '', offer: '' },
    guest: { name: '', email: '', about: '', reason: '' }
  })
  const [status, setStatus] = useState(null)

  const handleInputChange = (formType, field, value) => {
    setFormData(prev => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: 'loading', message: 'Slanje...' })
    
    try {
      // Simulacija slanja podataka
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStatus({ type: 'success', message: 'Poruka je uspešno poslata!' })
      
      // Reset forme
      setFormData({
        general: { name: '', email: '', question: '' },
        sponsorship: { name: '', email: '', offer: '' },
        guest: { name: '', email: '', about: '', reason: '' }
      })
    } catch (error) {
      setStatus({ type: 'error', message: 'Došlo je do greške. Pokušajte ponovo.' })
    }
  }

  const renderForm = () => {
    switch (activeForm) {
      case 'general':
        return (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="Ime i prezime"
                value={formData.general.name}
                onChange={(e) => handleInputChange('general', 'name', e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="email"
                placeholder="Email adresa"
                value={formData.general.email}
                onChange={(e) => handleInputChange('general', 'email', e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <textarea
                placeholder="Vaše pitanje ili poruka"
                rows="4"
                value={formData.general.question}
                onChange={(e) => handleInputChange('general', 'question', e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className={styles.submitBtn}>Pošalji poruku</button>
          </form>
        )

      case 'sponsorship':
        return (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="Ime i prezime"
                value={formData.sponsorship.name}
                onChange={(e) => handleInputChange('sponsorship', 'name', e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="email"
                placeholder="Email adresa"
                value={formData.sponsorship.email}
                onChange={(e) => handleInputChange('sponsorship', 'email', e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <textarea
                placeholder="Vaša ponuda za saradnju"
                rows="4"
                value={formData.sponsorship.offer}
                onChange={(e) => handleInputChange('sponsorship', 'offer', e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className={styles.submitBtn}>Pošalji ponudu</button>
          </form>
        )

      case 'guest':
        return (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="Ime i prezime"
                value={formData.guest.name}
                onChange={(e) => handleInputChange('guest', 'name', e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="email"
                placeholder="Email adresa"
                value={formData.guest.email}
                onChange={(e) => handleInputChange('guest', 'email', e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <textarea
                placeholder="Nešto o Vama"
                rows="3"
                value={formData.guest.about}
                onChange={(e) => handleInputChange('guest', 'about', e.target.value)}
                required
              ></textarea>
            </div>
            <div className={styles.formGroup}>
              <textarea
                placeholder="Zašto želite da gostujete?"
                rows="3"
                value={formData.guest.reason}
                onChange={(e) => handleInputChange('guest', 'reason', e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className={styles.submitBtn}>Pošalji prijavu</button>
          </form>
        )

      default:
        return null
    }
  }

  return (
    <section className={styles.contactSection}>
      <div className={styles.contactInner}>
        <h3 className={styles.sectionTitle}>Kontaktirajte nas</h3>
        
        <div className={styles.tabButtons}>
          <button
            className={`${styles.tabButton} ${activeForm === 'general' ? styles.active : ''}`}
            onClick={() => setActiveForm('general')}
          >
            Generalno
          </button>
          <button
            className={`${styles.tabButton} ${activeForm === 'sponsorship' ? styles.active : ''}`}
            onClick={() => setActiveForm('sponsorship')}
          >
            Saradnja/Sponzorstvo
          </button>
          <button
            className={`${styles.tabButton} ${activeForm === 'guest' ? styles.active : ''}`}
            onClick={() => setActiveForm('guest')}
          >
            Gostovanje
          </button>
        </div>

        <div className={styles.formContainer}>
          {renderForm()}
          
          {status && (
            <div className={`${styles.status} ${styles[status.type]}`}>
              {status.message}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}