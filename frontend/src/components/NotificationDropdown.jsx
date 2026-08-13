import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, RefreshCw, Send, X } from 'lucide-react';
import api from '../services/api';

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { titre, message, icone, url }

  const dropdownRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const seenIdsRef = useRef(new Set());
  const isFirstFetchRef = useRef(true);

  // Settings from localStorage (configured in NotificationsSettings page)
  const getDisplaySettings = () => {
    const saved = localStorage.getItem('darsoins_notif_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      enableToast: true,
      toastDuration: 5000, // 5s
      enableSound: true,
      pollingInterval: 15000, // 15s
    };
  };

  const [settings, setSettings] = useState(getDisplaySettings());

  // Listen to storage changes or window event when settings are updated in NotificationsSettings page
  useEffect(() => {
    const handleStorage = () => setSettings(getDisplaySettings());
    window.addEventListener('storage', handleStorage);
    window.addEventListener('notif-settings-updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('notif-settings-updated', handleStorage);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      const data = response.data;
      const newList = data.notifications || [];

      // Only toast TRULY NEW notifications that arrive AFTER initial page load
      if (isFirstFetchRef.current) {
        newList.forEach(n => seenIdsRef.current.add(n.id));
        isFirstFetchRef.current = false;
      } else {
        const newlyArrived = newList.filter(n => !seenIdsRef.current.has(n.id));
        if (newlyArrived.length > 0) {
          newlyArrived.forEach(n => seenIdsRef.current.add(n.id));
          const latest = newlyArrived[0];
          if (settings.enableToast && !latest.read_at) {
            triggerToast(
              latest.data?.titre || 'Nouvelle notification',
              latest.data?.message || '',
              latest.data?.icone || '🔔',
              latest.data?.url
            );
          }
        }
      }

      setUnreadCount(data.unread_count || 0);
      setNotifications(newList);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const intervalTime = settings.pollingInterval || 15000;
    const interval = setInterval(() => {
      fetchNotifications();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [settings.pollingInterval]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerToast = (titre, message, icone = '🔔', url = null) => {
    if (!settings.enableToast) return;

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    // Play audio beep if enabled
    if (settings.enableSound) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } catch (e) {}
    }

    setToast({ titre, message, icone, url });

    if (settings.toastDuration > 0) {
      toastTimeoutRef.current = setTimeout(() => {
        setToast(null);
      }, settings.toastDuration);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all read:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      const deleted = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (deleted && !deleted.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleSendTest = async () => {
    try {
      const res = await api.post('/notifications/test');
      fetchNotifications();
      triggerToast('Notification de test', 'Notification envoyée avec succès dans le système.', '🧪');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read_at) {
      handleMarkAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.data?.url) {
      navigate(notif.data.url);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read_at;
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="erp-icon-btn"
        title="Notifications"
        style={{ position: 'relative' }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="erp-badge" style={{ background: '#ef4444', color: 'white' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="glass-panel custom-scrollbar shadow-2xl animate-scale-in"
          style={{
            position: 'absolute',
            top: '52px',
            right: 0,
            width: '380px',
            maxHeight: '520px',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Notifications</h3>
              {unreadCount > 0 && (
                <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button 
                onClick={handleSendTest}
                title="Tester l'envoi d'une notification"
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Send size={15} />
              </button>
              <button 
                onClick={() => fetchNotifications()}
                title="Rafraîchir"
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', padding: '0 12px', background: '#FFFFFF' }}>
            <button 
              onClick={() => setActiveTab('all')}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                background: 'none',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'all' ? 700 : 500,
                color: activeTab === 'all' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'all' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              Toutes ({notifications.length})
            </button>
            <button 
              onClick={() => setActiveTab('unread')}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                background: 'none',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'unread' ? 700 : 500,
                color: activeTab === 'unread' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'unread' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              Non lues ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', maxHeight: '340px' }}>
            {filteredNotifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>
                  {activeTab === 'unread' ? 'Aucune notification non lue' : 'Aucune notification pour le moment'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isUnread = !notif.read_at;
                const data = notif.data || {};
                
                return (
                  <div 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #f8fafc',
                      background: isUnread ? '#f0f9ff' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      position: 'relative'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = isUnread ? '#e0f2fe' : '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = isUnread ? '#f0f9ff' : '#FFFFFF'}
                  >
                    {/* Icon */}
                    <div style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: '2px' }}>
                      {data.icone || '🔔'}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: isUnread ? 700 : 600, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {data.titre || 'Notification'}
                        </h4>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', flexShrink: 0 }}>
                          {notif.created_at}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.8rem', color: '#475569', margin: '4px 0 0', lineHeight: '1.3' }}>
                        {data.message}
                      </p>

                      {/* Action Bar */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                        {isUnread && (
                          <button 
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <Check size={12} /> Marquer comme lu
                          </button>
                        )}
                        <button 
                          onClick={(e) => handleDelete(notif.id, e)}
                          style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '3px', marginLeft: 'auto' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Unread indicator dot */}
                    {isUnread && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: '6px' }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={handleMarkAllAsRead}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <CheckCheck size={14} /> Tout marquer comme lu
              </button>

              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Rafraîchissement: {settings.pollingInterval / 1000}s
              </span>
            </div>
          )}
        </div>
      )}

      {/* Floating Toast Notification Popup - Rendered via React Portal onto document.body */}
      {toast && createPortal(
        <div 
          className="animate-slide-up shadow-2xl"
          onClick={() => {
            if (toast.url) navigate(toast.url);
            setToast(null);
          }}
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            width: '360px',
            background: '#0F172A',
            color: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            cursor: toast.url ? 'pointer' : 'default',
            pointerEvents: 'auto'
          }}
        >
          <span style={{ fontSize: '1.8rem', flexShrink: 0, lineHeight: 1 }}>{toast.icone}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>{toast.titre}</h5>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.4 }}>{toast.message}</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setToast(null);
            }}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0, marginLeft: '4px' }}
          >
            <X size={18} />
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
