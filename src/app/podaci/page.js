'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaShoppingCart, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity, FaMailBulk, FaCheckCircle } from 'react-icons/fa'
import api from '../utils/api'
import styles from './podaci.module.css'

export default function Podaci() {
  const router = useRouter()
  const [korpaItems, setKorpaItems] = useState([])
  const [popust, setPopust] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [formData, setFormData] = useState({
    ime: '',
    prezime: '',
    email: '',
    telefon: '',
    adresa: '',
    grad: '',
    postanski_broj: ''
  })

  useEffect(() => {
    loadKorpa()
    loadPopust()
  }, [])

  const loadKorpa = () => {
    const savedKorpa = localStorage.getItem('korpa')
    if (!savedKorpa || JSON.parse(savedKorpa).length === 0) {
      router.push('/shop')
      return
    }
    setKorpaItems(JSON.parse(savedKorpa))
  }

  const loadPopust = () => {
    const savedPopust = localStorage.getItem('popust')
    if (savedPopust) {
      setPopust(JSON.parse(savedPopust))
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatCena = (cena) => {
    return new Intl.NumberFormat('sr-RS', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cena)
  }

  const subtotal = korpaItems.reduce((sum, item) => sum + (item.cena * item.kolicina), 0)
  const popustIznos = popust ? (subtotal * popust.procenat / 100) : 0
  const total = subtotal - popustIznos

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const transakcijaData = {
        ...formData,
        proizvodi: korpaItems,
        ukupno: total,
        popust_id: popust?.id || null
      }

      const response = await api.post('/api/transakcije', transakcijaData)

      if (response.status === 201) {
        if (popust) {
          await api.post('/api/popusti/iskoristi', { kod: popust.kod })
        }

        localStorage.removeItem('korpa')
        localStorage.removeItem('popust')

        setShowSuccessModal(true)

        // Redirect nakon 3 sekunde
        setTimeout(() => {
          router.push('/shop')
        }, 3000)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert(error.response?.data?.message || 'Greška prilikom kreiranja narudžbine')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/korpa" className={styles.backBtn}>
          <FaArrowLeft /> Nazad na korpu
        </Link>
        <h1>Podaci za dostavu</h1>
      </div>

      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h2>Lični podaci</h2>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>
                  <FaUser /> Ime <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.ime}
                  onChange={(e) => handleInputChange('ime', e.target.value)}
                  required
                  placeholder="Marko"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>
                  <FaUser /> Prezime <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.prezime}
                  onChange={(e) => handleInputChange('prezime', e.target.value)}
                  required
                  placeholder="Marković"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>
                  <FaEnvelope /> Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="marko@example.com"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>
                  <FaPhone /> Telefon <span className={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) => handleInputChange('telefon', e.target.value)}
                  required
                  placeholder="060 123 4567"
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Adresa dostave</h2>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup} style={{gridColumn: '1 / -1'}}>
                <label>
                  <FaMapMarkerAlt /> Adresa <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.adresa}
                  onChange={(e) => handleInputChange('adresa', e.target.value)}
                  required
                  placeholder="Kralja Petra 15"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>
                  <FaCity /> Grad <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.grad}
                  onChange={(e) => handleInputChange('grad', e.target.value)}
                  required
                  placeholder="Beograd"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>
                  <FaMailBulk /> Poštanski broj <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.postanski_broj}
                  onChange={(e) => handleInputChange('postanski_broj', e.target.value)}
                  required
                  placeholder="11000"
                />
              </div>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Slanje...' : 'Potvrdi narudžbinu'}
          </button>
        </form>

        <div className={styles.summary}>
          <h2>Pregled narudžbine</h2>
          
          <div className={styles.items}>
            {korpaItems.map(item => (
              <div key={item.id} className={styles.summaryItem}>
                <span>{item.naziv} x{item.kolicina}</span>
                <span>{formatCena(item.cena * item.kolicina)} RSD</span>
              </div>
            ))}
          </div>

          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Međuzbir:</span>
              <span>{formatCena(subtotal)} RSD</span>
            </div>
            {popust && (
              <div className={styles.totalRow} style={{color: '#4aa3ff'}}>
                <span>Popust ({popust.procenat}%):</span>
                <span>-{formatCena(popustIznos)} RSD</span>
              </div>
            )}
            <div className={styles.totalRow} style={{fontSize: '1.5rem', fontWeight: '700'}}>
              <span>Ukupno:</span>
              <span>{formatCena(total)} RSD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIcon}>
              <FaCheckCircle />
            </div>
            <h2>Narudžbina uspešno poslata!</h2>
            <p>Hvala na poverenju. Uskoro ćemo vas kontaktirati.</p>
            <div className={styles.modalLoader}>
              <div className={styles.spinner}></div>
              <span>Vraćamo vas na shop...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}