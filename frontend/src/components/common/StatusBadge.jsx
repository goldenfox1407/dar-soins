import React from 'react';
import { 
  Clock, CheckCircle, XCircle, AlertCircle, 
  CheckSquare, Activity, UserCheck, Send, FileText 
} from 'lucide-react';

const STATUS_CONFIGS = {
  // Interventions
  en_attente_affectation: { label: 'En attente affectation', bg: '#FEF3C7', color: '#B45309', border: '#FDE68A', icon: Clock },
  en_attente_reponse_infirmier: { label: 'En attente réponse soignant', bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD', icon: Clock },
  infirmier_accepte: { label: 'Soignant assigné / Devis requis', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', icon: UserCheck },
  devis_genere: { label: 'Devis généré', bg: '#EDE9FE', color: '#6D28D9', border: '#DDD6FE', icon: FileText },
  en_attente_reponse_client: { label: 'En attente validation client', bg: '#FEF9C3', color: '#A16207', border: '#FEF08A', icon: Clock },
  acceptee: { label: 'Soin confirmé / En attente intervention', bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0', icon: CheckCircle },
  en_cours: { label: 'Soignant sur place / En cours', bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD', icon: Activity },
  terminee: { label: 'Clôturé & Facturé', bg: '#F1F5F9', color: '#334155', border: '#E2E8F0', icon: CheckCircle },
  annulee: { label: 'Annulé', bg: '#FEE2E2', color: '#B91C1C', border: '#FECACA', icon: XCircle },

  // Règlements / Factures
  paye: { label: 'Payé', bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0', icon: CheckCircle },
  partiel: { label: 'Partiel', bg: '#FEF3C7', color: '#B45309', border: '#FDE68A', icon: AlertCircle },
  du: { label: 'En attente', bg: '#FEE2E2', color: '#B91C1C', border: '#FECACA', icon: Clock },
  en_attente: { label: 'En attente', bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', icon: Clock },

  // Contrats & Tâches
  actif: { label: 'Actif', bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0', icon: CheckCircle },
  inactif: { label: 'Inactif', bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0', icon: XCircle },
  a_faire: { label: 'À faire', bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', icon: Clock },
  termine: { label: 'Terminé', bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0', icon: CheckCircle },
  bloque: { label: 'Bloqué', bg: '#FEE2E2', color: '#DC2626', border: '#FECACA', icon: AlertCircle },
  valide: { label: 'Validé', bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0', icon: CheckCircle },
  refuse: { label: 'Refusé', bg: '#FEE2E2', color: '#DC2626', border: '#FECACA', icon: XCircle },
};

export default function StatusBadge({ status, customLabel, size = 'sm', className = '' }) {
  if (!status) return null;

  const key = String(status).toLowerCase().trim();
  const config = STATUS_CONFIGS[key] || {
    label: customLabel || status,
    bg: '#F1F5F9',
    color: '#475569',
    border: '#E2E8F0',
    icon: Activity
  };

  const Icon = config.icon;
  const label = customLabel || config.label;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        padding: isSm ? '3px 9px' : '5px 12px',
        fontSize: isSm ? '0.75rem' : '0.85rem',
        lineHeight: 1.2,
      }}
    >
      <Icon size={isSm ? 12 : 14} style={{ flexShrink: 0 }} />
      <span>{label}</span>
    </span>
  );
}
