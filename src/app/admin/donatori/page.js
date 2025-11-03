'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/app/utils/api';
import styles from './donatori.module.css';
import { 
  FaArrowLeft, 
  FaUsers,
  FaUserPlus,
  FaCalendarAlt,
  FaSearch,
  FaTimes,
  FaEnvelope,
  FaCrown,
  FaCheckCircle,
  FaTimesCircle,
  FaRobot,
  FaUserCog,
  FaTrash,
  FaClock,
  FaCalendarPlus,
  FaSync
} from 'react-icons/fa';

export default function AdminDonatori() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [donatori, setDonatori] = useState([]);
  const [filteredDonatori, setFilteredDonatori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedDonator, setSelectedDonator] = useState(null);
  
  // Filteri
  const [searchEmail, setSearchEmail] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterIzvor, setFilterIzvor] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Redirect ako nije admin
  useEffect(() => {
    if (user && user.uloga !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.uloga === 'admin') {
      fetchDonatori();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [donatori, searchEmail, filterStatus, filterIzvor, filterDateFrom, filterDateTo]);

  const fetchDonatori = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/patreon/patrons');
      setDonatori(response.data);
    } catch (error) {
      console.error('Error fetching patrons:', error);
      alert('Greška pri učitavanju donatora: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSyncWithPatreon = async () => {
    if (!confirm('Sinhronizovati sve Patreon patrona? Ovo može trajati nekoliko sekundi.')) {
      return;
    }

    try {
      setSyncing(true);
      const response = await api.post('/api/patreon/sync-members');
      
      alert(
        `✅ Sinhronizacija završena!\n\n` +
        `Sinhronizirano: ${response.data.synced}\n` +
        `Greške: ${response.data.errors}\n` +
        `Ukupno patrona na Patreon-u: ${response.data.total}`
      );
      
      await fetchDonatori(); // Osvježi listu
    } catch (error) {
      console.error('Sync error:', error);
      alert('❌ Greška pri sinhronizaciji: ' + (error.response?.data?.message || error.message));
    } finally {
      setSyncing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...donatori];

    // Filter po email-u
    if (searchEmail.trim()) {
      filtered = filtered.filter(d => 
        d.email?.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    // Filter po statusu
    if (filterStatus) {
      filtered = filtered.filter(d => d.status === filterStatus);
    }

    // Filter po izvoru
    if (filterIzvor) {
      filtered = filtered.filter(d => d.izvor === filterIzvor);
    }

    // Filter po datumu (od)
    if (filterDateFrom) {
      filtered = filtered.filter(d => 
        new Date(d.datum_uplate) >= new Date(filterDateFrom)
      );
    }

    // Filter po datumu (do)
    if (filterDateTo) {
      const dateTo = new Date(filterDateTo);
      dateTo.setHours(23, 59, 59, 999);
      filtered = filtered.filter(d => 
        new Date(d.datum_uplate) <= dateTo
      );
    }

    setFilteredDonatori(filtered);
  };

  const handleClearFilters = () => {
    setSearchEmail('');
    setFilterStatus('');
    setFilterIzvor('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const handleDeleteDonator = async (id) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovog donatora?')) {
      return;
    }

    try {
      await api.delete(`/api/patreon/patrons/${id}`);
      await fetchDonatori();
      setSelectedDonator(null);
      alert('✅ Donator uspešno obrisan');
    } catch (error) {
      console.error('Error deleting patron:', error);
      alert('❌ Greška prilikom brisanja donatora: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleExtendAccess = async (id) => {
    if (!confirm('Produžiti pristup za još 30 dana?')) {
      return;
    }

    try {
      const response = await api.put(`/api/patreon/patrons/${id}/extend`);
      await fetchDonatori();
      
      if (selectedDonator?.id === id) {
        const updatedResponse = await api.get('/api/patreon/patrons');
        const updatedDonator = updatedResponse.data.find(d => d.id === id);
        setSelectedDonator(updatedDonator);
      }
      
      alert('✅ Pristup produžen za 30 dana');
    } catch (error) {
      console.error('Error extending access:', error);
      alert('❌ Greška prilikom produžavanja pristupa: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-Latn-RS', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-Latn-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    return status === 'aktivan' 
      ? { label: 'Aktivan', color: '#66BB6A', icon: <FaCheckCircle /> }
      : { label: 'Neaktivan', color: '#EF5350', icon: <FaTimesCircle /> };
  };

  const getIzvorInfo = (izvor) => {
    if (izvor === 'webhook') {
      return { label: 'Patreon (Auto)', icon: <FaRobot />, color: '#AB47BC' };
    } else if (izvor === 'oauth') {
      return { label: 'Patreon (Sync)', icon: <FaSync />, color: '#9C27B0' };
    } else {
      return { label: 'Manuelno', icon: <FaUserCog />, color: '#42A5F5' };
    }
  };

  const isExpired = (datumIsteka) => {
    if (!datumIsteka) return false;
    return new Date(datumIsteka) < new Date();
  };

  const getStats = () => {
    const total = filteredDonatori.length;
    const activeCount = filteredDonatori.filter(d => d.status === 'aktivan').length;
    const inactiveCount = filteredDonatori.filter(d => d.status === 'neaktivan').length;
    const manualCount = filteredDonatori.filter(d => d.izvor === 'manual').length;
    const webhookCount = filteredDonatori.filter(d => d.izvor === 'webhook').length;
    const oauthCount = filteredDonatori.filter(d => d.izvor === 'oauth').length;
    const expiredCount = filteredDonatori.filter(d => isExpired(d.datum_isteka)).length;

    return { total, activeCount, inactiveCount, manualCount, webhookCount, oauthCount, expiredCount };
  };

  const stats = getStats();
  const hasActiveFilters = searchEmail || filterStatus || filterIzvor || filterDateFrom || filterDateTo;

  if (!user || user.uloga !== 'admin') {
    return null;
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/admin" className={styles.backBtn}>
            <FaArrowLeft /> Nazad na Admin
          </Link>
          <div className={styles.headerActions}>
            <button 
              onClick={handleSyncWithPatreon} 
              className={styles.syncBtn}
              disabled={syncing || loading}
            >
              <FaRobot /> {syncing ? 'Sinhronizujem...' : 'Sinhronizuj sa Patreon-om'}
            </button>
            <Link href="/admin/donatori/dodaj" className={styles.addBtn}>
              <FaUserPlus /> Dodaj donatora
            </Link>
          </div>
        </div>
        
        <h1><FaCrown className={styles.titleIcon} /> Premium Donatori</h1>

        {/* Statistike */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
              <FaUsers style={{ color: '#FFD700' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{stats.total}</span>
              <span className={styles.statLabel}>Ukupno donatora</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(102, 187, 106, 0.1)' }}>
              <FaCheckCircle style={{ color: '#66BB6A' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{stats.activeCount}</span>
              <span className={styles.statLabel}>Aktivnih</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(239, 83, 80, 0.1)' }}>
              <FaTimesCircle style={{ color: '#EF5350' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{stats.inactiveCount}</span>
              <span className={styles.statLabel}>Neaktivnih</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(171, 71, 188, 0.1)' }}>
              <FaRobot style={{ color: '#AB47BC' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{stats.webhookCount}</span>
              <span className={styles.statLabel}>Patreon (Auto)</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(156, 39, 176, 0.1)' }}>
              <FaSync style={{ color: '#9C27B0' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{stats.oauthCount}</span>
              <span className={styles.statLabel}>Patreon (Sync)</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(66, 165, 245, 0.1)' }}>
              <FaUserCog style={{ color: '#42A5F5' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{stats.manualCount}</span>
              <span className={styles.statLabel}>Manuelno dodati</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filteri */}
      <section className={styles.filtersSection}>
        <h3><FaSearch /> Filteri</h3>
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label><FaEnvelope /> Email</label>
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Pretraži po email-u..."
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Svi statusi</option>
              <option value="aktivan">Aktivan</option>
              <option value="neaktivan">Neaktivan</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Izvor</label>
            <select
              value={filterIzvor}
              onChange={(e) => setFilterIzvor(e.target.value)}
            >
              <option value="">Svi izvori</option>
              <option value="webhook">Patreon (Auto)</option>
              <option value="oauth">Patreon (Sync)</option>
              <option value="manual">Manuelno</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label><FaCalendarAlt /> Datum od</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label><FaCalendarAlt /> Datum do</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>

          {hasActiveFilters && (
            <div className={styles.filterGroup}>
              <button onClick={handleClearFilters} className={styles.clearBtn}>
                <FaTimes /> Obriši filtere
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Lista donatora */}
      <section className={styles.donatoriSection}>
        <h3>Donatori ({filteredDonatori.length})</h3>
        {loading ? (
          <div className={styles.loading}>Učitavanje...</div>
        ) : filteredDonatori.length === 0 ? (
          <div className={styles.empty}>
            {hasActiveFilters 
              ? 'Nema donatora koji odgovaraju filterima.'
              : 'Nema donatora u bazi. Kliknite "Sinhronizuj sa Patreon-om" da uvezete patrona.'
            }
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Izvor</th>
                  <th>Datum uplate</th>
                  <th>Datum isteka</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonatori.map((donator) => {
                  const statusInfo = getStatusInfo(donator.status);
                  const izvorInfo = getIzvorInfo(donator.izvor);
                  const expired = isExpired(donator.datum_isteka);
                  
                  return (
                    <tr key={donator.id} className={expired ? styles.expiredRow : ''}>
                      <td><strong>#{donator.id}</strong></td>
                      <td>{donator.email}</td>
                      <td>
                        <span 
                          className={styles.statusBadge}
                          style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}
                        >
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        <span 
                          className={styles.izvorBadge}
                          style={{ background: `${izvorInfo.color}20`, color: izvorInfo.color }}
                        >
                          {izvorInfo.icon} {izvorInfo.label}
                        </span>
                      </td>
                      <td>{formatDate(donator.datum_uplate)}</td>
                      <td>
                        <span className={expired ? styles.expiredText : ''}>
                          {formatDate(donator.datum_isteka)}
                          {expired && ' ⚠️'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button
                            onClick={() => setSelectedDonator(donator)}
                            className={styles.detailsBtn}
                          >
                            Detalji
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal sa detaljima */}
      {selectedDonator && (
        <div className={styles.modal} onClick={() => setSelectedDonator(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalji donatora #{selectedDonator.id}</h2>
              <button 
                onClick={() => setSelectedDonator(null)}
                className={styles.closeBtn}
              >
                <FaTimes />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.section}>
                <h3><FaEnvelope /> Osnovne informacije</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email:</span>
                    <span className={styles.infoValue}>{selectedDonator.email}</span>
                  </div>
                  {selectedDonator.patreon_name && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Ime:</span>
                      <span className={styles.infoValue}>{selectedDonator.patreon_name}</span>
                    </div>
                  )}
                  {selectedDonator.patreon_id && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Patreon ID:</span>
                      <span className={styles.infoValue}>{selectedDonator.patreon_id}</span>
                    </div>
                  )}
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Status:</span>
                    <span className={styles.infoValue}>
                      {getStatusInfo(selectedDonator.status).label}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Izvor:</span>
                    <span className={styles.infoValue}>
                      {getIzvorInfo(selectedDonator.izvor).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3><FaCalendarAlt /> Datumi</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Datum uplate:</span>
                    <span className={styles.infoValue}>{formatDateTime(selectedDonator.datum_uplate)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Datum isteka:</span>
                    <span className={styles.infoValue}>
                      {formatDateTime(selectedDonator.datum_isteka)}
                      {isExpired(selectedDonator.datum_isteka) && (
                        <span className={styles.expiredBadge}> Isteklo</span>
                      )}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Kreirano:</span>
                    <span className={styles.infoValue}>{formatDateTime(selectedDonator.created_at)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Poslednja izmena:</span>
                    <span className={styles.infoValue}>{formatDateTime(selectedDonator.updated_at)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={() => handleExtendAccess(selectedDonator.id)}
                  className={styles.extendBtn}
                >
                  <FaCalendarPlus /> Produži za 30 dana
                </button>
                <button
                  onClick={() => handleDeleteDonator(selectedDonator.id)}
                  className={styles.deleteBtn}
                >
                  <FaTrash /> Obriši donatora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}