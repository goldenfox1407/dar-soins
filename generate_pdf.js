const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const htmlPath = path.resolve(__dirname, 'analyse_dar_soins.html');
  const pdfPath = path.resolve(__dirname, 'Analyse_Dar_Soins_Maroc.pdf');

  console.log('Lancement du navigateur...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Chargement du HTML...');
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });

  console.log('Génération du PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '25mm', bottom: '25mm', left: '20mm', right: '20mm' },
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="font-size:8px; color:#94A3B8; text-align:center; width:100%; margin-top:4mm; border-top:1px solid #E2E8F0; padding-top:2mm;">Dar-Soins Maroc — Analyse Détaillée du Projet &nbsp;•&nbsp; Page <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });

  await browser.close();
  console.log('PDF généré avec succès :', pdfPath);
})();
