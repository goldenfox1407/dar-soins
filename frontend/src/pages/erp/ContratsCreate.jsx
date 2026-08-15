import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, FileText, HeartPulse, ShieldCheck, User } from 'lucide-react';
import api from '../../services/api';

export default function ContratsCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [infirmiers, setInfirmiers] = useState([]);

  const [clientId, setClientId] = useState('');
  const [infirmierId, setInfirmierId] = useState('');
  const [typeGarde, setTypeGarde] = useState('nuit');
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0]);
  const [dateFin, setDateFin] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [horairesGarde, setHorairesGarde] = useState('20h00 - 08h00');
  const [tarifJournalier, setTarifJournalier] = useState(450);
  const [statut, setStatut] = useState('actif');
  const [prescriptionsMedicales, setPrescriptionsMedicales] = useState('');
  const [clausesSpecifiques, setClausesSpecifiques] = useState('');

  useEffect(() => {
    fetchParams();
  }, []);

  const fetchParams = async () => {
    try {
      const [cliRes, infRes] = await Promise.all([
        api.get('/clients'),
        api.get('/infirmiers')
      ]);
      const fetchedClients = cliRes.data?.data || cliRes.data || [];
      setClients(fetchedClients);
      if (fetchedClients.length > 0) setClientId(fetchedClients[0].id);

      const fetchedInf = infRes.data?.data || infRes.data || [];
      setInfirmiers(fetchedInf);
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const handleTypeGardeChange = (type) => {
    setTypeGarde(type);
    switch (type) {
      case 'nuit':
        setHorairesGarde('20h00 - 08h00');
        setTarifJournalier(450);
        setClausesSpecifiques('Surveillance nocturne continue, prise des constantes toutes les 4h, administration des traitements du soir et du matin.');
        break;
      case 'jour':
        setHorairesGarde('08h00 - 20h00');
        setTarifJournalier(400);
        setClausesSpecifiques('Aide aux soins d\'hygiène du matin, prise de constantes avant les repas, réfection des pansements et suivi des constantes.');
        break;
      case '24h':
        setHorairesGarde('24h / 24 (Roulement 2 infirmiers)');
        setTarifJournalier(900);
        setClausesSpecifiques('Assistance et présence continue 24h/24. Roulement quotidien d\'équipe infirmière.');
        break;
      case 'post_operatoire':
        setHorairesGarde('20h00 - 08h00 (ou selon ordonnance)');
        setTarifJournalier(550);
        setClausesSpecifiques('Surveillance stricte du réveil post-opératoire, soins de drains, gestion de la douleur et prévention des escarres.');
        break;
      case 'accompagnement_senior':
        setHorairesGarde('09h00 - 18h00');
        setTarifJournalier(350);
        setClausesSpecifiques('Accompagnement quotidien des personnes âgées dépendantes, aide à la prise de médicaments et maintien du lien social.');
        break;
      default:
        break;
    }
  };

  const calculateDays = () => {
    if (!dateDebut || !dateFin) return 1;
    const d1 = new Date(dateDebut);
    const d2 = new Date(dateFin);
    const diffTime = Math.abs(d2 - d1);
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  };

  const calculateTotal = () => {
    return calculateDays() * (parseFloat(tarifJournalier) || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientId) {
      alert("Veuillez sélectionner un client.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/contrats', {
        client_id: clientId,
        infirmier_id: infirmierId || null,
        type_garde: typeGarde,
        date_debut: dateDebut,
        date_fin: dateFin,
        horaires_garde: horairesGarde,
        tarif_journalier: parseFloat(tarifJournalier) || 0,
        montant_total: calculateTotal(),
        statut,
        prescriptions_medicales: prescriptionsMedicales,
        clauses_specifiques: clausesSpecifiques,
      });
      navigate('/gestionnaire/contrats');
    } catch (error) {
      const msg = error.response?.data?.message || "Erreur lors de la création du contrat";
      alert(msg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Nouveau Contrat de Garde Médicale</h1>
          <p className="erp-page-subtitle">Établissez un contrat de garde infirmière personnalisé selon le cas de santé du patient.</p>
        </div>
        <div className="erp-page-actions">
          <button onClick={() => navigate('/gestionnaire/contrats')} className="erp-btn-secondary">
            <X size={16} /> Annuler
          </button>
          <button onClick={handleSubmit} disabled={loading} className="erp-btn-primary">
            <Save size={16} /> {loading ? 'Création...' : 'Créer & Signer Contrat'}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Client & Infirmier Selection */}
        <div className="erp-card p-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Patient / Client *
            </label>
            <select 
              className="glass-input" 
              required
              value={clientId} 
              onChange={e => setClientId(e.target.value)}
              style={{ color: '#1e293b', padding: '10px' }}
            >
              {clients.map(c => {
                const name = c.user ? `${c.user.prenom || ''} ${c.user.nom || ''}`.trim() : `Client #${c.id}`;
                return <option key={c.id} value={c.id}>{name}</option>;
              })}
            </select>
          </div>

          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Infirmier(ère) Affecté(e) (Optionnel)
            </label>
            <select 
              className="glass-input" 
              value={infirmierId} 
              onChange={e => setInfirmierId(e.target.value)}
              style={{ color: '#1e293b', padding: '10px' }}
            >
              <option value="">-- Non attribué (En attente) --</option>
              {infirmiers.map(inf => {
                const name = inf.user ? `${inf.user.prenom || ''} ${inf.user.nom || ''}`.trim() : `Infirmier #${inf.id}`;
                return <option key={inf.id} value={inf.id}>{name}</option>;
              })}
            </select>
          </div>

          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Cas & Type de Garde *
            </label>
            <select 
              className="glass-input" 
              required
              value={typeGarde} 
              onChange={e => handleTypeGardeChange(e.target.value)}
              style={{ color: '#1e293b', padding: '10px', fontWeight: 700 }}
            >
              <option value="nuit">🌙 Garde de Nuit (20h - 08h)</option>
              <option value="jour">☀️ Garde de Jour (08h - 20h)</option>
              <option value="24h">⏳ Garde Continue 24h/24</option>
              <option value="post_operatoire">🏥 Soins Post-opératoires Intensifs</option>
              <option value="accompagnement_senior">👵 Accompagnement Senior Dépendance</option>
            </select>
          </div>
        </div>

        {/* Schedule & Pricing Details */}
        <div className="erp-card p-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Date Début *
            </label>
            <input 
              type="date"
              className="glass-input"
              required
              value={dateDebut}
              onChange={e => setDateDebut(e.target.value)}
              style={{ color: '#1e293b', padding: '10px' }}
            />
          </div>

          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Date Fin *
            </label>
            <input 
              type="date"
              className="glass-input"
              required
              value={dateFin}
              onChange={e => setDateFin(e.target.value)}
              style={{ color: '#1e293b', padding: '10px' }}
            />
          </div>

          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Plage Horaire de Garde
            </label>
            <input 
              type="text"
              className="glass-input"
              value={horairesGarde}
              onChange={e => setHorairesGarde(e.target.value)}
              style={{ color: '#1e293b', padding: '10px' }}
            />
          </div>

          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Tarif Journalier (MAD) *
            </label>
            <input 
              type="number"
              step="10"
              min="0"
              className="glass-input"
              required
              value={tarifJournalier}
              onChange={e => setTarifJournalier(e.target.value)}
              style={{ color: '#1e293b', padding: '10px', fontWeight: 700 }}
            />
          </div>
        </div>

        {/* Medical Prescriptions & Clauses */}
        <div className="erp-card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="erp-form-group">
            <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#991b1b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HeartPulse size={18} /> Prescriptions Médicales & Protocole de Soins Pendant la Garde
            </label>
            <textarea 
              rows="3"
              className="glass-input"
              placeholder="ex: Heures de prise de médicaments, surveillance du drain, fréquence de prise de constantes, régime alimentaire..."
              value={prescriptionsMedicales}
              onChange={e => setPrescriptionsMedicales(e.target.value)}
              style={{ color: '#1e293b', padding: '12px' }}
            />
          </div>

          <div className="erp-form-group">
            <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '6px', display: 'block' }}>
              Clauses Spécifiques, Pauses & Engagements de Garde
            </label>
            <textarea 
              rows="3"
              className="glass-input"
              placeholder="ex: Modalités de garde, procédure d'urgence médicale, conditions d'annulation..."
              value={clausesSpecifiques}
              onChange={e => setClausesSpecifiques(e.target.value)}
              style={{ color: '#1e293b', padding: '12px' }}
            />
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>Durée totale du contrat:</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d' }}>
                {calculateDays()} jours
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>Montant Total du Contrat :</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>
                {calculateTotal().toFixed(2)} MAD
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
