'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/app/utils/api';
import styles from './statistika.module.css';
import { 
  FaArrowLeft, 
  FaShoppingCart,
  FaMoneyBillWave,
  FaUsers,
  FaChartLine,
  FaSearch,
  FaTimes,
  FaEye,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaTruck,
  FaTicketAlt
} from 'react-icons/fa';

export default function AdminStatistika() {
  const [transakcije, setTransakcije] = useState([]);
  const [filteredTransakcije, setFilteredTransakcije] = useState([]);
  const [selectedTransakcija, setSelectedTransakcija] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filteri
  const [searchEmail, setSearchEmail] = useState('');
  const [searchIme, setSearchIme] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    fetchTransakcije();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transakcije, searchEmail, searchIme, filterStatus, filterDateFrom, filterDateTo]);

  const fetchTransakcije = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/transakcije');
      setTransakcije(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transakcije];

    // Filter po email-u
    if (searchEmail.trim()) {
      filtered = filtered.filter(t => 
        t.email?.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    // Filter po imenu
    if (searchIme.trim()) {
      filtered = filtered.filter(t => 
        `${t.ime} ${t.prezime}`.toLowerCase().includes(searchIme.toLowerCase())
      );
    }

    // Filter po statusu
    if (filterStatus) {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Filter po datumu (od)
    if (filterDateFrom) {
      filtered = filtered.filter(t => 
        new Date(t.created_at) >= new Date(filterDateFrom)
      );
    }

    // Filter po datumu (do)
    if (filterDateTo) {
      const dateTo = new Date(filterDateTo);
      dateTo.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => 
        new Date(t.created_at) <= dateTo
      );
    }

    setFilteredTransakcije(filtered);
  };

  const handleClearFilters = () => {
    setSearchEmail('');
    setSearchIme('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/api/transakcije/${id}/status`, { status: newStatus });
      await fetchTransakcije();
      if (selectedTransakcija?.id === id) {
        setSelectedTransakcija({ ...selectedTransakcija, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Greška prilikom ažuriranja statusa');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-Latn-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-Latn-RS', {
      style: 'currency',
      currency: 'RSD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'na_cekanju': { 
        label: 'Na čekanju', 
        color: '#FFA726', 
        icon: <FaClock /> 
      },
      'potvrdjeno': { 
        label: 'Potvrđeno', 
        color: '#42A5F5', 
        icon: <FaCheckCircle /> 
      },
      'isporuceno': { 
        label: 'Isporučeno', 
        color: '#66BB6A', 
        icon: <FaTruck /> 
      },
      'otkazano': { 
        label: 'Otkazano', 
        color: '#EF5350', 
        icon: <FaTimesCircle /> 
      }
    };
    return statusMap[status] || statusMap['na_cekanju'];
  };

  const getStats = () => {
    const total = filteredTransakcije.length;
    const revenue = filteredTransakcije.reduce((sum, t) => sum + parseFloat(t.ukupno), 0);
    const uniqueCustomers = new Set(filteredTransakcije.map(t => t.email || `${t.ime}-${t.telefon}`)).size;
    const avgOrderValue = total > 0 ? revenue / total : 0;

    const statusCounts = {
      na_cekanju: filteredTransakcije.filter(t => t.status === 'na_cekanju').length,
      potvrdjeno: filteredTransakcije.filter(t => t.status === 'potvrdjeno').length,
      isporuceno: filteredTransakcije.filter(t => t.status === 'isporuceno').length,
      otkazano: filteredTransakcije.filter(t => t.status === 'otkazano').length
    };

    return { total, revenue, uniqueCustomers, avgOrderValue, statusCounts };
  };

  const stats = getStats();
  const hasActiveFilters = searchEmail || searchIme || filterStatus || filterDateFrom || filterDateTo;

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/admin" className={styles.backBtn}>
            <FaArrowLeft /> Nazad na Admin
          </Link>
        </div>
        <h1>Statistika i Transakcije</h1>

        {/* Statistike */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(66, 165, 245, 0.1)' }}>
              <FaShoppingCart style={{ color: '#42A5F5' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{stats.total}</span>
              <span className={styles.statLabel}>Ukupno narudžbina</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(102, 187, 106, 0.1)' }}>
              <FaMoneyBillWave style={{ color: '#66BB6A' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{formatCurrency(stats.revenue)}</span>
              <span className={styles.statLabel}>Ukupan prihod</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(171, 71, 188, 0.1)' }}>
              <FaUsers style={{ color: '#AB47BC' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{stats.uniqueCustomers}</span>
              <span className={styles.statLabel}>Jedinstvenih kupaca</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(255, 167, 38, 0.1)' }}>
              <FaChartLine style={{ color: '#FFA726' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{formatCurrency(stats.avgOrderValue)}</span>
              <span className={styles.statLabel}>Prosečna narudžbina</span>
            </div>
          </div>
        </div>

        {/* Status statistika */}
        <div className={styles.statusStats}>
          <div className={styles.statusStatItem}>
            <FaClock style={{ color: '#FFA726' }} />
            <span>Na čekanju: <strong>{stats.statusCounts.na_cekanju}</strong></span>
          </div>
          <div className={styles.statusStatItem}>
            <FaCheckCircle style={{ color: '#42A5F5' }} />
            <span>Potvrđeno: <strong>{stats.statusCounts.potvrdjeno}</strong></span>
          </div>
          <div className={styles.statusStatItem}>
            <FaTruck style={{ color: '#66BB6A' }} />
            <span>Isporučeno: <strong>{stats.statusCounts.isporuceno}</strong></span>
          </div>
          <div className={styles.statusStatItem}>
            <FaTimesCircle style={{ color: '#EF5350' }} />
            <span>Otkazano: <strong>{stats.statusCounts.otkazano}</strong></span>
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
            <label><FaUsers /> Ime kupca</label>
            <input
              type="text"
              value={searchIme}
              onChange={(e) => setSearchIme(e.target.value)}
              placeholder="Pretraži po imenu..."
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Svi statusi</option>
              <option value="na_cekanju">Na čekanju</option>
              <option value="potvrdjeno">Potvrđeno</option>
              <option value="isporuceno">Isporučeno</option>
              <option value="otkazano">Otkazano</option>
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

      {/* Lista transakcija */}
      <section className={styles.transakcijeSection}>
        <h3>Transakcije ({filteredTransakcije.length})</h3>
        {loading ? (
          <div className={styles.loading}>Učitavanje...</div>
        ) : filteredTransakcije.length === 0 ? (
          <div className={styles.empty}>
            {hasActiveFilters 
              ? 'Nema transakcija koje odgovaraju filterima.'
              : 'Nema transakcija u bazi.'
            }
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kupac</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Iznos</th>
                  <th>Status</th>
                  <th>Datum</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransakcije.map((transakcija) => {
                  const statusInfo = getStatusInfo(transakcija.status);
                  return (
                    <tr key={transakcija.id}>
                      <td><strong>#{transakcija.id}</strong></td>
                      <td>{transakcija.ime} {transakcija.prezime}</td>
                      <td>{transakcija.email || 'N/A'}</td>
                      <td>{transakcija.telefon}</td>
                      <td><strong>{formatCurrency(transakcija.ukupno)}</strong></td>
                      <td>
                        <span 
                          className={styles.statusBadge}
                          style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}
                        >
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </td>
                      <td>{formatDate(transakcija.created_at)}</td>
                      <td>
                        <button
                          onClick={() => setSelectedTransakcija(transakcija)}
                          className={styles.viewBtn}
                        >
                          <FaEye /> Detalji
                        </button>
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
      {selectedTransakcija && (
        <div className={styles.modal} onClick={() => setSelectedTransakcija(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalji transakcije #{selectedTransakcija.id}</h2>
              <button 
                onClick={() => setSelectedTransakcija(null)}
                className={styles.closeBtn}
              >
                <FaTimes />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Informacije o kupcu */}
              <div className={styles.section}>
                <h3><FaUsers /> Informacije o kupcu</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Ime i prezime:</span>
                    <span className={styles.infoValue}>{selectedTransakcija.ime} {selectedTransakcija.prezime}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}><FaEnvelope /> Email:</span>
                    <span className={styles.infoValue}>{selectedTransakcija.email || 'N/A'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}><FaPhone /> Telefon:</span>
                    <span className={styles.infoValue}>{selectedTransakcija.telefon}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}><FaMapMarkerAlt /> Adresa:</span>
                    <span className={styles.infoValue}>
                      {selectedTransakcija.adresa}, {selectedTransakcija.grad} {selectedTransakcija.postanski_broj}
                    </span>
                  </div>
                </div>
              </div>

              {/* Proizvodi */}
              <div className={styles.section}>
                <h3><FaBox /> Naručeni proizvodi</h3>
                <div className={styles.proizvodiList}>
                  {selectedTransakcija.proizvodi.map((proizvod, idx) => (
                    <div key={idx} className={styles.proizvodItem}>
                      <div className={styles.proizvodInfo}>
                        <strong>{proizvod.naziv}</strong>
                        <span>Količina: {proizvod.kolicina}</span>
                      </div>
                      <div className={styles.proizvodCena}>
                        {formatCurrency(proizvod.cena * proizvod.kolicina)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popust */}
              {selectedTransakcija.popust_kod && (
                <div className={styles.section}>
                  <h3><FaTicketAlt /> Popust</h3>
                  <div className={styles.popustInfo}>
                    <span>Kod: <strong>{selectedTransakcija.popust_kod}</strong></span>
                    <span>Procenat: <strong>{selectedTransakcija.popust_procenat}%</strong></span>
                  </div>
                </div>
              )}

              {/* Ukupno i status */}
              <div className={styles.section}>
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Ukupno:</span>
                  <span className={styles.totalAmount}>{formatCurrency(selectedTransakcija.ukupno)}</span>
                </div>

                <div className={styles.statusControl}>
                  <label>Promeni status:</label>
                  <select
                    value={selectedTransakcija.status}
                    onChange={(e) => handleStatusChange(selectedTransakcija.id, e.target.value)}
                    className={styles.statusSelect}
                  >
                    <option value="na_cekanju">Na čekanju</option>
                    <option value="potvrdjeno">Potvrđeno</option>
                    <option value="isporuceno">Isporučeno</option>
                    <option value="otkazano">Otkazano</option>
                  </select>
                </div>

                <div className={styles.dateInfo}>
                  <small>Kreirano: {formatDate(selectedTransakcija.created_at)}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}