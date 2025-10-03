'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/app/utils/api';
import styles from './dodajEpizodu.module.css';
import { FaArrowLeft, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';

export default function DodajEpizodu() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    naslov: '',
    thumbnail_url: '',
    video_url: '',
    trajanje: '',
    datum_objavljivanja: ''
  });
  
  const [gostInput, setGostInput] = useState('');
  const [gostSuggestions, setGostSuggestions] = useState([]);
  const [selectedGosti, setSelectedGosti] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Redirect ako nije admin
  if (user && user.uloga !== 'admin') {
    router.push('/');
    return null;
  }

  // Search gosti
  const handleGostSearch = async (value) => {
    setGostInput(value);
    
    if (value.length < 2) {
      setGostSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await api.get(`/api/gosti/search?q=${value}`);
      setGostSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Dodaj postojećeg gosta
  const handleSelectGost = (gost) => {
    if (!selectedGosti.find(g => g.id === gost.id)) {
      setSelectedGosti([...selectedGosti, gost]);
    }
    setGostInput('');
    setGostSuggestions([]);
    setShowSuggestions(false);
  };

  // Dodaj novog gosta
  const handleAddNewGost = async () => {
    if (!gostInput.trim()) return;

    try {
      const response = await api.post('/api/gosti', {
        ime_prezime: gostInput.trim()
      });

      // Ako već postoji
      if (response.data.existing) {
        const existingGost = {
          id: response.data.id,
          ime_prezime: gostInput.trim()
        };
        if (!selectedGosti.find(g => g.id === existingGost.id)) {
          setSelectedGosti([...selectedGosti, existingGost]);
        }
      } else {
        // Novi gost
        const newGost = {
          id: response.data.id,
          ime_prezime: gostInput.trim()
        };
        setSelectedGosti([...selectedGosti, newGost]);
      }

      setGostInput('');
      setGostSuggestions([]);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Add gost error:', error);
      setMessage({ type: 'error', text: 'Greška pri dodavanju gosta' });
    }
  };

  // Ukloni gosta
  const handleRemoveGost = (gostId) => {
    setSelectedGosti(selectedGosti.filter(g => g.id !== gostId));
  };

  // Handle form input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Submit forma
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/api/epizode', {
        ...formData,
        gosti: selectedGosti
      });

      setMessage({ type: 'success', text: 'Epizoda uspešno kreirana!' });
      
      // Reset forma
      setTimeout(() => {
        router.push('/admin/epizode');
      }, 2000);
    } catch (error) {
      console.error('Create epizoda error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Greška pri kreiranju epizode' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.uloga !== 'admin') {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.backBtn}>
          <FaArrowLeft /> Nazad
        </Link>
        <h1>Dodaj novu epizodu</h1>
      </header>

      <div className={styles.formWrapper}>
        <form onSubmit={handleSubmit} className={styles.form}>
          
          {/* Naslov */}
          <div className={styles.formGroup}>
            <label htmlFor="naslov">Naslov epizode *</label>
            <textarea
              id="naslov"
              name="naslov"
              value={formData.naslov}
              onChange={handleChange}
              required
              rows={3}
              placeholder="dijalog Podcast 107 | DRAGOSLAV BOKAN - Srbi treba da nauče nešto iz istorije..."
            />
          </div>

          {/* Thumbnail URL */}
          <div className={styles.formGroup}>
            <label htmlFor="thumbnail_url">Thumbnail URL *</label>
            <input
              type="url"
              id="thumbnail_url"
              name="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={handleChange}
              required
              placeholder="https://example.com/thumbnail.jpg"
            />
            {formData.thumbnail_url && (
              <div className={styles.preview}>
                <img src={formData.thumbnail_url} alt="Preview" />
              </div>
            )}
          </div>

          {/* Video URL */}
          <div className={styles.formGroup}>
            <label htmlFor="video_url">Video URL (YouTube) *</label>
            <input
              type="url"
              id="video_url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              required
              placeholder="https://youtu.be/Oq9OgAyInVo"
            />
          </div>

          {/* Trajanje i Datum */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="trajanje">Trajanje *</label>
              <input
                type="text"
                id="trajanje"
                name="trajanje"
                value={formData.trajanje}
                onChange={handleChange}
                required
                placeholder="2h 18min"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="datum_objavljivanja">Datum objavljivanja *</label>
              <input
                type="date"
                id="datum_objavljivanja"
                name="datum_objavljivanja"
                value={formData.datum_objavljivanja}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Gosti - Auto-suggest */}
          <div className={styles.formGroup}>
            <label>Gosti</label>
            <div className={styles.gostInputWrapper}>
              <div className={styles.gostSearchBox}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  value={gostInput}
                  onChange={(e) => handleGostSearch(e.target.value)}
                  placeholder="Počni kucati ime gosta..."
                  className={styles.gostInput}
                />
                {gostInput.trim() && (
                  <button
                    type="button"
                    onClick={handleAddNewGost}
                    className={styles.addNewBtn}
                  >
                    <FaPlus /> Dodaj novog
                  </button>
                )}
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && gostSuggestions.length > 0 && (
                <div className={styles.suggestions}>
                  {gostSuggestions.map(gost => (
                    <div
                      key={gost.id}
                      className={styles.suggestionItem}
                      onClick={() => handleSelectGost(gost)}
                    >
                      <strong>{gost.ime_prezime}</strong>
                      {gost.pozicija && <span> - {gost.pozicija}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Selected gosti */}
              {selectedGosti.length > 0 && (
                <div className={styles.selectedGosti}>
                  {selectedGosti.map(gost => (
                    <div key={gost.id} className={styles.gostChip}>
                      <span>{gost.ime_prezime}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGost(gost.id)}
                        className={styles.removeChip}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          {/* Submit */}
          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Kreiranje...' : 'Kreiraj epizodu'}
          </button>
        </form>
      </div>
    </div>
  );
}