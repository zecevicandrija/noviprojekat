'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/app/utils/api';
import styles from './pitanja.module.css';
import { FaTrash, FaArrowLeft, FaLayerGroup, FaList, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function AdminPitanja() {
  const { user } = useAuth();
  const router = useRouter();
  const [pitanja, setPitanja] = useState([]);
  const [groupedPitanja, setGroupedPitanja] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' ili 'grouped'
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  useEffect(() => {
    if (user && user.uloga !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    fetchPitanja();
  }, []);

  const fetchPitanja = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/pitanja');
      setPitanja(response.data);
      
      // Fetch grouped data
      const groupedResponse = await api.get('/api/pitanjaGrouped');
      setGroupedPitanja(groupedResponse.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovo pitanje?')) {
      return;
    }

    try {
      await api.delete(`/api/pitanja/${id}`);
      setPitanja(pitanja.filter(p => p.id !== id));
      // Refresh grouped view
      const groupedResponse = await api.get('/api/pitanja/grouped');
      setGroupedPitanja(groupedResponse.data);
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Greška prilikom brisanja');
    }
  };

  const toggleGroup = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || user.uloga !== 'admin') {
    return null;
  }

  const frequentQuestions = groupedPitanja.filter(g => g.count > 1);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/admin" className={styles.backBtn}>
            <FaArrowLeft /> Nazad
          </Link>
          <h1>Pitanja za goste</h1>
        </div>
        
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{pitanja.length}</span>
            <span className={styles.statLabel}>Ukupno pitanja</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{frequentQuestions.length}</span>
            <span className={styles.statLabel}>Česta pitanja</span>
          </div>
        </div>

        <div className={styles.viewToggle}>
          <button 
            className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FaList /> Lista
          </button>
          <button 
            className={`${styles.toggleBtn} ${viewMode === 'grouped' ? styles.active : ''}`}
            onClick={() => setViewMode('grouped')}
          >
            <FaLayerGroup /> Grupisana
          </button>
        </div>
      </header>

      {loading ? (
        <div className={styles.loading}>Učitavanje...</div>
      ) : viewMode === 'list' ? (
        // Klasični prikaz liste
        pitanja.length === 0 ? (
          <div className={styles.empty}>Nema postavljenih pitanja</div>
        ) : (
          <div className={styles.pitanjaList}>
            {pitanja.map((pitanje) => (
              <div key={pitanje.id} className={styles.pitanjeCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardInfo}>
                    <span className={styles.authorName}>{pitanje.ime}</span>
                    <span className={styles.date}>{formatDate(pitanje.created_at)}</span>
                  </div>
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(pitanje.id)}
                    title="Obriši"
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <div className={styles.cardBody}>
                  <p>{pitanje.pitanje}</p>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // Grupisani prikaz
        groupedPitanja.length === 0 ? (
          <div className={styles.empty}>Nema postavljenih pitanja</div>
        ) : (
          <div className={styles.pitanjaList}>
            {groupedPitanja.map((group) => (
              <div 
                key={group.id} 
                className={`${styles.groupCard} ${group.count > 1 ? styles.frequent : ''}`}
              >
                <div className={styles.groupHeader}>
                  <div className={styles.groupInfo}>
                    {group.count > 1 && (
                      <span className={styles.countBadge}>
                        {group.count}x postavljeno
                      </span>
                    )}
                    <span className={styles.authorName}>{group.autor}</span>
                    <span className={styles.date}>
                      {formatDate(group.firstAsked)}
                      {group.count > 1 && ` - ${formatDate(group.lastAsked)}`}
                    </span>
                  </div>
                  <div className={styles.groupActions}>
                    {group.count > 1 && (
                      <button
                        className={styles.expandBtn}
                        onClick={() => toggleGroup(group.id)}
                        title={expandedGroups.has(group.id) ? 'Sakrij' : 'Prikaži sve'}
                      >
                        {expandedGroups.has(group.id) ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    )}
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(group.id)}
                      title="Obriši"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <div className={styles.cardBody}>
                  <p className={styles.mainQuestion}>{group.reprezentativnoPitanje}</p>
                  
                  {expandedGroups.has(group.id) && group.instances.length > 1 && (
                    <div className={styles.similarQuestions}>
                      <div className={styles.similarHeader}>Slična pitanja:</div>
                      {group.instances.slice(1).map((instance, idx) => (
                        <div key={idx} className={styles.similarItem}>
                          <div className={styles.similarMeta}>
                            <span className={styles.similarAuthor}>{instance.ime}</span>
                            <span className={styles.similarDate}>
                              {formatDate(instance.created_at)}
                            </span>
                          </div>
                          <p className={styles.similarText}>{instance.pitanje}</p>
                          <button
                            className={styles.deleteSmallBtn}
                            onClick={() => handleDelete(instance.id)}
                            title="Obriši"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}