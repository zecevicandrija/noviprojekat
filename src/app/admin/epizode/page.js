'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/app/utils/api';
import styles from './epizode.module.css';
import { FaArrowLeft, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaSearch } from 'react-icons/fa';

export default function AdminEpizode() {
  const { user } = useAuth();
  const router = useRouter();
  const [epizode, setEpizode] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [gostInput, setGostInput] = useState('');
  const [gostSuggestions, setGostSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (user && user.uloga !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    fetchEpizode();
  }, []);

  const fetchEpizode = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/epizode');
      setEpizode(response.data);
    } catch (error) {
      console.error('Error fetching epizode:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (epizoda) => {
    setEditingId(epizoda.id);
    setEditForm({
      naslov: epizoda.naslov,
      thumbnail_url: epizoda.thumbnail_url,
      video_url: epizoda.video_url,
      trajanje: epizoda.trajanje,
      datum_objavljivanja: epizoda.datum_objavljivanja.split('T')[0],
      gosti: epizoda.gosti || []
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setGostInput('');
    setGostSuggestions([]);
    setShowSuggestions(false);
  };

  const handleEditChange = (field, value) => {
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  // Gost search za edit
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

  const handleSelectGost = (gost) => {
    if (!editForm.gosti.find(g => g.id === gost.id)) {
      setEditForm({
        ...editForm,
        gosti: [...editForm.gosti, gost]
      });
    }
    setGostInput('');
    setGostSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAddNewGost = async () => {
    if (!gostInput.trim()) return;

    try {
      const response = await api.post('/api/gosti', {
        ime_prezime: gostInput.trim()
      });

      const newGost = {
        id: response.data.id,
        ime_prezime: gostInput.trim()
      };
      
      setEditForm({
        ...editForm,
        gosti: [...editForm.gosti, newGost]
      });

      setGostInput('');
      setGostSuggestions([]);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Add gost error:', error);
    }
  };

  const handleRemoveGost = (gostId) => {
    setEditForm({
      ...editForm,
      gosti: editForm.gosti.filter(g => g.id !== gostId)
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.put(`/api/epizode/${id}`, editForm);
      
      // Refresh lista
      await fetchEpizode();
      
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating epizoda:', error);
      alert('Greška pri ažuriranju epizode');
    }
  };

  const handleDelete = async (id, naslov) => {
    const confirmMsg = `Da li ste sigurni da želite da obrišete:\n\n"${naslov}"\n\nOva akcija se ne može poništiti!`;
    
    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      await api.delete(`/api/epizode/${id}`);
      setEpizode(epizode.filter(ep => ep.id !== id));
    } catch (error) {
      console.error('Error deleting epizoda:', error);
      alert('Greška prilikom brisanja epizode');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!user || user.uloga !== 'admin') {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/admin" className={styles.backBtn}>
            <FaArrowLeft /> Nazad
          </Link>
          <h1>Upravljanje epizodama</h1>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{epizode.length}</span>
            <span className={styles.statLabel}>Ukupno epizoda</span>
          </div>
        </div>

        <Link href="/admin/epizode/dodaj" className={styles.addBtn}>
          <FaPlus /> Dodaj novu epizodu
        </Link>
      </header>

      {loading ? (
        <div className={styles.loading}>Učitavanje...</div>
      ) : epizode.length === 0 ? (
        <div className={styles.empty}>
          <p>Nema kreiranih epizoda</p>
          <Link href="/admin/epizode/dodaj" className={styles.emptyBtn}>
            <FaPlus /> Kreiraj prvu epizodu
          </Link>
        </div>
      ) : (
        <div className={styles.epizodeGrid}>
          {epizode.map((epizoda) => (
            <div key={epizoda.id} className={`${styles.epizodaCard} ${editingId === epizoda.id ? styles.editing : ''}`}>
              {editingId === epizoda.id ? (
                // EDIT MODE
                <div className={styles.editMode}>
                  <div className={styles.editHeader}>
                    <h3>Izmeni epizodu</h3>
                    <button onClick={handleCancelEdit} className={styles.closeBtn}>
                      <FaTimes />
                    </button>
                  </div>

                  <div className={styles.editForm}>
                    {/* Naslov */}
                    <div className={styles.editGroup}>
                      <label>Naslov</label>
                      <textarea
                        value={editForm.naslov}
                        onChange={(e) => handleEditChange('naslov', e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Thumbnail URL */}
                    <div className={styles.editGroup}>
                      <label>Thumbnail URL</label>
                      <input
                        type="url"
                        value={editForm.thumbnail_url}
                        onChange={(e) => handleEditChange('thumbnail_url', e.target.value)}
                      />
                      {editForm.thumbnail_url && (
                        <div className={styles.editPreview}>
                          <Image 
                            src={editForm.thumbnail_url} 
                            alt="Preview"
                            width={200}
                            height={113}
                          />
                        </div>
                      )}
                    </div>

                    {/* Video URL */}
                    <div className={styles.editGroup}>
                      <label>Video URL</label>
                      <input
                        type="url"
                        value={editForm.video_url}
                        onChange={(e) => handleEditChange('video_url', e.target.value)}
                      />
                    </div>

                    {/* Trajanje i Datum */}
                    <div className={styles.editRow}>
                      <div className={styles.editGroup}>
                        <label>Trajanje</label>
                        <input
                          type="text"
                          value={editForm.trajanje}
                          onChange={(e) => handleEditChange('trajanje', e.target.value)}
                          placeholder="2h 18min"
                        />
                      </div>
                      <div className={styles.editGroup}>
                        <label>Datum</label>
                        <input
                          type="date"
                          value={editForm.datum_objavljivanja}
                          onChange={(e) => handleEditChange('datum_objavljivanja', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Gosti */}
                    <div className={styles.editGroup}>
                      <label>Gosti</label>
                      <div className={styles.gostEditWrapper}>
                        <div className={styles.gostSearchBox}>
                          <FaSearch className={styles.searchIcon} />
                          <input
                            type="text"
                            value={gostInput}
                            onChange={(e) => handleGostSearch(e.target.value)}
                            placeholder="Pretraži ili dodaj gosta..."
                            className={styles.gostInput}
                          />
                          {gostInput.trim() && (
                            <button
                              type="button"
                              onClick={handleAddNewGost}
                              className={styles.addGostBtn}
                            >
                              <FaPlus />
                            </button>
                          )}
                        </div>

                        {showSuggestions && gostSuggestions.length > 0 && (
                          <div className={styles.suggestions}>
                            {gostSuggestions.map(gost => (
                              <div
                                key={gost.id}
                                className={styles.suggestionItem}
                                onClick={() => handleSelectGost(gost)}
                              >
                                {gost.ime_prezime}
                              </div>
                            ))}
                          </div>
                        )}

                        {editForm.gosti && editForm.gosti.length > 0 && (
                          <div className={styles.selectedGosti}>
                            {editForm.gosti.map(gost => (
                              <div key={gost.id} className={styles.gostChip}>
                                <span>{gost.ime_prezime}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGost(gost.id)}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Save/Cancel buttons */}
                    <div className={styles.editActions}>
                      <button 
                        onClick={() => handleSaveEdit(epizoda.id)}
                        className={styles.saveBtn}
                      >
                        <FaSave /> Sačuvaj
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className={styles.cancelBtn}
                      >
                        Otkaži
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <>
                  <div className={styles.thumbnail}>
                    <Image 
                      src={epizoda.thumbnail_url} 
                      alt={epizoda.naslov}
                      width={320}
                      height={180}
                      className={styles.thumbnailImg}
                    />
                    <div className={styles.duration}>{epizoda.trajanje}</div>
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{epizoda.naslov}</h3>
                    
                    <div className={styles.cardMeta}>
                      <span className={styles.metaItem}>
                        {formatDate(epizoda.datum_objavljivanja)}
                      </span>
                    </div>

                    {epizoda.gosti && epizoda.gosti.length > 0 && (
                      <div className={styles.gosti}>
                        {epizoda.gosti.map((gost, idx) => (
                          <span key={idx} className={styles.gostBadge}>
                            {gost.ime_prezime}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={styles.cardActions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEdit(epizoda)}
                      >
                        <FaEdit /> Izmeni
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(epizoda.id, epizoda.naslov)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}