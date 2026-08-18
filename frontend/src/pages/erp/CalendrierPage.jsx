import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, User, Flag, Calendar, CheckCircle, Circle } from 'lucide-react';
import api from '../../services/api';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const PRIORITE_COLORS = {
  basse: '#94a3b8',
  moyenne: '#3b82f6',
  haute: '#f59e0b',
  urgente: '#ef4444',
};

const STATUT_CONFIG = {
  a_faire: { label: 'À faire', color: '#94a3b8', icon: Circle },
  en_cours: { label: 'En cours', color: '#3b82f6', icon: Clock },
  termine: { label: 'Terminé', color: '#22c55e', icon: CheckCircle },
};

export default function CalendrierPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [taches, setTaches] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // Quick-add modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    employe_id: '',
    priorite: 'moyenne',
    statut: 'a_faire',
    date_echeance: '',
    couleur: '',
  });

  useEffect(() => {
    fetchTaches();
    fetchEmployes();
  }, [currentMonth, currentYear]);

  const fetchTaches = async () => {
    setLoading(true);
    try {
      const response = await api.get('/taches', {
        params: { mois: currentMonth + 1, annee: currentYear }
      });
      setTaches(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching taches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployes = async () => {
    try {
      const response = await api.get('/employes');
      setEmployes(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching employes:', error);
    }
  };

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // Build calendar grid
  const getCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    let startDow = firstDay.getDay(); // 0=Sun
    startDow = startDow === 0 ? 6 : startDow - 1; // Convert to Mon=0

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = startDow - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, currentMonth: false, date: null });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, currentMonth: true, date: dateStr });
    }

    // Next month padding
    const remainder = days.length % 7;
    if (remainder > 0) {
      for (let i = 1; i <= 7 - remainder; i++) {
        days.push({ day: i, currentMonth: false, date: null });
      }
    }

    return days;
  };

  const getTachesForDate = (dateStr) => {
    if (!dateStr) return [];
    return taches.filter(t => {
      if (!t.date_echeance) return false;
      return t.date_echeance.startsWith(dateStr);
    });
  };

  const handleDayClick = (dayObj) => {
    if (!dayObj.currentMonth) return;
    setSelectedDay(dayObj.date);
    setShowSidebar(true);
  };

  const handleQuickAdd = (dateStr) => {
    setFormData({
      titre: '',
      description: '',
      employe_id: '',
      priorite: 'moyenne',
      statut: 'a_faire',
      date_echeance: dateStr || '',
      couleur: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.employe_id) delete payload.employe_id;
      if (!payload.couleur) delete payload.couleur;

      await api.post('/taches', payload);
      setIsModalOpen(false);
      fetchTaches();
    } catch (error) {
      console.error('Error creating tache:', error);
      alert('Erreur lors de la création de la tâche');
    }
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateStr === todayStr;
  };

  const calendarDays = getCalendarDays();
  const selectedDayTaches = selectedDay ? getTachesForDate(selectedDay) : [];

  const getEmployeName = (tache) => {
    if (tache.employe?.user) {
      return `${tache.employe.user.prenom || ''} ${tache.employe.user.name || ''}`.trim();
    }
    return 'Non assigné';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 140px)' }}>
      {/* Calendar Main */}
      <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={28} />
              Calendrier
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={goToToday} style={{
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
              color: '#8b5cf6', borderRadius: 8, padding: '6px 16px',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; }}
            >
              Aujourd'hui
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              background: 'rgba(255,255,255,0.06)', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <button onClick={goToPrevMonth} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '8px 12px', color: 'var(--text-primary)', display: 'flex',
                borderRadius: '10px 0 0 10px', transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <ChevronLeft size={20} />
              </button>
              <span style={{
                fontWeight: 700, fontSize: '1.1rem', minWidth: 180, textAlign: 'center',
                color: 'var(--text-primary)', padding: '0 8px',
              }}>
                {MOIS_NOMS[currentMonth]} {currentYear}
              </span>
              <button onClick={goToNextMonth} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '8px 12px', color: 'var(--text-primary)', display: 'flex',
                borderRadius: '0 10px 10px 0', transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <button onClick={() => handleQuickAdd('')} className="erp-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}>
              <Plus size={16} /> Tâche
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0,
          marginBottom: 4,
        }}>
          {JOURS.map(j => (
            <div key={j} style={{
              textAlign: 'center', padding: '8px 0',
              fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              {j}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 2, flex: 1,
        }}>
          {calendarDays.map((dayObj, i) => {
            const dayTaches = getTachesForDate(dayObj.date);
            const isTodayCell = isToday(dayObj.date);
            const isSelected = selectedDay === dayObj.date;

            return (
              <div
                key={i}
                onClick={() => handleDayClick(dayObj)}
                style={{
                  background: isTodayCell
                    ? 'rgba(139,92,246,0.08)'
                    : isSelected
                      ? 'rgba(59,130,246,0.08)'
                      : dayObj.currentMonth
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(255,255,255,0.01)',
                  border: isTodayCell
                    ? '2px solid rgba(139,92,246,0.4)'
                    : isSelected
                      ? '2px solid rgba(59,130,246,0.3)'
                      : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: '6px',
                  minHeight: 85,
                  cursor: dayObj.currentMonth ? 'pointer' : 'default',
                  opacity: dayObj.currentMonth ? 1 : 0.35,
                  transition: 'all 0.15s ease',
                  overflow: 'hidden',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (dayObj.currentMonth) e.currentTarget.style.background = isTodayCell ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { if (dayObj.currentMonth) e.currentTarget.style.background = isTodayCell ? 'rgba(139,92,246,0.08)' : isSelected ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)'; }}
              >
                <div style={{
                  fontWeight: isTodayCell ? 800 : 600,
                  fontSize: '0.85rem',
                  color: isTodayCell ? '#8b5cf6' : 'var(--text-primary)',
                  marginBottom: 4,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{
                    ...(isTodayCell ? {
                      background: '#8b5cf6', color: '#fff',
                      width: 24, height: 24, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.78rem',
                    } : {}),
                  }}>
                    {dayObj.day}
                  </span>
                  {dayObj.currentMonth && dayTaches.length > 0 && (
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700,
                      background: 'rgba(139,92,246,0.15)', color: '#8b5cf6',
                      padding: '1px 6px', borderRadius: 10,
                    }}>
                      {dayTaches.length}
                    </span>
                  )}
                </div>

                {/* Task dots */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dayTaches.slice(0, 3).map((t, ti) => (
                    <div key={ti} style={{
                      fontSize: '0.68rem',
                      padding: '2px 5px',
                      borderRadius: 4,
                      background: `${PRIORITE_COLORS[t.priorite] || '#94a3b8'}18`,
                      color: PRIORITE_COLORS[t.priorite] || '#94a3b8',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      borderLeft: `3px solid ${PRIORITE_COLORS[t.priorite] || '#94a3b8'}`,
                    }}>
                      {t.titre}
                    </div>
                  ))}
                  {dayTaches.length > 3 && (
                    <div style={{
                      fontSize: '0.65rem', color: 'var(--text-muted)',
                      fontWeight: 600, paddingLeft: 5,
                    }}>
                      +{dayTaches.length - 3} de plus
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar — Selected day details */}
      {showSidebar && (
        <div className="glass-panel" style={{
          width: 320, padding: '1.5rem', flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.3s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {selectedDay ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long'
              }) : ''}
            </h3>
            <button onClick={() => setShowSidebar(false)} style={{
              background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8,
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}>
              <X size={18} />
            </button>
          </div>

          <button
            onClick={() => handleQuickAdd(selectedDay)}
            style={{
              width: '100%', padding: '10px', marginBottom: '1rem',
              background: 'rgba(139,92,246,0.1)', border: '1px dashed rgba(139,92,246,0.3)',
              borderRadius: 10, color: '#8b5cf6', fontWeight: 600,
              fontSize: '0.88rem', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
          >
            <Plus size={16} /> Ajouter une tâche
          </button>

          {selectedDayTaches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              <Calendar size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontSize: '0.88rem' }}>Aucune tâche ce jour</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto' }}>
              {selectedDayTaches.map(tache => {
                const stat = STATUT_CONFIG[tache.statut] || STATUT_CONFIG.a_faire;
                const StatIcon = stat.icon;
                return (
                  <div key={tache.id} style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '0.9rem',
                    borderLeft: `4px solid ${PRIORITE_COLORS[tache.priorite] || '#94a3b8'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <StatIcon size={16} color={stat.color} />
                      <span style={{
                        fontWeight: 600, fontSize: '0.92rem',
                        color: tache.statut === 'termine' ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: tache.statut === 'termine' ? 'line-through' : 'none',
                      }}>
                        {tache.titre}
                      </span>
                    </div>

                    {tache.description && (
                      <p style={{
                        fontSize: '0.8rem', color: 'var(--text-muted)',
                        margin: '0 0 8px 0', lineHeight: 1.4,
                      }}>
                        {tache.description.substring(0, 100)}{tache.description.length > 100 ? '...' : ''}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20,
                        background: `${PRIORITE_COLORS[tache.priorite]}20`,
                        color: PRIORITE_COLORS[tache.priorite],
                        fontWeight: 600,
                      }}>
                        {tache.priorite?.charAt(0).toUpperCase() + tache.priorite?.slice(1)}
                      </span>
                      <span style={{
                        fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20,
                        background: `${stat.color}18`,
                        color: stat.color,
                        fontWeight: 600,
                      }}>
                        {stat.label}
                      </span>
                    </div>

                    <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={13} /> {getEmployeName(tache)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick Add Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }} onClick={() => setIsModalOpen(false)}>
          <div style={{
            background: '#fff', borderRadius: 16,
            width: '90%', maxWidth: 500, maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                Nouvelle Tâche
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{
                background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: 8,
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem 2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: 6, display: 'block' }}>
                  Titre *
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Titre de la tâche"
                  value={formData.titre}
                  onChange={e => setFormData({ ...formData, titre: e.target.value })}
                  required
                  style={{ color: '#1e293b', padding: '10px' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: 6, display: 'block' }}>
                  Description
                </label>
                <textarea
                  rows="2"
                  className="glass-input"
                  placeholder="Description..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ color: '#1e293b', padding: '10px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: 6, display: 'block' }}>
                    Priorité
                  </label>
                  <select
                    className="glass-input"
                    value={formData.priorite}
                    onChange={e => setFormData({ ...formData, priorite: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  >
                    <option value="basse">🟢 Basse</option>
                    <option value="moyenne">🔵 Moyenne</option>
                    <option value="haute">🟡 Haute</option>
                    <option value="urgente">🔴 Urgente</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: 6, display: 'block' }}>
                    Assigné à
                  </label>
                  <select
                    className="glass-input"
                    value={formData.employe_id}
                    onChange={e => setFormData({ ...formData, employe_id: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  >
                    <option value="">— Non assigné —</option>
                    {employes.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.user ? `${emp.user.prenom || ''} ${emp.user.name || ''}`.trim() : `Employé #${emp.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: 6, display: 'block' }}>
                  Date d'échéance
                </label>
                <input
                  type="date"
                  className="glass-input"
                  value={formData.date_echeance}
                  onChange={e => setFormData({ ...formData, date_echeance: e.target.value })}
                  style={{ color: '#1e293b', padding: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="erp-btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="erp-btn-primary">
                  Créer la Tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
