'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/app/utils/api';
import styles from './knjige.module.css';
import { 
  FaArrowLeft, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaBook,
  FaUser,
  FaImage,
  FaFilePdf,
  FaCheck,
  FaTimes,
  FaTags
} from 'react-icons/fa';

export default function AdminKnjige() {
  const [knjige, setKnjige] = useState([]);
  const [selectedKnjiga, setSelectedKnjiga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    ime: '',
    autor: '',
    url_slike: '',
    pdf_url: '',
    opis: '',
    kategorija: ''
  });

  useEffect(() => {
    fetchKnjige();
  }, []);

  const fetchKnjige = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/knjige');
      setKnjige(response.data);
    } catch (error) {
      console.error('Error fetching knjige:', error);
      showMessage('Greška prilikom učitavanja knjiga', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectKnjiga = (knjiga) => {
    setSelectedKnjiga(knjiga);
    setFormData({
      ime: knjiga.ime,
      autor: knjiga.autor,
      url_slike: knjiga.url_slike,
      pdf_url: knjiga.pdf_url,
      opis: knjiga.opis || '',
      kategorija: knjiga.kategorija || ''
    });
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedKnjiga(null);
    setFormData({
      ime: '',
      autor: '',
      url_slike: '',
      pdf_url: '',
      opis: '',
      kategorija: ''
    });
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (isCreating) {
      setIsCreating(false);
      setIsEditing(false);
      setSelectedKnjiga(null);
    } else {
      setIsEditing(false);
      if (selectedKnjiga) {
        setFormData({
          ime: selectedKnjiga.ime,
          autor: selectedKnjiga.autor,
          url_slike: selectedKnjiga.url_slike,
          pdf_url: selectedKnjiga.pdf_url,
          opis: selectedKnjiga.opis || '',
          kategorija: selectedKnjiga.kategorija || ''
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.ime || !formData.autor || !formData.url_slike || !formData.pdf_url) {
        showMessage('Ime, autor, URL slike i PDF URL su obavezna polja', 'error');
        return;
      }

      if (isCreating) {
        await api.post('/api/knjige', formData);
        showMessage('Knjiga uspešno kreirana', 'success');
      } else {
        await api.put(`/api/knjige/${selectedKnjiga.id}`, formData);
        showMessage('Knjiga uspešno ažurirana', 'success');
      }

      await fetchKnjige();
      setIsEditing(false);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving knjiga:', error);
      showMessage(error.response?.data?.message || 'Greška prilikom čuvanja', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu knjigu?')) return;

    try {
      await api.delete(`/api/knjige/${id}`);
      showMessage('Knjiga uspešno obrisana', 'success');
      await fetchKnjige();
      if (selectedKnjiga?.id === id) {
        setSelectedKnjiga(null);
        setIsEditing(false);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error deleting knjiga:', error);
      showMessage('Greška prilikom brisanja', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 4000);
  };

  const getStats = () => {
    const kategorije = [...new Set(knjige.map(k => k.kategorija).filter(Boolean))];
    return {
      total: knjige.length,
      kategorije: kategorije.length,
      autori: [...new Set(knjige.map(k => k.autor))].length
    };
  };

  const stats = getStats();

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/admin" className={styles.backBtn}>
            <FaArrowLeft /> Nazad na Admin
          </Link>
          <button onClick={handleCreateNew} className={styles.addBtn}>
            <FaPlus /> Dodaj knjigu
          </button>
        </div>
        <h1>Upravljanje Knjigama</h1>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.total}</span>
            <span className={styles.statLabel}>Ukupno knjiga</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.autori}</span>
            <span className={styles.statLabel}>Autora</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.kategorije}</span>
            <span className={styles.statLabel}>Kategorija</span>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Lista knjiga */}
        <div className={styles.knjigeList}>
          <h3>
            <FaBook /> Sve knjige
          </h3>
          {loading ? (
            <div className={styles.loading}>Učitavanje...</div>
          ) : knjige.length === 0 ? (
            <div className={styles.empty}>
              Nema kreiranih knjiga. Kliknite na "Dodaj knjigu" da kreirate prvu.
            </div>
          ) : (
            <div className={styles.list}>
              {knjige.map((knjiga) => (
                <div
                  key={knjiga.id}
                  className={`${styles.knjigaItem} ${
                    selectedKnjiga?.id === knjiga.id ? styles.active : ''
                  }`}
                  onClick={() => handleSelectKnjiga(knjiga)}
                >
                  <div className={styles.knjigaInfo}>
                    <strong>{knjiga.ime}</strong>
                    <span>{knjiga.autor}</span>
                    {knjiga.kategorija && (
                      <small className={styles.kategorija}>{knjiga.kategorija}</small>
                    )}
                  </div>
                  <button
                    className={styles.deleteIconBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(knjiga.id);
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalji knjige */}
        <div className={styles.knjigaDetails}>
          {!selectedKnjiga && !isCreating ? (
            <div className={styles.placeholder}>
              <FaBook />
              <p>Izaberite knjigu sa liste ili kreirajte novu</p>
            </div>
          ) : (
            <div className={styles.form}>
              <div className={styles.formHeader}>
                <h2>
                  <FaBook />
                  {isCreating ? 'Nova knjiga' : 'Detalji knjige'}
                </h2>
                {!isEditing && !isCreating && (
                  <button onClick={handleEdit} className={styles.editBtn}>
                    <FaEdit /> Izmeni
                  </button>
                )}
              </div>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>
                    <FaBook /> Ime knjige <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ime}
                    onChange={(e) => setFormData({ ...formData, ime: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Unesite ime knjige"
                    maxLength={255}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>
                    <FaUser /> Autor <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.autor}
                    onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Unesite ime autora"
                    maxLength={255}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>
                    <FaTags /> Kategorija
                  </label>
                  <input
                    type="text"
                    value={formData.kategorija}
                    onChange={(e) => setFormData({ ...formData, kategorija: e.target.value })}
                    disabled={!isEditing}
                    placeholder="npr. Teologija, Autobiografija"
                    maxLength={100}
                  />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>
                    <FaImage /> URL slike <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.url_slike}
                    onChange={(e) => setFormData({ ...formData, url_slike: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://example.com/naslovna-slika.jpg"
                    maxLength={500}
                  />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>
                    <FaFilePdf /> PDF URL <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.pdf_url}
                    onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://example.com/knjiga.pdf"
                    maxLength={500}
                  />
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>Opis</label>
                  <textarea
                    value={formData.opis}
                    onChange={(e) => setFormData({ ...formData, opis: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Kratki opis knjige..."
                    rows={4}
                  />
                </div>
              </div>

              {isEditing && (
                <div className={styles.formActions}>
                  <button onClick={handleSave} className={styles.saveBtn}>
                    <FaCheck /> Sačuvaj
                  </button>
                  <button onClick={handleCancel} className={styles.cancelBtn}>
                    <FaTimes /> Otkaži
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}
    </main>
  );
}