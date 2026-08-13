import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { ToggleLeft, ToggleRight, Mail, MessageSquare, Bell, Volume2, Clock, CheckCircle } from "lucide-react";

function Toggle({ value, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      style={{ background: "none", border: "none", cursor: disabled ? "default" : "pointer", padding: 0, display: "flex", alignItems: "center", color: value ? "#10b981" : "var(--text-muted)", opacity: disabled ? 0.4 : 1, transition: "color .2s" }}>
      {value ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
    </button>
  );
}

function DestBadge({ role }) {
  const colors = {
    gestionnaire: { bg: "rgba(59,130,246,0.12)", text: "#3b82f6" },
    infirmier:    { bg: "rgba(16,185,129,0.12)", text: "#10b981" },
    client:       { bg: "rgba(245,158,11,0.12)",  text: "#f59e0b" },
  };
  const c = colors[role] || { bg: "rgba(148,163,184,0.12)", text: "#94a3b8" };
  return (
    <span style={{ background: c.bg, color: c.text, padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600, marginRight: 4 }}>
      {role}
    </span>
  );
}

export default function NotificationsSettings() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError]   = useState(null);

  // Display & Popup settings saved in localStorage
  const [displaySettings, setDisplaySettings] = useState(() => {
    const saved = localStorage.getItem('darsoins_notif_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      enableToast: true,
      toastDuration: 5000,
      enableSound: true,
      pollingInterval: 15000,
    };
  });

  const handleDisplaySettingChange = (field, value) => {
    const updated = { ...displaySettings, [field]: value };
    setDisplaySettings(updated);
    localStorage.setItem('darsoins_notif_settings', JSON.stringify(updated));
    window.dispatchEvent(new Event('notif-settings-updated'));
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/notif-configs");
      setData(res.data?.data || res.data || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  const handleToggle = async (notif, field, value) => {
    setUpdating(notif.id + field);
    try {
      const payload = { [field]: value };
      const res = await api.put(`/notif-configs/${notif.id}`, payload);
      const updated = res.data?.data || res.data;
      setData(data.map(n => n.id === notif.id ? { ...n, ...updated } : n));
    } catch (e) {
      setError(e.response?.data?.message || "Erreur");
      setTimeout(() => setError(null), 3000);
    } finally { setUpdating(null); }
  };

  const handleToggleActif = async (notif) => {
    setUpdating(notif.id + "actif");
    try {
      const res = await api.patch(`/notif-configs/${notif.id}/toggle`);
      const updated = res.data?.data || res.data;
      setData(data.map(n => n.id === notif.id ? { ...n, ...updated } : n));
    } catch (e) {
      setError(e.response?.data?.message || "Erreur");
      setTimeout(() => setError(null), 3000);
    } finally { setUpdating(null); }
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>Chargement...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--primary-color)", marginBottom: "0.3rem" }}>Configuration des Notifications</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Gérez les canaux par événement ainsi que les paramètres d'affichage des popups en temps réel.</p>
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid #f87171", borderRadius: 8, padding: "0.8rem 1.2rem", marginBottom: "1.5rem", color: "#f87171", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}

      {/* Section 1 : Canaux par événements */}
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1e293b", marginBottom: "1rem" }}>Événements et Canaux de Diffusion</h2>

      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid var(--glass-border)" }}>
              <th style={{ padding: "1rem 1.2rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Evenement</th>
              <th style={{ padding: "1rem 1.2rem", textAlign: "center", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Mail size={13} /> Email</div>
              </th>
              <th style={{ padding: "1rem 1.2rem", textAlign: "center", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><MessageSquare size={13} /> SMS</div>
              </th>
              <th style={{ padding: "1rem 1.2rem", textAlign: "center", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Bell size={13} /> App (In-App)</div>
              </th>
              <th style={{ padding: "1rem 1.2rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Destinataires</th>
              <th style={{ padding: "1rem 1.2rem", textAlign: "center", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actif</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  Aucun evenement configure.<br />
                  <span style={{ fontSize: "0.85rem" }}>Lancez <code style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 4 }}>php artisan db:seed --class=NotifConfigSeeder</code></span>
                </td>
              </tr>
            ) : (
              data.map(notif => (
                <tr key={notif.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: notif.est_actif ? 1 : 0.5, transition: "all .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "1rem 1.2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontSize: "1.3rem" }}>{notif.icone || "🔔"}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{notif.label}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{notif.evenement}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.2rem", textAlign: "center" }}>
                    <Toggle
                      value={notif.canal_email}
                      disabled={updating === notif.id + "canal_email"}
                      onChange={v => handleToggle(notif, "canal_email", v)}
                    />
                  </td>
                  <td style={{ padding: "1rem 1.2rem", textAlign: "center" }}>
                    <Toggle
                      value={notif.canal_sms}
                      disabled={updating === notif.id + "canal_sms"}
                      onChange={v => handleToggle(notif, "canal_sms", v)}
                    />
                  </td>
                  <td style={{ padding: "1rem 1.2rem", textAlign: "center" }}>
                    <Toggle
                      value={notif.canal_app}
                      disabled={updating === notif.id + "canal_app"}
                      onChange={v => handleToggle(notif, "canal_app", v)}
                    />
                  </td>
                  <td style={{ padding: "1rem 1.2rem" }}>
                    {(notif.destinataires || []).map(r => <DestBadge key={r} role={r} />)}
                  </td>
                  <td style={{ padding: "1rem 1.2rem", textAlign: "center" }}>
                    <Toggle
                      value={notif.est_actif}
                      disabled={updating === notif.id + "actif"}
                      onChange={() => handleToggleActif(notif)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Section 2 : Options d'Affichage & Popups */}
      <div className="glass-panel" style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Volume2 size={20} color="#2563eb" /> Options d'Affichage & Popups Flottants (Toasts)
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Personnalisez la façon dont les notifications système vous sont signalées à l'écran en temps réel.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Active Toast */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>Popups Flottants (Toasts)</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Afficher une bannière temporaire en bas à droite à chaque alerte.</div>
            </div>
            <Toggle 
              value={displaySettings.enableToast} 
              onChange={(v) => handleDisplaySettingChange('enableToast', v)} 
            />
          </div>

          {/* Sound alert */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>Signal Sonore (Bip Audio)</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Jouer un signal sonore discret à la réception d'une notification.</div>
            </div>
            <Toggle 
              value={displaySettings.enableSound} 
              onChange={(v) => handleDisplaySettingChange('enableSound', v)} 
            />
          </div>

          {/* Toast Duration */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.3rem' }}>
              Durée d'affichage du Popup Toast
            </label>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.8rem' }}>Temps d'affichage de la bannière avant fermeture automatique.</div>
            <select 
              value={displaySettings.toastDuration}
              onChange={(e) => handleDisplaySettingChange('toastDuration', Number(e.target.value))}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#1e293b', fontWeight: 600 }}
            >
              <option value={3000}>3 Secondes (Court)</option>
              <option value={5000}>5 Secondes (Standard)</option>
              <option value={10000}>10 Secondes (Long)</option>
              <option value={15000}>15 Secondes (Très long)</option>
              <option value={0}>Maintenir jusqu'à fermeture manuelle</option>
            </select>
          </div>

          {/* Polling Interval */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.3rem' }}>
              Fréquence de Vérification (Temps Réel)
            </label>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.8rem' }}>Intervalle de mise à jour des nouvelles notifications.</div>
            <select 
              value={displaySettings.pollingInterval}
              onChange={(e) => handleDisplaySettingChange('pollingInterval', Number(e.target.value))}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#1e293b', fontWeight: 600 }}
            >
              <option value={5000}>Toutes les 5 secondes (Ultra-rapide)</option>
              <option value={15000}>Toutes les 15 secondes (Recommandé)</option>
              <option value={30000}>Toutes les 30 secondes</option>
              <option value={60000}>Toutes les 60 secondes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Legende */}
      <div style={{ marginTop: "1rem", display: "flex", gap: "1.5rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
        <span>Les modifications sont sauvegardées immédiatement.</span>
        <span>|</span>
        <span>L'envoi réel par email/SMS nécessite une configuration SMTP / Passerelle SMS.</span>
      </div>
    </div>
  );
}

