'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaShoppingCart, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage } from 'react-icons/fa'
import api from '@/app/utils/api'
import styles from './editShop.module.css'

export default function UpravljanjeShop() {
  const { user } = useAuth()
  const router = useRouter()
  const [proizvodi, setProizvodi] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedProizvod, setSelectedProizvod] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  
  const [formData, setFormData] = useState({
    naziv: '',
    cena: '',
    opis: '',
    slika_url: '',
    zalihe: 0,
    popularnost: 0
  })

  useEffect(() => {
    if (!user || user.uloga !== 'admin') {
      router.push('/login')
      return
    }
    fetchProizvodi()
  }, [user, router])

  const fetchProizvodi = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/proizvodi')
      setProizvodi(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      setMessage('Greška pri učitavanju proizvoda')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProizvod = (proizvod) => {
    setSelectedProizvod(proizvod)
    setFormData({
      naziv: proizvod.naziv || '',
      cena: proizvod.cena || '',
      opis: proizvod.opis || '',
      slika_url: proizvod.slika_url || '',
      zalihe: proizvod.zalihe || 0,
      popularnost: proizvod.popularnost || 0
    })
    setIsEditing(false)
    setIsAdding(false)
  }

  const handleAddNew = () => {
    setSelectedProizvod(null)
    setFormData({
      naziv: '',
      cena: '',
      opis: '',
      slika_url: '',
      zalihe: 0,
      popularnost: 0
    })
    setIsAdding(true)
    setIsEditing(true)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!formData.naziv.trim() || !formData.cena) {
      setMessage('Naziv i cena su obavezni')
      return
    }

    setSaving(true)
    try {
      if (isAdding) {
        await api.post('/api/proizvodi', formData)
        setMessage('Proizvod uspešno dodat!')
        await fetchProizvodi()
        setIsAdding(false)
        setIsEditing(false)
      } else if (selectedProizvod) {
        await api.put(`/api/proizvodi/${selectedProizvod.id}`, formData)
        setMessage('Proizvod uspešno ažuriran!')
        await fetchProizvodi()
        const updatedProizvod = await api.get(`/api/proizvodi/${selectedProizvod.id}`)
        setSelectedProizvod(updatedProizvod.data)
        setIsEditing(false)
      }
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving product:', error)
      setMessage(error.response?.data?.message || 'Greška prilikom čuvanja')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj proizvod?')) {
      return
    }

    try {
      await api.delete(`/api/proizvodi/${id}`)
      setMessage('Proizvod uspešno obrisan!')
      await fetchProizvodi()
      if (selectedProizvod?.id === id) {
        setSelectedProizvod(null)
      }
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error deleting product:', error)
      setMessage('Greška prilikom brisanja')
    }
  }

  const formatCena = (cena) => {
    return new Intl.NumberFormat('sr-RS', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cena)
  }

  if (!user || user.uloga !== 'admin') {
    return null
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/admin" className={styles.backBtn}>
            <FaArrowLeft /> Nazad
          </Link>
          <h1>Upravljanje Proizvodima</h1>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{proizvodi.length}</span>
            <span className={styles.statLabel}>Ukupno proizvoda</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {proizvodi.reduce((sum, p) => sum + p.zalihe, 0)}
            </span>
            <span className={styles.statLabel}>Ukupno zaliha</span>
          </div>
        </div>

        <button className={styles.addBtn} onClick={handleAddNew}>
          <FaPlus /> Dodaj novi proizvod
        </button>
      </header>

      <div className={styles.mainContent}>
        {/* Lista proizvoda */}
        <div className={styles.proizvodiList}>
          {loading ? (
            <div className={styles.loading}>Učitavanje...</div>
          ) : proizvodi.length === 0 ? (
            <div className={styles.empty}>Nema proizvoda</div>
          ) : (
            <div className={styles.list}>
              {proizvodi.map(proizvod => (
                <div
                  key={proizvod.id}
                  className={`${styles.proizvodItem} ${selectedProizvod?.id === proizvod.id ? styles.active : ''}`}
                  onClick={() => handleSelectProizvod(proizvod)}
                >
                  <div className={styles.proizvodInfo}>
                    <strong>{proizvod.naziv}</strong>
                    <span>{formatCena(proizvod.cena)} RSD</span>
                    <small>Zalihe: {proizvod.zalihe}</small>
                  </div>
                  <button
                    className={styles.deleteIconBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(proizvod.id)
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalji proizvoda */}
        <div className={styles.proizvodDetails}>
          {!selectedProizvod && !isAdding ? (
            <div className={styles.placeholder}>
              <FaShoppingCart />
              <p>Izaberite proizvod ili dodajte novi</p>
            </div>
          ) : (
            <div className={styles.form}>
              <div className={styles.formHeader}>
                <h2>
                  <FaShoppingCart />
                  {isAdding ? 'Novi proizvod' : (isEditing ? 'Izmena proizvoda' : 'Detalji proizvoda')}
                </h2>
                {!isAdding && !isEditing && (
                  <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                    <FaEdit /> Izmeni
                  </button>
                )}
              </div>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>
                    Naziv <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.naziv}
                    onChange={(e) => handleInputChange('naziv', e.target.value)}
                    disabled={!isEditing && !isAdding}
                    placeholder="DIJALOG Majica"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>
                    Cena (RSD) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cena}
                    onChange={(e) => handleInputChange('cena', e.target.value)}
                    disabled={!isEditing && !isAdding}
                    placeholder="1999.00"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Zalihe</label>
                  <input
                    type="number"
                    value={formData.zalihe}
                    onChange={(e) => handleInputChange('zalihe', e.target.value)}
                    disabled={!isEditing && !isAdding}
                    placeholder="50"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Popularnost</label>
                  <input
                    type="number"
                    value={formData.popularnost}
                    onChange={(e) => handleInputChange('popularnost', e.target.value)}
                    disabled={!isEditing && !isAdding}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>
                  <FaImage /> URL slike
                </label>
                <input
                  type="text"
                  value={formData.slika_url}
                  onChange={(e) => handleInputChange('slika_url', e.target.value)}
                  disabled={!isEditing && !isAdding}
                  placeholder="/Assets/proizvod.jpg"
                />
                {formData.slika_url && (
                  <div className={styles.imagePreview}>
                    <img 
                      src={formData.slika_url} 
                      alt="Preview"
                      onError={(e) => {
                        e.target.src = '/Assets/placeholder.jpg'
                      }}
                    />
                  </div>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Opis</label>
                <textarea
                  value={formData.opis}
                  onChange={(e) => handleInputChange('opis', e.target.value)}
                  disabled={!isEditing && !isAdding}
                  placeholder="Opis proizvoda..."
                  rows={6}
                />
              </div>

              {(isEditing || isAdding) && (
                <div className={styles.formActions}>
                  <button
                    className={styles.saveBtn}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Čuvanje...' : (
                      <>
                        <FaSave /> Sačuvaj
                      </>
                    )}
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setIsEditing(false)
                      setIsAdding(false)
                      if (selectedProizvod) {
                        handleSelectProizvod(selectedProizvod)
                      }
                    }}
                  >
                    <FaTimes /> Otkaži
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className={`${styles.message} ${
          message.includes('uspešno') ? styles.success : styles.error
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}