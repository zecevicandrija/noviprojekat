'use client'

import { useState, useEffect } from 'react'
import { FaShoppingCart, FaFilter, FaSortAmountDown, FaSortAmountUp, FaFire } from 'react-icons/fa'
import Link from 'next/link'
import api from '../utils/api'
import styles from './shop.module.css'

export default function Shop() {
  const [proizvodi, setProizvodi] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('popularnost') // 'cena-asc', 'cena-desc', 'popularnost'

  useEffect(() => {
    fetchProizvodi()
  }, [])

  const fetchProizvodi = async () => {
  try {
    setLoading(true)
    const response = await api.get('/api/proizvodi')
    setProizvodi(response.data)
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    setLoading(false)
  }
}

  const sortedProizvodi = [...proizvodi].sort((a, b) => {
    switch (sortBy) {
      case 'cena-asc':
        return a.cena - b.cena
      case 'cena-desc':
        return b.cena - a.cena
      case 'popularnost':
        return b.popularnost - a.popularnost
      default:
        return 0
    }
  })

  const formatCena = (cena) => {
    return new Intl.NumberFormat('sr-RS', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cena)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>
            Dijalog Shop
          </h1>
          <p className={styles.subtitle}>
            Zvanična prodavnica DIJALOG podcasta
          </p>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterLabel}>
            <FaFilter /> Sortiraj po:
          </div>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterBtn} ${sortBy === 'popularnost' ? styles.active : ''}`}
              onClick={() => setSortBy('popularnost')}
            >
              <FaFire /> Popularnost
            </button>
            <button
              className={`${styles.filterBtn} ${sortBy === 'cena-asc' ? styles.active : ''}`}
              onClick={() => setSortBy('cena-asc')}
            >
              <FaSortAmountUp /> Cena rastući
            </button>
            <button
              className={`${styles.filterBtn} ${sortBy === 'cena-desc' ? styles.active : ''}`}
              onClick={() => setSortBy('cena-desc')}
            >
              <FaSortAmountDown /> Cena opadajući
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className={styles.loading}>Učitavanje proizvoda...</div>
      ) : sortedProizvodi.length === 0 ? (
        <div className={styles.empty}>
          <FaShoppingCart />
          <p>Trenutno nema proizvoda</p>
        </div>
      ) : (
        <div className={styles.productsGrid}>
          {sortedProizvodi.map((proizvod) => (
            <Link href={`/shop/${proizvod.id}`} key={proizvod.id} className={styles.productCard}>
              <div className={styles.productImage}>
                <img 
                  src={proizvod.slika_url} 
                  alt={proizvod.naziv}
                  onError={(e) => {
                    e.target.src = '/Assets/dijalog_high.jpg'
                  }}
                />
                {proizvod.zalihe < 10 && proizvod.zalihe > 0 && (
                  <div className={styles.lowStock}>
                    Samo {proizvod.zalihe} na lageru!
                  </div>
                )}
                {proizvod.zalihe === 0 && (
                  <div className={styles.outOfStock}>
                    Nema na lageru
                  </div>
                )}
              </div>

              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{proizvod.naziv}</h3>
                <p className={styles.productDesc}>{proizvod.opis}</p>

                <div className={styles.productFooter}>
                  <div className={styles.priceSection}>
                    <span className={styles.price}>
                      {formatCena(proizvod.cena)} RSD
                    </span>
                    <span className={styles.stock}>
                      Zalihe: <strong>{proizvod.zalihe}</strong>
                    </span>
                  </div>

                  <button 
                    className={styles.addToCartBtn}
                    disabled={proizvod.zalihe === 0}
                  >
                    {proizvod.zalihe === 0 ? 'Nedostupno' : 'Dodaj u korpu'}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}