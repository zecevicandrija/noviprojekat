'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaShoppingCart, FaBoxOpen, FaFire, FaLinkedin, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'
import api from '@/app/utils/api'
import styles from './proizvod.module.css'

export default function ProizvodPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const [proizvod, setProizvod] = useState(null)
  const [loading, setLoading] = useState(true)
  const [kolicina, setKolicina] = useState(1)

  useEffect(() => {
    if (id) {
      fetchProizvod()
    }
  }, [id])

  const fetchProizvod = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/proizvodi/${id}`)
      setProizvod(response.data)
    } catch (error) {
      console.error('Error fetching product:', error)
      if (error.response?.status === 404) {
        router.push('/shop')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatCena = (cena) => {
    return new Intl.NumberFormat('sr-RS', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cena)
  }

  const handleKolicinaChange = (value) => {
    const newValue = Math.max(1, Math.min(proizvod.zalihe, value))
    setKolicina(newValue)
  }

  const handleDodajUKorpu = () => {
  const korpa = JSON.parse(localStorage.getItem('korpa') || '[]')
  
  const postojiIndex = korpa.findIndex(item => item.id === proizvod.id)
  
  if (postojiIndex > -1) {
    korpa[postojiIndex].kolicina += kolicina
  } else {
    korpa.push({
      id: proizvod.id,
      naziv: proizvod.naziv,
      cena: proizvod.cena,
      slika_url: proizvod.slika_url,
      kolicina: kolicina
    })
  }
  
  localStorage.setItem('korpa', JSON.stringify(korpa))
  router.push('/korpa')
}

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Učitavanje proizvoda...</div>
      </div>
    )
  }

  if (!proizvod) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>Proizvod nije pronađen</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/shop" className={styles.backBtn}>
          <FaArrowLeft /> Nazad na Shop
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          <div className={styles.imageWrapper}>
            <img 
              src={proizvod.slika_url} 
              alt={proizvod.naziv}
              onError={(e) => {
                e.target.src = '/Assets/placeholder.jpg'
              }}
            />
            {proizvod.zalihe < 10 && proizvod.zalihe > 0 && (
              <div className={styles.lowStockBadge}>
                Samo {proizvod.zalihe} na lageru!
              </div>
            )}
            {proizvod.zalihe === 0 && (
              <div className={styles.outOfStockBadge}>
                Nema na lageru
              </div>
            )}
          </div>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.productHeader}>
            <h1 className={styles.productName}>{proizvod.naziv}</h1>
            
            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <FaBoxOpen />
                <span>Zalihe: <strong>{proizvod.zalihe}</strong></span>
              </div>
              {proizvod.popularnost > 0 && (
                <div className={styles.metaItem}>
                  <FaFire />
                  <span>Popularnost: <strong>{proizvod.popularnost}</strong></span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.priceSection}>
            <span className={styles.price}>{formatCena(proizvod.cena)} RSD</span>
          </div>

          {proizvod.opis && (
            <div className={styles.description}>
              <h3>Opis</h3>
              <p>{proizvod.opis}</p>
            </div>
          )}

          <div className={styles.purchaseSection}>
            <div className={styles.quantitySelector}>
              <label>Količina:</label>
              <div className={styles.quantityControls}>
                <button 
                  onClick={() => handleKolicinaChange(kolicina - 1)}
                  disabled={kolicina <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={kolicina}
                  onChange={(e) => handleKolicinaChange(parseInt(e.target.value) || 1)}
                  min="1"
                  max={proizvod.zalihe}
                />
                <button 
                  onClick={() => handleKolicinaChange(kolicina + 1)}
                  disabled={kolicina >= proizvod.zalihe}
                >
                  +
                </button>
              </div>
            </div>

            <button 
              className={styles.addToCartBtn}
              onClick={handleDodajUKorpu}
              disabled={proizvod.zalihe === 0}
            >
              <FaShoppingCart />
              {proizvod.zalihe === 0 ? 'Nedostupno' : 'Dodaj u korpu'}
            </button>
          </div>

          <div className={styles.totalPrice}>
            <span>Ukupno:</span>
            <strong>{formatCena(proizvod.cena * kolicina)} RSD</strong>
          </div>
        </div>
      </div>
    </div>
  )
}