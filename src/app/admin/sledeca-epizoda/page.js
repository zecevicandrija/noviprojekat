'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { FaQuestionCircle, FaSave, FaCalendar, FaUser, FaLinkedin, FaTwitter, FaInstagram, FaYoutube, FaImage, FaInfoCircle, FaSearch, FaTimes } from 'react-icons/fa'
import api from '@/app/utils/api'
import styles from './AdminPitanja.module.css'

export default function AdminSledeca() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isNewGuest, setIsNewGuest] = useState(true)
  const [loadingGuestDetails, setLoadingGuestDetails] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [initialData, setInitialData] = useState(null)
  
  const [epizodaData, setEpizodaData] = useState({
    datumEpizode: '',
    gost: {
      id: null,
      ime: '',
      pozicija: '',
      kompanija: '',
      slika: '',
      opis: '',
      dostignuca: ['', '', ''],
      socijalniMreza: {
        linkedin: '',
        twitter: '',
        instagram: '',
        youtube: ''
      }
    }
  })

  useEffect(() => {
    if (!user || user.uloga !== 'admin') {
      router.push('/')
      return
    }
    fetchCurrentData()
  }, [user, router])

  // Sinhronizuj searchQuery sa epizodaData.gost.ime samo na početnom učitavanju
  useEffect(() => {
    if (epizodaData.gost.id && epizodaData.gost.ime && !searchQuery) {
      setSearchQuery(epizodaData.gost.ime)
    }
  }, [epizodaData.gost.id, epizodaData.gost.ime])

  const fetchCurrentData = async () => {
    // NE UČITAVAJ AKO IMA NESAČUVANIH IZMENA
    if (hasUnsavedChanges) {
      console.log('Sprečeno učitavanje - imaš nesačuvane izmene')
      return
    }

    try {
      const response = await api.get('/api/sledeceEpizode/admin/sledeca-epizoda')
      if (response.data && response.data.datumEpizode) {
        // Konvertuj datum za datetime-local input (YYYY-MM-DDTHH:mm)
        const datum = new Date(response.data.datumEpizode)
        const localDateTime = new Date(datum.getTime() - datum.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
        
        setEpizodaData({
          ...response.data,
          datumEpizode: localDateTime
        })
        setInitialData(JSON.parse(JSON.stringify(response.data)))
        if (response.data.gost && response.data.gost.ime) {
          setSearchQuery(response.data.gost.ime)
        }
        setIsNewGuest(false)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    setEpizodaData(prev => ({
      ...prev,
      datumEpizode: e.target.value
    }))
    setHasUnsavedChanges(true)
  }

  const handleGostChange = (field, value) => {
    setEpizodaData(prev => ({
      ...prev,
      gost: {
        ...prev.gost,
        [field]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const handleDostignuceChange = (index, value) => {
    const newDostignuca = [...epizodaData.gost.dostignuca]
    newDostignuca[index] = value
    setEpizodaData(prev => ({
      ...prev,
      gost: {
        ...prev.gost,
        dostignuca: newDostignuca
      }
    }))
    setHasUnsavedChanges(true)
  }

  const handleSocialChange = (platform, value) => {
    setEpizodaData(prev => ({
      ...prev,
      gost: {
        ...prev.gost,
        socijalniMreza: {
          ...prev.gost.socijalniMreza,
          [platform]: value
        }
      }
    }))
    setHasUnsavedChanges(true)
  }

  const handleSearchChange = async (e) => {
    const query = e.target.value
    setSearchQuery(query)

    // Ako postoji izabran gost, resetuj ga
    if (epizodaData.gost.id) {
      setEpizodaData(prev => ({
        ...prev,
        gost: {
          id: null,
          ime: query,
          pozicija: '',
          kompanija: '',
          slika: '',
          opis: '',
          dostignuca: ['', '', ''],
          socijalniMreza: {
            linkedin: '',
            twitter: '',
            instagram: '',
            youtube: ''
          }
        }
      }))
      setIsNewGuest(true)
    } else {
      // Ažuriraj samo ime
      handleGostChange('ime', query)
    }

    if (query.length >= 2) {
      try {
        const response = await api.get(`/api/sledeceEpizode/admin/gosti/search?q=${query}`)
        setSearchResults(response.data)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error searching guests:', error)
      }
    } else {
      setSearchResults([])
      setShowSuggestions(false)
    }
  }

  const fetchGuestDetails = async (guestId) => {
    setLoadingGuestDetails(true)
    try {
      const response = await api.get(`/api/sledeceEpizode/admin/gosti/${guestId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching guest details:', error)
      return null
    } finally {
      setLoadingGuestDetails(false)
    }
  }

  const selectGuest = async (guest) => {
    setShowSuggestions(false)
    setSearchQuery(guest.ime_prezime)
    
    const guestDetails = await fetchGuestDetails(guest.id)
    
    if (guestDetails) {
      setEpizodaData(prev => ({
        ...prev,
        gost: {
          id: guestDetails.id,
          ime: guestDetails.ime,
          pozicija: guestDetails.pozicija || '',
          kompanija: guestDetails.kompanija || '',
          slika: guestDetails.slika || '',
          opis: guestDetails.opis || '',
          dostignuca: guestDetails.dostignuca || ['', '', ''],
          socijalniMreza: guestDetails.socijalniMreza || {
            linkedin: '',
            twitter: '',
            instagram: '',
            youtube: ''
          }
        }
      }))
      setIsNewGuest(false)
      setHasUnsavedChanges(true) // Označimo da je promenjen gost
    }
  }

  const clearGuestSelection = () => {
    setEpizodaData(prev => ({
      ...prev,
      gost: {
        id: null,
        ime: '',
        pozicija: '',
        kompanija: '',
        slika: '',
        opis: '',
        dostignuca: ['', '', ''],
        socijalniMreza: {
          linkedin: '',
          twitter: '',
          instagram: '',
          youtube: ''
        }
      }
    }))
    setSearchQuery('')
    setIsNewGuest(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const response = await api.post('/api/sledeceEpizode/admin/sledeca-epizoda', epizodaData)
      
      if (response.status === 200) {
        setMessage('Podaci uspešno sačuvani!')
        setHasUnsavedChanges(false) // Resetuj flag nakon snimanja
        setTimeout(() => setMessage(''), 5000)
        // Sada je bezbedno učitati nove podatke
        const refreshData = await api.get('/api/sledeceEpizode/admin/sledeca-epizoda')
        if (refreshData.data) {
          setEpizodaData(refreshData.data)
          setInitialData(JSON.parse(JSON.stringify(refreshData.data)))
          if (refreshData.data.gost && refreshData.data.gost.ime) {
            setSearchQuery(refreshData.data.gost.ime)
          }
        }
      }
    } catch (error) {
      console.error('Error saving data:', error)
      setMessage('Greška prilikom čuvanja. Pokušajte ponovo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Učitavanje...</p>
      </div>
    )
  }

  return (
    <section className={styles.adminPitanja}>
      <div className={styles.container}>
        <div className={styles.header}>
          <FaQuestionCircle className={styles.icon} />
          <h1 className={styles.title}>Upravljanje Sledećom Epizodom</h1>
          <p className={styles.subtitle}>
            Postavite datum sledeće epizode i informacije o novom gostu
          </p>
        </div>

        <div className={styles.formWrapper}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>
                <FaCalendar className={styles.sectionIcon} />
                Datum sledeće epizode
              </h2>
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="datumEpizode">
                Datum i vreme epizode
                <span className={styles.required}>*</span>
              </label>
              <input
                id="datumEpizode"
                type="datetime-local"
                value={epizodaData.datumEpizode}
                onChange={handleDateChange}
                className={styles.input}
                required
              />
              <small className={styles.hint}>
                <FaInfoCircle /> Timer će automatski odbrojavati do ovog datuma
              </small>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>
                <FaUser className={styles.sectionIcon} />
                Izbor gosta
              </h2>
            </div>

            <div className={styles.guestSelector}>
              <div className={styles.searchWrapper}>
                <div className={styles.searchBox}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Pretražite postojećeg gosta ili unesite novo ime..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      if (searchResults.length > 0 && !epizodaData.gost.id) {
                        setShowSuggestions(true)
                      }
                    }}
                    className={styles.searchInput}
                    disabled={loadingGuestDetails}
                  />
                  {epizodaData.gost.id && (
                    <button
                      type="button"
                      onClick={clearGuestSelection}
                      className={styles.clearBtn}
                      title="Obriši izbor"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                {showSuggestions && searchResults.length > 0 && (
                  <div className={styles.suggestions}>
                    {searchResults.map((guest) => (
                      <div
                        key={guest.id}
                        className={styles.suggestionItem}
                        onClick={() => selectGuest(guest)}
                      >
                        <div className={styles.suggestionInfo}>
                          <strong>{guest.ime_prezime}</strong>
                          {guest.pozicija && <span> - {guest.pozicija}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {loadingGuestDetails && (
                <div className={styles.loadingInfo}>
                  Učitavam podatke gosta...
                </div>
              )}

              {epizodaData.gost.id && !loadingGuestDetails && (
                <div className={styles.selectedInfo}>
                  <FaInfoCircle /> Izabran postojeći gost - možete ažurirati podatke
                </div>
              )}
              {!epizodaData.gost.id && epizodaData.gost.ime && !loadingGuestDetails && (
                <div className={styles.newGuestInfo}>
                  <FaInfoCircle /> Novi gost biće kreiran
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Informacije o gostu</h2>
            </div>

            <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <label htmlFor="ime">
                  Ime i prezime
                  <span className={styles.required}>*</span>
                </label>
                <input
                  id="ime"
                  type="text"
                  value={epizodaData.gost.ime}
                  onChange={(e) => {
                    handleGostChange('ime', e.target.value)
                    setSearchQuery(e.target.value)
                  }}
                  className={styles.input}
                  placeholder="Radomir Borisavljević"
                  required
                  disabled={loadingGuestDetails}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="pozicija">
                  Pozicija
                  <span className={styles.required}>*</span>
                </label>
                <input
                  id="pozicija"
                  type="text"
                  value={epizodaData.gost.pozicija}
                  onChange={(e) => handleGostChange('pozicija', e.target.value)}
                  className={styles.input}
                  placeholder="Vlasnik KULTUR salona"
                  required
                  disabled={loadingGuestDetails}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="kompanija">
                  Kompanija
                  <span className={styles.required}>*</span>
                </label>
                <input
                  id="kompanija"
                  type="text"
                  value={epizodaData.gost.kompanija}
                  onChange={(e) => handleGostChange('kompanija', e.target.value)}
                  className={styles.input}
                  placeholder="Privatan biznis"
                  required
                  disabled={loadingGuestDetails}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="slika">
                  <FaImage /> URL slike
                  <span className={styles.required}>*</span>
                </label>
                <input
                  id="slika"
                  type="text"
                  value={epizodaData.gost.slika}
                  onChange={(e) => handleGostChange('slika', e.target.value)}
                  className={styles.input}
                  placeholder="/Assets/dijalog_high.jpg"
                  required
                  disabled={loadingGuestDetails}
                />
                {epizodaData.gost.slika && (
                  <div className={styles.imagePreview}>
                    <img src={epizodaData.gost.slika} alt="Preview" />
                  </div>
                )}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="opis">
                Opis
                <span className={styles.required}>*</span>
              </label>
              <textarea
                id="opis"
                value={epizodaData.gost.opis}
                onChange={(e) => handleGostChange('opis', e.target.value)}
                className={styles.textarea}
                placeholder="Poznatiji kao Raša, momak 2000. godište..."
                rows={6}
                required
                disabled={loadingGuestDetails}
              />
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Ključna dostignuća</h2>
            </div>

            {epizodaData.gost.dostignuca.map((dostignuce, index) => (
              <div key={index} className={styles.inputGroup}>
                <label htmlFor={`dostignuce-${index}`}>
                  Dostignuće {index + 1}
                </label>
                <input
                  id={`dostignuce-${index}`}
                  type="text"
                  value={dostignuce}
                  onChange={(e) => handleDostignuceChange(index, e.target.value)}
                  className={styles.input}
                  placeholder={`Dostignuće ${index + 1}`}
                  disabled={loadingGuestDetails}
                />
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Društvene mreže</h2>
            </div>

            <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <label htmlFor="linkedin">
                  <FaLinkedin /> LinkedIn
                </label>
                <input
                  id="linkedin"
                  type="url"
                  value={epizodaData.gost.socijalniMreza.linkedin}
                  onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                  className={styles.input}
                  placeholder="https://linkedin.com/in/username"
                  disabled={loadingGuestDetails}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="twitter">
                  <FaTwitter /> Twitter/X
                </label>
                <input
                  id="twitter"
                  type="url"
                  value={epizodaData.gost.socijalniMreza.twitter}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  className={styles.input}
                  placeholder="https://twitter.com/username"
                  disabled={loadingGuestDetails}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="instagram">
                  <FaInstagram /> Instagram
                </label>
                <input
                  id="instagram"
                  type="url"
                  value={epizodaData.gost.socijalniMreza.instagram}
                  onChange={(e) => handleSocialChange('instagram', e.target.value)}
                  className={styles.input}
                  placeholder="https://instagram.com/username"
                  disabled={loadingGuestDetails}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="youtube">
                  <FaYoutube /> YouTube
                </label>
                <input
                  id="youtube"
                  type="url"
                  value={epizodaData.gost.socijalniMreza.youtube}
                  onChange={(e) => handleSocialChange('youtube', e.target.value)}
                  className={styles.input}
                  placeholder="https://youtube.com/@username"
                  disabled={loadingGuestDetails}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className={styles.submitBtn}
            disabled={saving || loadingGuestDetails}
          >
            {saving ? (
              <>Čuvanje...</>
            ) : (
              <>
                <FaSave />
                Sačuvaj izmene
              </>
            )}
          </button>

          {message && (
            <div className={`${styles.message} ${
              message.includes('uspešno') ? styles.success : styles.error
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}