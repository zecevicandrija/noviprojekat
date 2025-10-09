'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaUser, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaLinkedin, FaTwitter, FaInstagram, FaYoutube, FaImage, FaSearch } from 'react-icons/fa'
import api from '@/app/utils/api'
import styles from './gosti.module.css'

export default function AdminGosti() {
  const { user } = useAuth()
  const router = useRouter()
  const [gosti, setGosti] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGost, setSelectedGost] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  
  const [formData, setFormData] = useState({
    ime_prezime: '',
    pozicija: '',
    kompanija: '',
    slika_url: '',
    biografija: '',
    linkedin_url: '',
    instagram_url: '',
    twitter_url: '',
    youtube_url: '',
    dostignuce_1: '',
    dostignuce_2: '',
    dostignuce_3: ''
  })

  useEffect(() => {
    if (!user || user.uloga !== 'admin') {
      router.push('/')
      return
    }
    fetchGosti()
  }, [user, router])

  const fetchGosti = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/gosti')
      setGosti(response.data)
    } catch (error) {
      console.error('Error fetching gosti:', error)
      setMessage('Greška pri učitavanju gostiju')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectGost = async (gost) => {
    setSelectedGost(gost)
    setFormData({
      ime_prezime: gost.ime_prezime || '',
      pozicija: gost.pozicija || '',
      kompanija: gost.kompanija || '',
      slika_url: gost.slika_url || '',
      biografija: gost.biografija || '',
      linkedin_url: gost.linkedin_url || '',
      instagram_url: gost.instagram_url || '',
      twitter_url: gost.twitter_url || '',
      youtube_url: gost.youtube_url || '',
      dostignuce_1: gost.dostignuce_1 || '',
      dostignuce_2: gost.dostignuce_2 || '',
      dostignuce_3: gost.dostignuce_3 || ''
    })
    setIsEditing(false)
    setIsAdding(false)
  }

  const handleAddNew = () => {
    setSelectedGost(null)
    setFormData({
      ime_prezime: '',
      pozicija: '',
      kompanija: '',
      slika_url: '',
      biografija: '',
      linkedin_url: '',
      instagram_url: '',
      twitter_url: '',
      youtube_url: '',
      dostignuce_1: '',
      dostignuce_2: '',
      dostignuce_3: ''
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
    if (!formData.ime_prezime.trim()) {
      setMessage('Ime i prezime su obavezni')
      return
    }

    setSaving(true)
    try {
      if (isAdding) {
        // Dodaj novog gosta
        const response = await api.post('/api/gosti', formData)
        setMessage('Gost uspešno dodat!')
        await fetchGosti()
        setIsAdding(false)
        setIsEditing(false)
      } else if (selectedGost) {
        // Ažuriraj postojećeg gosta
        await api.put(`/api/gosti/${selectedGost.id}`, formData)
        setMessage('Gost uspešno ažuriran!')
        await fetchGosti()
        // Osvježi selektovani gost
        const updatedGost = await api.get(`/api/gosti/${selectedGost.id}`)
        setSelectedGost(updatedGost.data)
        setIsEditing(false)
      }
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving gost:', error)
      setMessage(error.response?.data?.message || 'Greška prilikom čuvanja')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovog gosta?')) {
      return
    }

    try {
      await api.delete(`/api/gosti/${id}`)
      setMessage('Gost uspešno obrisan!')
      await fetchGosti()
      if (selectedGost?.id === id) {
        setSelectedGost(null)
      }
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error deleting gost:', error)
      setMessage('Greška prilikom brisanja')
    }
  }

  const filteredGosti = gosti.filter(gost =>
    gost.ime_prezime.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <h1>Upravljanje Gostima</h1>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{gosti.length}</span>
            <span className={styles.statLabel}>Ukupno gostiju</span>
          </div>
        </div>

        <button className={styles.addBtn} onClick={handleAddNew}>
          <FaPlus /> Dodaj novog gosta
        </button>
      </header>

      <div className={styles.mainContent}>
        {/* Lista gostiju */}
        <div className={styles.gostiList}>
          <div className={styles.searchBox}>
            <FaSearch />
            <input
              type="text"
              placeholder="Pretraži goste..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className={styles.loading}>Učitavanje...</div>
          ) : filteredGosti.length === 0 ? (
            <div className={styles.empty}>Nema gostiju</div>
          ) : (
            <div className={styles.list}>
              {filteredGosti.map(gost => (
                <div
                  key={gost.id}
                  className={`${styles.gostItem} ${selectedGost?.id === gost.id ? styles.active : ''}`}
                  onClick={() => handleSelectGost(gost)}
                >
                  <div className={styles.gostInfo}>
                    <strong>{gost.ime_prezime}</strong>
                    {gost.pozicija && <span>{gost.pozicija}</span>}
                    {gost.kompanija && <small>{gost.kompanija}</small>}
                  </div>
                  <button
                    className={styles.deleteIconBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(gost.id)
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalji gosta */}
        <div className={styles.gostDetails}>
          {!selectedGost && !isAdding ? (
            <div className={styles.placeholder}>
              <FaUser />
              <p>Izaberite gosta ili dodajte novog</p>
            </div>
          ) : (
            <div className={styles.form}>
              <div className={styles.formHeader}>
                <h2>
                  <FaUser />
                  {isAdding ? 'Novi gost' : (isEditing ? 'Izmena gosta' : 'Detalji gosta')}
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
                    Ime i prezime <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ime_prezime}
                    onChange={(e) => handleInputChange('ime_prezime', e.target.value)}
                    disabled={!isEditing && !isAdding}
                    placeholder="Ime Prezime"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Pozicija</label>
                  <input
                    type="text"
                    value={formData.pozicija}
                    onChange={(e) => handleInputChange('pozicija', e.target.value)}
                    disabled={!isEditing && !isAdding}
                    placeholder="CEO, Osnivač..."
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Kompanija</label>
                  <input
                    type="text"
                    value={formData.kompanija}
                    onChange={(e) => handleInputChange('kompanija', e.target.value)}
                    disabled={!isEditing && !isAdding}
                    placeholder="Naziv kompanije"
                  />
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
                    placeholder="/Assets/gost.jpg"
                  />
                  {formData.slika_url && (
                    <div className={styles.imagePreview}>
                      <img src={formData.slika_url} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Biografija</label>
                <textarea
                  value={formData.biografija}
                  onChange={(e) => handleInputChange('biografija', e.target.value)}
                  disabled={!isEditing && !isAdding}
                  placeholder="Kratka biografija gosta..."
                  rows={6}
                />
              </div>

              <div className={styles.sectionTitle}>Ključna dostignuća</div>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Dostignuće 1</label>
                  <input
                    type="text"
                    value={formData.dostignuce_1}
                    onChange={(e) => handleInputChange('dostignuce_1', e.target.value)}
                    disabled={!isEditing && !isAdding}
                    placeholder="Prvo dostignuće"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Dostignuće 2</label>
                  <input
                    type="text"
                    value={formData.dostignuce_2}
                    onChange={(e) => handleInputChange('dostignuce_2', e.target.value)}
                    disabled={!isEditing && !isAdding}
                    placeholder="Drugo dostignuće"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Dostignuće 3</label>
                  <input
                    type="text"
                    value={formData.dostignuce_3}
                    onChange={(e) => handleInputChange('dostignuce_3', e.target.value)}
                    disabled={!isEditing && !isAdding}
                    placeholder="Treće dostignuće"
                  />
                </div>
              </div>

              <div className={styles.sectionTitle}>Društvene mreže</div>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>
                    <FaLinkedin /> LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    disabled={!isEditing && !isAdding}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>
                    <FaTwitter /> Twitter/X
                  </label>
                  <input
                    type="url"
                    value={formData.twitter_url}
                    onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                    disabled={!isEditing && !isAdding}
                    placeholder="https://twitter.com/..."
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>
                    <FaInstagram /> Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                    disabled={!isEditing && !isAdding}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>
                    <FaYoutube /> YouTube
                  </label>
                  <input
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                    disabled={!isEditing && !isAdding}
                    placeholder="https://youtube.com/@..."
                  />
                </div>
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
                      if (selectedGost) {
                        handleSelectGost(selectedGost)
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