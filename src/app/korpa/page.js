'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaArrowLeft, FaTrash, FaShoppingCart, FaTag } from 'react-icons/fa'
import api from '../utils/api'
import styles from './korpa.module.css'

export default function Korpa() {
  const router = useRouter()
  const [korpaItems, setKorpaItems] = useState([])
  const [popustKod, setPopustKod] = useState('')
  const [popust, setPopust] = useState(null)
  const [popustError, setPopustError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadKorpa()
    loadPopust() // Učitaj sačuvan popust
  }, [])

  const loadKorpa = () => {
    const savedKorpa = localStorage.getItem('korpa')
    if (savedKorpa) {
      setKorpaItems(JSON.parse(savedKorpa))
    }
  }

  const loadPopust = () => {
    const savedPopust = localStorage.getItem('popust')
    if (savedPopust) {
      setPopust(JSON.parse(savedPopust))
    }
  }

  const saveKorpa = (items) => {
    localStorage.setItem('korpa', JSON.stringify(items))
    setKorpaItems(items)
  }

  const updateKolicina = (proizvodId, novaKolicina) => {
    const updatedItems = korpaItems.map(item =>
      item.id === proizvodId ? { ...item, kolicina: Math.max(1, novaKolicina) } : item
    )
    saveKorpa(updatedItems)
  }

  const removeItem = (proizvodId) => {
    const updatedItems = korpaItems.filter(item => item.id !== proizvodId)
    saveKorpa(updatedItems)
  }

  const primenPopust = async () => {
    if (!popustKod.trim()) return
    
    setLoading(true)
    setPopustError('')
    
    try {
      const response = await api.get(`/api/popusti/proveri/${popustKod}`)
      
      const popustInfo = {
        id: response.data.id,
        kod: popustKod.toUpperCase(),
        procenat: response.data.procenat,
        opis: response.data.opis
      }
      
      setPopust(popustInfo)
      localStorage.setItem('popust', JSON.stringify(popustInfo))
    } catch (error) {
      setPopustError(error.response?.data?.message || 'Neispravan kod')
      setPopust(null)
    } finally {
      setLoading(false)
    }
  }

  const ukloniPopust = () => {
    setPopust(null)
    setPopustKod('')
    setPopustError('')
    localStorage.removeItem('popust')
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

  const handleNaruci = () => {
    // Idi na stranicu za unos podataka
    router.push('/podaci')
  }

  if (korpaItems.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <FaShoppingCart />
          <h2>Vaša korpa je prazna</h2>
          <Link href="/shop" className={styles.shopBtn}>
            Nazad na Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/shop" className={styles.backBtn}>
          <FaArrowLeft /> Nastavi kupovinu
        </Link>
        <h1><FaShoppingCart /></h1>
      </div>

      <div className={styles.content}>
        <div className={styles.itemsList}>
          {korpaItems.map(item => (
            <div key={item.id} className={styles.item}>
              <img src={item.slika_url} alt={item.naziv} />
              <div className={styles.itemInfo}>
                <h3>{item.naziv}</h3>
                <p className={styles.price}>{formatCena(item.cena)} RSD</p>
              </div>
              <div className={styles.quantity}>
                <button onClick={() => updateKolicina(item.id, item.kolicina - 1)}>-</button>
                <span>{item.kolicina}</span>
                <button onClick={() => updateKolicina(item.id, item.kolicina + 1)}>+</button>
              </div>
              <div className={styles.itemTotal}>
                {formatCena(item.cena * item.kolicina)} RSD
              </div>
              <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <h2>Pregled narudžbine</h2>
          
          <div className={styles.popustSection}>
            <label>
              <FaTag /> Kod za popust
            </label>
            {!popust ? (
              <div className={styles.popustInput}>
                <input
                  type="text"
                  value={popustKod}
                  onChange={(e) => setPopustKod(e.target.value.toUpperCase())}
                  placeholder="Unesite kod"
                />
                <button onClick={primenPopust} disabled={loading}>
                  {loading ? 'Proverava...' : 'Primeni'}
                </button>
              </div>
            ) : (
              <div className={styles.popustApplied}>
                <div className={styles.popustInfo}>
                  <strong>{popust.kod}</strong>
                  <span>{popust.opis}</span>
                  <span className={styles.popustProcenat}>-{popust.procenat}%</span>
                </div>
                <button onClick={ukloniPopust} className={styles.removePopust}>Ukloni</button>
              </div>
            )}
            {popustError && <p className={styles.error}>{popustError}</p>}
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

          <button className={styles.checkoutBtn} onClick={handleNaruci}>
            Nastavi ka plaćanju
          </button>
        </div>
      </div>
    </div>
  )
}