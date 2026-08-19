/**
 * Utilitaires de formatage centralisés pour l'application Dar-Soins
 */

/**
 * Formate un montant en Dirhams marocains (MAD)
 * @param {number|string} amount 
 * @param {boolean} withDecimals 
 * @returns {string} Ex: "1 450,00 MAD" ou "1 450 MAD"
 */
export function formatMoney(amount, withDecimals = true) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '0,00 MAD';
  }
  const num = Number(amount);
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(num) + ' MAD';
}

/**
 * Formate une date ISO/chaîne en format lisible français (JJ/MM/AAAA)
 * @param {string|Date} dateStr 
 * @returns {string} Ex: "18/08/2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Formate une date et heure (JJ/MM/AAAA à HH:MM)
 * @param {string|Date} dateStr 
 * @returns {string} Ex: "18/08/2026 à 14:30"
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    const dateFormatted = d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeFormatted = d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${dateFormatted} à ${timeFormatted}`;
  } catch {
    return 'N/A';
  }
}

/**
 * Formate uniquement l'heure (HH:MM)
 * @param {string|Date} dateStr 
 * @returns {string} Ex: "14:30"
 */
export function formatTime(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Nettoie et formate un numéro de téléphone marocain
 * @param {string} phone 
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return 'N/A';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  }
  return phone;
}

/**
 * Tronque un texte s'il dépasse une certaine longueur
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export function truncateText(text, maxLength = 35) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
