'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/app/utils/api';
import styles from './premium.module.css';
import { FaArrowLeft, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaCrown } from 'react-icons/fa';

export default function AdminPremium() {
  const { user } = useAuth();
  const router = useRouter();
  const [epizode, setEpizode] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

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
      const response = await api.get('/api/premium-epizode/admin/all');
      setEpizode(response.data);
    } catch (error) {
      console.error('Error fetching premium epizode:', error);
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
      opis: epizoda.opis || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (field, value) => {
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.put(`/api/premium-epizode/${id}`, editForm);
      
      // Refresh lista
      await fetchEpizode();
      
      setEditingId(null);
      setEditForm({});
      alert('Premium epizoda uspešno ažurirana!');
    } catch (error) {
      console.error('Error updating premium epizoda:', error);
      alert('Greška pri ažuriranju epizode');
    }
  };

  const handleDelete = async (id, naslov) => {
    const confirmMsg = `Da li ste sigurni da želite da obrišete premium epizodu:\n\n"${naslov}"\n\nOva akcija se ne može poništiti!`;
    
    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      await api.delete(`/api/premium-epizode/${id}`);
      setEpizode(epizode.filter(ep => ep.id !== id));
      alert('Premium epizoda uspešno obrisana!');
    } catch (error) {
      console.error('Error deleting premium epizoda:', error);
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
          <h1><FaCrown className={styles.crownIcon} /> Premium Epizode</h1>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{epizode.length}</span>
            <span className={styles.statLabel}>Premium epizoda</span>
          </div>
        </div>

        <Link href="/admin/premium/dodaj" className={styles.addBtn}>
          <FaPlus /> Dodaj premium epizodu
        </Link>
      </header>

      {loading ? (
        <div className={styles.loading}>Učitavanje...</div>
      ) : epizode.length === 0 ? (
        <div className={styles.empty}>
          <FaCrown className={styles.emptyIcon} />
          <p>Nema kreiranih premium epizoda</p>
          <Link href="/admin/premium/dodaj" className={styles.emptyBtn}>
            <FaPlus /> Kreiraj prvu premium epizodu
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
                    <h3>Izmeni premium epizodu</h3>
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
                      <label>Video URL (YouTube Unlisted)</label>
                      <input
                        type="url"
                        value={editForm.video_url}
                        onChange={(e) => handleEditChange('video_url', e.target.value)}
                      />
                    </div>

                    {/* Opis */}
                    <div className={styles.editGroup}>
                      <label>Opis</label>
                      <textarea
                        value={editForm.opis}
                        onChange={(e) => handleEditChange('opis', e.target.value)}
                        rows={2}
                        placeholder="Kratak opis epizode..."
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
                          placeholder="1h 45min"
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
                    <div className={styles.premiumBadge}>
                      <FaCrown /> Premium
                    </div>
                    <div className={styles.duration}>{epizoda.trajanje}</div>
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{epizoda.naslov}</h3>
                    
                    {epizoda.opis && (
                      <p className={styles.cardDesc}>{epizoda.opis}</p>
                    )}

                    <div className={styles.cardMeta}>
                      <span className={styles.metaItem}>
                        {formatDate(epizoda.datum_objavljivanja)}
                      </span>
                    </div>

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