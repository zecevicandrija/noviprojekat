'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/app/utils/api';
import styles from './popusti.module.css';
import { 
  FaArrowLeft, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTicketAlt,
  FaPercent,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaInfinity
} from 'react-icons/fa';

export default function AdminPopusti() {
  const [popusti, setPopusti] = useState([]);
  const [selectedPopust, setSelectedPopust] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    kod: '',
    procenat: '',
    opis: '',
    datum_isteka: '',
    max_upotreba: '',
    aktivan: true
  });

  useEffect(() => {
    fetchPopusti();
  }, []);

  const fetchPopusti = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/popusti');
      setPopusti(response.data);
    } catch (error) {
      console.error('Error fetching popusti:', error);
      showMessage('Greška prilikom učitavanja popusta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPopust = (popust) => {
    setSelectedPopust(popust);
    setFormData({
      kod: popust.kod,
      procenat: popust.procenat,
      opis: popust.opis || '',
      datum_isteka: popust.datum_isteka ? popust.datum_isteka.split('T')[0] : '',
      max_upotreba: popust.max_upotreba || '',
      aktivan: popust.aktivan === 1
    });
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedPopust(null);
    setFormData({
      kod: '',
      procenat: '',
      opis: '',
      datum_isteka: '',
      max_upotreba: '',
      aktivan: true
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
      setSelectedPopust(null);
    } else {
      setIsEditing(false);
      if (selectedPopust) {
        setFormData({
          kod: selectedPopust.kod,
          procenat: selectedPopust.procenat,
          opis: selectedPopust.opis || '',
          datum_isteka: selectedPopust.datum_isteka ? selectedPopust.datum_isteka.split('T')[0] : '',
          max_upotreba: selectedPopust.max_upotreba || '',
          aktivan: selectedPopust.aktivan === 1
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.kod || !formData.procenat) {
        showMessage('Kod i procenat su obavezna polja', 'error');
        return;
      }

      if (isCreating) {
        await api.post('/api/popusti', formData);
        showMessage('Popust uspešno kreiran', 'success');
      } else {
        await api.put(`/api/popusti/${selectedPopust.id}`, formData);
        showMessage('Popust uspešno ažuriran', 'success');
      }

      await fetchPopusti();
      setIsEditing(false);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving popust:', error);
      showMessage(error.response?.data?.message || 'Greška prilikom čuvanja', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj popust?')) return;

    try {
      await api.delete(`/api/popusti/${id}`);
      showMessage('Popust uspešno obrisan', 'success');
      await fetchPopusti();
      if (selectedPopust?.id === id) {
        setSelectedPopust(null);
        setIsEditing(false);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error deleting popust:', error);
      showMessage('Greška prilikom brisanja', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 4000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Bez isteka';
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-Latn-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const isMaxedOut = (popust) => {
    if (!popust.max_upotreba) return false;
    return popust.trenutna_upotreba >= popust.max_upotreba;
  };

  const getStats = () => {
    return {
      total: popusti.length,
      active: popusti.filter(p => p.aktivan && !isExpired(p.datum_isteka) && !isMaxedOut(p)).length,
      expired: popusti.filter(p => isExpired(p.datum_isteka)).length
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
            <FaPlus /> Dodaj popust
          </button>
        </div>
        <h1>Upravljanje Popustima</h1>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.total}</span>
            <span className={styles.statLabel}>Ukupno popusta</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.active}</span>
            <span className={styles.statLabel}>Aktivnih</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.expired}</span>
            <span className={styles.statLabel}>Isteklo</span>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Lista popusta */}
        <div className={styles.popustiList}>
          <h3>
            <FaTicketAlt /> Svi popusti
          </h3>
          {loading ? (
            <div className={styles.loading}>Učitavanje...</div>
          ) : popusti.length === 0 ? (
            <div className={styles.empty}>
              Nema kreiranih popusta. Kliknite na "Dodaj popust" da kreirate prvi.
            </div>
          ) : (
            <div className={styles.list}>
              {popusti.map((popust) => {
                const expired = isExpired(popust.datum_isteka);
                const maxed = isMaxedOut(popust);
                const isActive = popust.aktivan && !expired && !maxed;

                return (
                  <div
                    key={popust.id}
                    className={`${styles.popustItem} ${
                      selectedPopust?.id === popust.id ? styles.active : ''
                    }`}
                    onClick={() => handleSelectPopust(popust)}
                  >
                    <div className={styles.popustInfo}>
                      <strong>{popust.kod}</strong>
                      <span>{popust.procenat}% popust</span>
                      <small>
                        {isActive ? (
                          <span className={styles.statusActive}>
                            <FaCheck /> Aktivan
                          </span>
                        ) : expired ? (
                          <span className={styles.statusExpired}>
                            <FaTimes /> Istekao
                          </span>
                        ) : maxed ? (
                          <span className={styles.statusMaxed}>
                            <FaTimes /> Maksimalno iskorišten
                          </span>
                        ) : (
                          <span className={styles.statusInactive}>
                            <FaTimes /> Neaktivan
                          </span>
                        )}
                      </small>
                    </div>
                    <button
                      className={styles.deleteIconBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(popust.id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detalji popusta */}
        <div className={styles.popustDetails}>
          {!selectedPopust && !isCreating ? (
            <div className={styles.placeholder}>
              <FaTicketAlt />
              <p>Izaberite popust sa liste ili kreirajte novi</p>
            </div>
          ) : (
            <div className={styles.form}>
              <div className={styles.formHeader}>
                <h2>
                  <FaTicketAlt />
                  {isCreating ? 'Novi popust' : 'Detalji popusta'}
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
                    <FaTicketAlt /> Kod popusta <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.kod}
                    onChange={(e) => setFormData({ ...formData, kod: e.target.value.toUpperCase() })}
                    disabled={!isEditing}
                    placeholder="npr. LETO2025"
                    maxLength={50}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>
                    <FaPercent /> Procenat popusta <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.procenat}
                    onChange={(e) => setFormData({ ...formData, procenat: e.target.value })}
                    disabled={!isEditing}
                    placeholder="10"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>
                    <FaCalendarAlt /> Datum isteka
                  </label>
                  <input
                    type="date"
                    value={formData.datum_isteka}
                    onChange={(e) => setFormData({ ...formData, datum_isteka: e.target.value })}
                    disabled={!isEditing}
                  />
                  <small style={{ color: '#bcd6ff', marginTop: '0.25rem' }}>
                    Ostavite prazno za neograničeno
                  </small>
                </div>

                <div className={styles.inputGroup}>
                  <label>
                    <FaInfinity /> Maksimalna upotreba
                  </label>
                  <input
                    type="number"
                    value={formData.max_upotreba}
                    onChange={(e) => setFormData({ ...formData, max_upotreba: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Neograničeno"
                    min="1"
                  />
                  <small style={{ color: '#bcd6ff', marginTop: '0.25rem' }}>
                    Ostavite prazno za neograničeno
                  </small>
                </div>

                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>Opis</label>
                  <textarea
                    value={formData.opis}
                    onChange={(e) => setFormData({ ...formData, opis: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Kratki opis popusta..."
                    rows={3}
                    maxLength={255}
                  />
                </div>

                {!isCreating && selectedPopust && (
                  <>
                    <div className={styles.inputGroup}>
                      <label>Trenutna upotreba</label>
                      <input
                        type="text"
                        value={`${selectedPopust.trenutna_upotreba} ${
                          selectedPopust.max_upotreba 
                            ? `/ ${selectedPopust.max_upotreba}` 
                            : '(neograničeno)'
                        }`}
                        disabled
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Status</label>
                      <div className={styles.statusDisplay}>
                        {selectedPopust.aktivan && 
                         !isExpired(selectedPopust.datum_isteka) && 
                         !isMaxedOut(selectedPopust) ? (
                          <span className={styles.statusActive}>
                            <FaCheck /> Aktivan
                          </span>
                        ) : (
                          <span className={styles.statusInactive}>
                            <FaTimes /> Neaktivan
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className={styles.inputGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.aktivan}
                      onChange={(e) => setFormData({ ...formData, aktivan: e.target.checked })}
                      disabled={!isEditing}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Popust je aktivan
                  </label>
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