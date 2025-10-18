'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/app/utils/api';
import styles from './dodajPremium.module.css';
import { FaArrowLeft, FaCrown } from 'react-icons/fa';

export default function DodajPremiumEpizodu() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    naslov: '',
    thumbnail_url: '',
    video_url: '',
    trajanje: '',
    datum_objavljivanja: '',
    opis: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Redirect ako nije admin
  if (user && user.uloga !== 'admin') {
    router.push('/');
    return null;
  }

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
      await api.post('/api/premium-epizode', formData);

      setMessage({ type: 'success', text: 'Premium epizoda uspešno kreirana!' });
      
      // Reset forma
      setTimeout(() => {
        router.push('/admin/premium');
      }, 2000);
    } catch (error) {
      console.error('Create premium epizoda error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Greška pri kreiranju premium epizode' 
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
        <Link href="/admin/premium" className={styles.backBtn}>
          <FaArrowLeft /> Nazad
        </Link>
        <h1><FaCrown className={styles.crownIcon} /> Dodaj premium epizodu</h1>
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
              placeholder="dijalog Premium 001 | EKSKLUZIVAN GOST - Razgovor o tajnama..."
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
              placeholder="https://example.com/premium-thumbnail.jpg"
            />
            {formData.thumbnail_url && (
              <div className={styles.preview}>
                <img src={formData.thumbnail_url} alt="Preview" />
              </div>
            )}
          </div>

          {/* Video URL */}
          <div className={styles.formGroup}>
            <label htmlFor="video_url">Video URL (YouTube Unlisted) *</label>
            <input
              type="url"
              id="video_url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              required
              placeholder="https://youtu.be/xyz123abc"
            />
          </div>

          {/* Opis */}
          <div className={styles.formGroup}>
            <label htmlFor="opis">Opis epizode</label>
            <textarea
              id="opis"
              name="opis"
              value={formData.opis}
              onChange={handleChange}
              rows={3}
              placeholder="Ekskluzivan sadržaj dostupan samo Patreon pretplatnicima..."
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
                placeholder="1h 45min"
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
            {loading ? 'Kreiranje...' : '✨ Kreiraj premium epizodu'}
          </button>
        </form>
      </div>
    </div>
  );
}