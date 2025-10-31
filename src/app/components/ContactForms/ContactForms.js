'use client'

import { useState } from 'react'
import styles from './ContactForms.module.css'
import api from '@/app/utils/api'

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
      let endpoint = ''
      let data = {}

      // Odaberi endpoint i podatke na osnovu aktivne forme
      if (activeForm === 'general') {
        endpoint = '/api/email/general'
        data = formData.general
      } else if (activeForm === 'sponsorship') {
        endpoint = '/api/email/sponsorship'
        data = formData.sponsorship
      } else if (activeForm === 'guest') {
        endpoint = '/api/email/guest'
        data = formData.guest
      }

      // Pošalji podatke na backend
      const response = await api.post(endpoint, data)
      
      setStatus({ type: 'success', message: response.data.message })
      
      // Reset forme nakon 3 sekunde
      setTimeout(() => {
        setFormData({
          general: { name: '', email: '', question: '' },
          sponsorship: { name: '', email: '', offer: '' },
          guest: { name: '', email: '', about: '', reason: '' }
        })
        setStatus(null)
      }, 3000)

    } catch (error) {
      console.error('Error:', error)
      const errorMessage = error.response?.data?.message || 'Došlo je do greške. Pokušajte ponovo.'
      setStatus({ type: 'error', message: errorMessage })
      
      // Ukloni error nakon 5 sekundi
      setTimeout(() => {
        setStatus(null)
      }, 5000)
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
                disabled={status?.type === 'loading'}
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="email"
                placeholder="Email adresa"
                value={formData.general.email}
                onChange={(e) => handleInputChange('general', 'email', e.target.value)}
                required
                disabled={status?.type === 'loading'}
              />
            </div>
            <div className={styles.formGroup}>
              <textarea
                placeholder="Vaše pitanje ili poruka"
                rows="4"
                value={formData.general.question}
                onChange={(e) => handleInputChange('general', 'question', e.target.value)}
                required
                disabled={status?.type === 'loading'}
              ></textarea>
            </div>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={status?.type === 'loading'}
            >
              {status?.type === 'loading' ? 'Šaljem...' : 'Pošalji poruku'}
            </button>
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
                disabled={status?.type === 'loading'}
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="email"
                placeholder="Email adresa"
                value={formData.sponsorship.email}
                onChange={(e) => handleInputChange('sponsorship', 'email', e.target.value)}
                required
                disabled={status?.type === 'loading'}
              />
            </div>
            <div className={styles.formGroup}>
              <textarea
                placeholder="Vaša ponuda za saradnju"
                rows="4"
                value={formData.sponsorship.offer}
                onChange={(e) => handleInputChange('sponsorship', 'offer', e.target.value)}
                required
                disabled={status?.type === 'loading'}
              ></textarea>
            </div>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={status?.type === 'loading'}
            >
              {status?.type === 'loading' ? 'Šaljem...' : 'Pošalji ponudu'}
            </button>
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
                disabled={status?.type === 'loading'}
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="email"
                placeholder="Email adresa"
                value={formData.guest.email}
                onChange={(e) => handleInputChange('guest', 'email', e.target.value)}
                required
                disabled={status?.type === 'loading'}
              />
            </div>
            <div className={styles.formGroup}>
              <textarea
                placeholder="Nešto o Vama"
                rows="3"
                value={formData.guest.about}
                onChange={(e) => handleInputChange('guest', 'about', e.target.value)}
                required
                disabled={status?.type === 'loading'}
              ></textarea>
            </div>
            <div className={styles.formGroup}>
              <textarea
                placeholder="Zašto želite da gostujete?"
                rows="3"
                value={formData.guest.reason}
                onChange={(e) => handleInputChange('guest', 'reason', e.target.value)}
                required
                disabled={status?.type === 'loading'}
              ></textarea>
            </div>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={status?.type === 'loading'}
            >
              {status?.type === 'loading' ? 'Šaljem...' : 'Pošalji prijavu'}
            </button>
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
            disabled={status?.type === 'loading'}
          >
            Generalno
          </button>
          <button
            className={`${styles.tabButton} ${activeForm === 'sponsorship' ? styles.active : ''}`}
            onClick={() => setActiveForm('sponsorship')}
            disabled={status?.type === 'loading'}
          >
            Saradnja/Sponzorstvo
          </button>
          <button
            className={`${styles.tabButton} ${activeForm === 'guest' ? styles.active : ''}`}
            onClick={() => setActiveForm('guest')}
            disabled={status?.type === 'loading'}
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