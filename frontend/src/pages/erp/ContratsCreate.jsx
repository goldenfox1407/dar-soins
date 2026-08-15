import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, FileText, HeartPulse, ShieldCheck, User, RotateCcw, Sparkles } from 'lucide-react';
import api from '../../services/api';

export const READY_CLAUSES = {
  nuit: {
    label: '🌙 Garde de Nuit (20h - 08h)',
    horaires: '20h00 - 08h00',
    tarif: 450,
    prescriptions: `1. Surveillance nocturne continue et assistance au coucher / lever.
2. Administration du traitement médical du soir à 21h00 selon prescription.
3. Prise et relevé des constantes vitales (Tension artérielle, Fréquence cardiaque, Température, Glycémie) à 22h00, 02h00 et 06h00.
4. Surveillance de l'oxygénation et aide aux changements de position pour prévention des escarres.`,
    clauses: `Article 1 - Objet & Horaires : Le prestataire DAR-SOINS met à disposition un(e) infirmier(ère) qualifié(e) pour assurer la garde de nuit de 20h00 à 08h00.
Article 2 - Continuité des soins : L'infirmier(ère) s'engage à assurer une présence vigilante continue sans interruption, et à administrer les prescriptions médicales validées par le médecin traitant.
Article 3 - Protocole d'Urgence : En cas d'altération brutale de l'état clinique ou de détresse vitale, l'infirmier(ère) contacte immédiatement le médecin régulateur / SAMU (141) et avertit la famille référente.
Article 4 - Hygiène et Déontologie : Respect strict des règles d'asepsie, du secret médical et de l'intimité du patient.
Article 5 - Modification et Préavis : Toute modification de planning ou annulation nécessite un préavis minimum de 24 heures.`
  },
  jour: {
    label: '☀️ Garde de Jour (08h - 20h)',
    horaires: '08h00 - 20h00',
    tarif: 400,
    prescriptions: `1. Aide à la toilette complète, soins d'hygiène corporelle et réfection du lit.
2. Administration des traitements du matin (08h30) et du midi (13h00) selon prescriptions.
3. Réfection des pansements stériles et surveillance de la cicatrisation.
4. Contrôle des paramètres vitaux avant et après les repas.
5. Aide aux repas, hydratation régulière et mobilisation motrice douce.`,
    clauses: `Article 1 - Objet de la prestation : Mise à disposition d'un personnel soignant pour la surveillance et les soins de jour de 08h00 à 20h00.
Article 2 - Rôle Soignant : Exécution des soins infirmiers prescrits, aide à l'alimentation, hydratation et surveillance de l'état général du patient.
Article 3 - Traçabilité : Enregistrement de chaque acte et des consommations de matériel médical sur le carnet de soins DAR-SOINS.
Article 4 - Urgence Médicale : Prise en charge immédiate des incidents et liaison constante avec les proches du patient et les services d'urgence.
Article 5 - Résiliation : Possibilité de prorogation ou d'interruption du contrat par accord mutuel avec un préavis de 24 heures.`
  },
  '24h': {
    label: '⏳ Garde Continue 24h/24',
    horaires: '24h / 24 (Relève 2 infirmiers 08h-20h / 20h-08h)',
    tarif: 900,
    prescriptions: `1. Surveillance médicale continue 24h/24 avec relève soignante à 08h00 et 20h00.
2. Soins d'hygiène complets, prévention rigoureuse des escarres (changements de position toutes les 3h).
3. Administration des traitements oraux et injectables selon protocole médical strict.
4. Surveillance de la diurèse, du transit et des apports hydriques journaliers.
5. Relevé continu des constantes (Tension, SpO2, Pouls, Glycémie).`,
    clauses: `Article 1 - Prestation Continue 24h/24 : Présence ininterrompue au chevet du patient assurée par un binôme d'infirmiers en rotation coordonnée par DAR-SOINS.
Article 2 - Cahier de Transmission Médicale : Transmission obligatoire et consignation écrite des observations cliniques entre les équipes soignantes.
Article 3 - Remplacement Immédiat : En cas d'indisponibilité fortuite d'un soignant, DAR-SOINS garantit son remplacement sous un délai maximal de 2 heures.
Article 4 - Sécurité & Matériel : Le patient ou sa famille met à disposition l'ordonnance médicale valide et les dispositifs médicaux prescrits.
Article 5 - Facturation & Paiement : Règlement hebdomadaire ou mensuel selon les modalités convenues lors de la signature.`
  },
  post_operatoire: {
    label: '🏥 Soins Post-opératoires Intensifs',
    horaires: '20h00 - 08h00 (ou selon protocole chirurgical)',
    tarif: 550,
    prescriptions: `1. Surveillance post-chirurgicale rapprochée (réveil, conscience, hémodynamique).
2. Surveillance et vidange des drains chirurgicaux (Redon, sonde urinaire) avec quantification.
3. Gestion multimodale de la douleur (EVA) et administration des antalgiques / perfusions IV.
4. Réfection des pansements chirurgicaux avec respect rigoureux des règles d'asepsie.
5. Dépistage précoce des complications thromboemboliques (injections d'anticoagulants HBPM).`,
    clauses: `Article 1 - Soins Hautement Qualifiés : Affectation exclusive d'un(e) infirmier(ère) expérimenté(e) en soins intensifs et réanimation post-opératoire.
Article 2 - Liaison avec le Chirurgien : Communication directe avec le chirurgien traitant ou la clinique en cas de saignement anormal, fièvre (>38.5°C) ou douleur réfractaire.
Article 3 - Protocoles Hospitaliers à Domicile : Application conforme des protocoles de soins hospitaliers et gestion stricte des voies veineuses périphériques.
Article 4 - Confidentialité : Respect absolu du dossier médical et des antécédents chirurgicaux du patient.
Article 5 - Clôture de Prise en Charge : Bilan de fin d'intervention transmis au médecin référent à l'issue du contrat.`
  },
  accompagnement_senior: {
    label: '👵 Accompagnement Senior Dépendance',
    horaires: '09h00 - 18h00',
    tarif: 350,
    prescriptions: `1. Accompagnement dans les actes de la vie quotidienne pour personne âgée dépendante.
2. Préparation et aide à la prise sécurisée du traitement médicamenteux chronique (pilulier).
3. Surveillance de l'équilibre nutritionnel et hydratation régulière tout au long de la journée.
4. Exercices de maintien de l'autonomie, marche assistée et stimulation cognitive.
5. Surveillance des signes de fatigue, confusion ou altération de l'humeur.`,
    clauses: `Article 1 - Objet & Mission : Accompagnement bienveillant et surveillance soignante de jour dédiée aux personnes âgées ou en perte d'autonomie.
Article 2 - Bien-être & Sécurité : Maintien d'un environnement sécurisé évitant les risques de chutes et d'accidents domestiques.
Article 3 - Coordination Familiale : Rapport quotidien aux proches sur l'alimentation, le moral et l'état général de santé du bénéficiaire.
Article 4 - Éthique & Respect : Préservation de la dignité, du rythme de vie et des habitudes du patient dans son cadre de vie familial.
Article 5 - Flexibilité : Possibilité d'adapter les plages horaires selon l'évolution du degré d'autonomie (GIR).`
  }
};

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
  
  // Pre-filled with ready-to-use clauses for "nuit"
  const [horairesGarde, setHorairesGarde] = useState(READY_CLAUSES.nuit.horaires);
  const [tarifJournalier, setTarifJournalier] = useState(READY_CLAUSES.nuit.tarif);
  const [statut, setStatut] = useState('actif');
  const [prescriptionsMedicales, setPrescriptionsMedicales] = useState(READY_CLAUSES.nuit.prescriptions);
  const [clausesSpecifiques, setClausesSpecifiques] = useState(READY_CLAUSES.nuit.clauses);

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
    const template = READY_CLAUSES[type];
    if (template) {
      setHorairesGarde(template.horaires);
      setTarifJournalier(template.tarif);
      setPrescriptionsMedicales(template.prescriptions);
      setClausesSpecifiques(template.clauses);
    }
  };

  const handleResetTemplate = () => {
    const template = READY_CLAUSES[typeGarde];
    if (template) {
      setHorairesGarde(template.horaires);
      setTarifJournalier(template.tarif);
      setPrescriptionsMedicales(template.prescriptions);
      setClausesSpecifiques(template.clauses);
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
          <p className="erp-page-subtitle">Établissez un contrat de garde infirmière officiel avec clauses légales et protocoles médicaux pré-remplis.</p>
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
        <div className="erp-card p-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '20px' }}>
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
              Infirmier(ère) Affecté(e)
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>
                Cas & Type de Garde *
              </label>
              <button 
                type="button" 
                onClick={handleResetTemplate}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Recharger les clauses prêtes par défaut pour ce cas"
              >
                <RotateCcw size={12} /> Réinitialiser Clauses
              </button>
            </div>
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
        <div className="erp-card p-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 1fr', gap: '20px' }}>
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

        {/* Medical Prescriptions & Ready Clauses */}
        <div className="erp-card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="erp-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HeartPulse size={18} /> Protocoles Médicaux & Prescriptions de Garde (Pré-remplis)
              </label>
              <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={14} /> Protocole prêt à l'emploi
              </span>
            </div>
            <textarea 
              rows="5"
              className="glass-input"
              value={prescriptionsMedicales}
              onChange={e => setPrescriptionsMedicales(e.target.value)}
              style={{ color: '#1e293b', padding: '12px', lineHeight: 1.5 }}
            />
          </div>

          <div className="erp-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} /> Clauses Juridiques & Engagements Contractuels (Prêts à l'emploi)
              </label>
              <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={14} /> Clauses réglementaires officielles
              </span>
            </div>
            <textarea 
              rows="7"
              className="glass-input"
              value={clausesSpecifiques}
              onChange={e => setClausesSpecifiques(e.target.value)}
              style={{ color: '#1e293b', padding: '12px', lineHeight: 1.5 }}
            />
          </div>

          {/* Price Preview Card */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '18px 24px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>Durée totale calculée :</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d' }}>
                {calculateDays()} jours ({tarifJournalier} MAD / jour)
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>MONTANT TOTAL DU CONTRAT :</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d' }}>
                {calculateTotal().toFixed(2)} MAD
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
