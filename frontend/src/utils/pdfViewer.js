import api from '../services/api';

/**
 * Ouvre ou télécharge un document PDF généré par l'API sans être bloqué par les bloqueurs de popup du navigateur
 * @param {string} endpoint - Ex: '/devis/5/pdf' ou '/factures/12/pdf'
 * @param {string} filename - Nom du fichier de téléchargement de secours
 * @param {boolean} forceDownload - Si true, force le téléchargement direct au lieu de l'affichage dans un nouvel onglet
 */
export async function openOrDownloadPdf(endpoint, filename = 'document.pdf', forceDownload = false) {
  let targetWindow = null;

  if (!forceDownload) {
    // Ouvrir l'onglet immédiatement sur le geste de clic utilisateur pour éviter le blocage pop-up du navigateur
    targetWindow = window.open('', '_blank');
    if (targetWindow) {
      targetWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Génération du PDF - Dar-Soins</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #F8FAFC;
              color: #1E293B;
            }
            .spinner {
              width: 48px;
              height: 48px;
              border: 4px solid #E2E8F0;
              border-top: 4px solid #2563EB;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin-bottom: 20px;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            h2 { font-size: 1.25rem; font-weight: 700; margin: 0 0 8px; color: #0F172A; }
            p { font-size: 0.9rem; color: #64748B; margin: 0; }
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <h2>Génération de votre document PDF...</h2>
          <p>Veuillez patienter quelques instants, votre document officiel Dar-Soins est en cours de création.</p>
        </body>
        </html>
      `);
      targetWindow.document.close();
    }
  }

  try {
    const response = await api.get(endpoint, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    if (targetWindow && !targetWindow.closed) {
      // Rediriger immédiatement l'onglet pré-ouvert vers le PDF
      targetWindow.location.href = url;
    } else {
      // Fallback si popup bloquée ou téléchargement forcé
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    if (targetWindow && !targetWindow.closed) {
      targetWindow.close();
    }
    alert('Impossible de générer le document PDF. Veuillez vérifier votre connexion et réessayer.');
    throw error;
  }
}
