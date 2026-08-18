# -*- coding: utf-8 -*-
"""
Dar-Soins — Générateur de Présentation PowerPoint PFE
Licence Professionnelle IFIAG — Développement et Sécurité
Charte graphique : Bleu Royal #2563EB · Vert Émeraude #10B981
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os

# ─── CHARTE GRAPHIQUE ───────────────────────────────────────────────
BLEU_ROYAL    = RGBColor(0x25, 0x63, 0xEB)
VERT_EMERAUDE = RGBColor(0x10, 0xB9, 0x81)
BLANC         = RGBColor(0xFF, 0xFF, 0xFF)
GRIS_FONCE    = RGBColor(0x1E, 0x29, 0x3B)
GRIS_CLAIR    = RGBColor(0x94, 0xA3, 0xB8)
FOND_SLIDE    = RGBColor(0xF8, 0xFA, 0xFC)
BLEU_FONCE    = RGBColor(0x1E, 0x40, 0xAF)
VERT_FONCE    = RGBColor(0x05, 0x96, 0x69)
ORANGE        = RGBColor(0xF5, 0x9E, 0x0B)
ROUGE         = RGBColor(0xEF, 0x44, 0x44)

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)

LOGO_PATH = os.path.join(os.path.dirname(__file__), 'backend', 'public', 'images', 'logo.png')

prs = Presentation()
prs.slide_width = SLIDE_W
prs.slide_height = SLIDE_H

# ─── HELPERS ────────────────────────────────────────────────────────

def add_bg(slide, color=FOND_SLIDE):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_accent_bar(slide, top=0, height=Inches(0.12), color=BLEU_ROYAL):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, top, SLIDE_W, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()

def add_side_bar(slide, left=0, width=Inches(0.35), color=BLEU_ROYAL):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, 0, width, SLIDE_H)
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()

def add_footer(slide, text="Dar-Soins — PFE Licence Pro IFIAG 2025/2026"):
    txBox = slide.shapes.add_textbox(Inches(0.5), Inches(6.9), Inches(12), Inches(0.4))
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(9)
    p.font.color.rgb = GRIS_CLAIR
    p.alignment = PP_ALIGN.CENTER

def add_textbox(slide, left, top, width, height, text, font_size=18, color=GRIS_FONCE, bold=False, alignment=PP_ALIGN.LEFT, font_name='Calibri'):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = alignment
    return tf

def add_bullet_list(slide, left, top, width, height, items, font_size=16, color=GRIS_FONCE, bullet_color=BLEU_ROYAL):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = item
        p.font.size = Pt(font_size)
        p.font.color.rgb = color
        p.font.name = 'Calibri'
        p.space_after = Pt(6)
        p.level = 0
        # Bullet
        pPr = p._pPr
        if pPr is None:
            from pptx.oxml.ns import qn
            from lxml import etree
            pPr = etree.SubElement(p._p, qn('a:pPr'))
        from pptx.oxml.ns import qn
        from lxml import etree
        buNone = pPr.findall(qn('a:buNone'))
        for b in buNone:
            pPr.remove(b)
        buChar = pPr.find(qn('a:buChar'))
        if buChar is None:
            buChar = etree.SubElement(pPr, qn('a:buChar'))
        buChar.set('char', '▸')
        buClr = pPr.find(qn('a:buClr'))
        if buClr is None:
            buClr = etree.SubElement(pPr, qn('a:buClr'))
        else:
            buClr.clear()
        srgbClr = etree.SubElement(buClr, qn('a:srgbClr'))
        srgbClr.set('val', '%02X%02X%02X' % (bullet_color[0] if isinstance(bullet_color, tuple) else 0x25, 0x63, 0xEB))
    return tf

def add_card(slide, left, top, width, height, title, body, title_color=BLEU_ROYAL, bg_color=BLANC):
    # Card background
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    shape.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0)
    shape.line.width = Pt(1)
    shape.shadow.inherit = False
    
    # Title
    add_textbox(slide, left + Inches(0.2), top + Inches(0.15), width - Inches(0.4), Inches(0.4),
                title, font_size=15, color=title_color, bold=True)
    # Body
    add_textbox(slide, left + Inches(0.2), top + Inches(0.55), width - Inches(0.4), height - Inches(0.7),
                body, font_size=12, color=GRIS_FONCE)

def add_icon_text(slide, left, top, icon, text, font_size=14, color=GRIS_FONCE):
    add_textbox(slide, left, top, Inches(0.4), Inches(0.35), icon, font_size=font_size+4, color=BLEU_ROYAL, bold=True)
    add_textbox(slide, left + Inches(0.45), top, Inches(5), Inches(0.35), text, font_size=font_size, color=color)

def set_notes(slide, text):
    notes_slide = slide.notes_slide
    notes_tf = notes_slide.notes_text_frame
    notes_tf.text = text

def add_section_title(slide, text, subtitle=""):
    add_bg(slide, BLEU_ROYAL)
    add_accent_bar(slide, top=0, height=Inches(0.08), color=VERT_EMERAUDE)
    add_accent_bar(slide, top=Inches(7.42), height=Inches(0.08), color=VERT_EMERAUDE)
    add_textbox(slide, Inches(1), Inches(2.5), Inches(11), Inches(1.5),
                text, font_size=40, color=BLANC, bold=True, alignment=PP_ALIGN.CENTER)
    if subtitle:
        add_textbox(slide, Inches(1), Inches(4.0), Inches(11), Inches(1),
                    subtitle, font_size=20, color=RGBColor(0xBF, 0xDB, 0xFE), alignment=PP_ALIGN.CENTER)
    add_footer(slide, "Dar-Soins — PFE Licence Pro IFIAG 2025/2026")

def add_logo(slide, left=Inches(0.4), top=Inches(0.3), width=Inches(0.8), height=Inches(0.8)):
    if os.path.exists(LOGO_PATH):
        slide.shapes.add_picture(LOGO_PATH, left, top, width, height)

# ════════════════════════════════════════════════════════════════════
# DIAPO 1 — PAGE DE GARDE
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank
add_bg(slide, BLEU_ROYAL)

# Bandes décoratives
add_accent_bar(slide, top=0, height=Inches(0.1), color=VERT_EMERAUDE)
add_accent_bar(slide, top=Inches(7.4), height=Inches(0.1), color=VERT_EMERAUDE)

# Logo centré
if os.path.exists(LOGO_PATH):
    slide.shapes.add_picture(LOGO_PATH, Inches(5.667), Inches(0.5), Inches(2), Inches(2))

# Titre principal
add_textbox(slide, Inches(1), Inches(2.7), Inches(11.333), Inches(1),
            "Dar-Soins", font_size=52, color=BLANC, bold=True, alignment=PP_ALIGN.CENTER)

add_textbox(slide, Inches(1), Inches(3.5), Inches(11.333), Inches(0.7),
            "Plateforme Digitale de Soins Infirmiers à Domicile", font_size=24, color=RGBColor(0xBF, 0xDB, 0xFE), alignment=PP_ALIGN.CENTER)

# Ligne décorative
line_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(5), Inches(4.3), Inches(3.333), Inches(0.04))
line_shape.fill.solid()
line_shape.fill.fore_color.rgb = VERT_EMERAUDE
line_shape.line.fill.background()

# Infos académiques
add_textbox(slide, Inches(1), Inches(4.6), Inches(11.333), Inches(0.5),
            "Projet de Fin d'Études — Licence Professionnelle", font_size=18, color=RGBColor(0xBF, 0xDB, 0xFE), alignment=PP_ALIGN.CENTER)
add_textbox(slide, Inches(1), Inches(5.1), Inches(11.333), Inches(0.5),
            "Développement Informatique et Sécurité des Systèmes d'Information", font_size=16, color=RGBColor(0x93, 0xC5, 0xFD), alignment=PP_ALIGN.CENTER)
add_textbox(slide, Inches(1), Inches(5.6), Inches(11.333), Inches(0.5),
            "IFIAG — Année Universitaire 2025/2026", font_size=16, color=RGBColor(0x93, 0xC5, 0xFD), alignment=PP_ALIGN.CENTER)

# Encadrant / Réalisé par
add_textbox(slide, Inches(1), Inches(6.3), Inches(5), Inches(0.5),
            "Réalisé par : [Votre Nom]", font_size=14, color=RGBColor(0xD1, 0xD5, 0xDB), alignment=PP_ALIGN.LEFT)
add_textbox(slide, Inches(7.333), Inches(6.3), Inches(5), Inches(0.5),
            "Encadré par : [Nom Encadrant]", font_size=14, color=RGBColor(0xD1, 0xD5, 0xDB), alignment=PP_ALIGN.RIGHT)

set_notes(slide, """Bonjour Mesdames et Messieurs les membres du jury, chers encadrants, chers camarades.

Je suis [Votre Nom], étudiant en Licence Professionnelle « Développement Informatique et Sécurité des Systèmes d'Information » à IFIAG. 

J'ai l'honneur de vous présenter aujourd'hui mon Projet de Fin d'Études intitulé « Dar-Soins : Plateforme Digitale de Soins Infirmiers à Domicile ».

Ce projet est né d'un constat personnel et d'une observation approfondie du secteur de la santé à domicile au Maroc. Il répond à un besoin réel, croissant et encore largement mal desservi par les solutions technologiques existantes.

Au cours de cette soutenance, je vous présenterai le contexte, la problématique, la conception, la réalisation technique, les résultats obtenus ainsi que les perspectives d'évolution de cette plateforme.

Je vous remercie par avance pour votre attention et vos retours constructifs.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 2 — PLAN DE LA PRÉSENTATION
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.3), Inches(10), Inches(0.6),
            "Plan de la Présentation", font_size=32, color=BLEU_ROYAL, bold=True)

plan_items = [
    ("01", "Contexte Général et Problématique"),
    ("02", "Présentation du Projet Dar-Soins"),
    ("03", "Étude de Marché & Modèle Économique"),
    ("04", "Business Plan & Projections Financières"),
    ("05", "Cahier des Charges Fonctionnel"),
    ("06", "Conception UML & Modélisation"),
    ("07", "Architecture Technique & Stack Technologique"),
    ("08", "Réalisation — Site Vitrine & Espaces Utilisateurs"),
    ("09", "Réalisation — ERP & Back-Office"),
    ("10", "Sécurité & Bonnes Pratiques"),
    ("11", "Tests, Déploiement & CI/CD"),
    ("12", "Démonstration en Direct"),
    ("13", "Bilan, Perspectives et Conclusion"),
]

for i, (num, label) in enumerate(plan_items):
    y = Inches(1.2) + Inches(i * 0.44)
    # Numéro
    circle = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(1.2), y, Inches(0.35), Inches(0.35))
    circle.fill.solid()
    circle.fill.fore_color.rgb = BLEU_ROYAL if i % 2 == 0 else VERT_EMERAUDE
    circle.line.fill.background()
    tf = circle.text_frame
    tf.word_wrap = False
    p = tf.paragraphs[0]
    p.text = num
    p.font.size = Pt(10)
    p.font.color.rgb = BLANC
    p.font.bold = True
    p.alignment = PP_ALIGN.CENTER
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    
    # Label
    add_textbox(slide, Inches(1.7), y, Inches(10), Inches(0.38),
                label, font_size=16, color=GRIS_FONCE)

add_footer(slide)
set_notes(slide, """Voici le plan que nous allons suivre au cours de cette présentation.

Nous commencerons par poser le contexte général et la problématique à laquelle répond le projet, avant de présenter Dar-Soins et sa proposition de valeur.

Nous passerons ensuite en revue l'étude de marché, l'analyse concurrentielle, puis le business model et le business plan, pour bien comprendre la viabilité économique du projet.

Nous aborderons la partie technique avec le cahier des charges fonctionnel, la conception UML, l'architecture technique retenue et le stack technologique choisi.

Puis je vous montrerai les différentes réalisations : le site vitrine, les espaces clients et infirmiers, l'ERP back-office, en insistant sur la sécurité et les tests.

Enfin, nous terminerons par une démonstration en direct et une ouverture sur les perspectives d'évolution.

Treize points qui, je l'espère, vous donneront une vision complète et cohérente du projet.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 3 — CONTEXTE GÉNÉRAL
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_section_title(slide, "I. Contexte Général & Problématique",
                  "Le secteur de la santé à domicile au Maroc")

set_notes(slide, """Avant d'entrer dans le vif du sujet technique, il est essentiel de comprendre le contexte dans lequel s'inscrit Dar-Soins.

Le Maroc fait face à des défis majeurs dans le secteur de la santé : une densité médicale parmi les plus faibles de la région MENA, un vieillissement progressif de la population, et une couverture sanitaire inégale entre les zones urbaines et rurales.

Ces réalités créent un terreau fertile pour le développement de solutions de santé à domicile, un marché encore largement inexploité au niveau digital dans le Royaume.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 4 — CONTEXTE & CHIFFRES
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.3), Inches(10), Inches(0.6),
            "Le Contexte Marocain en Chiffres", font_size=30, color=BLEU_ROYAL, bold=True)

# Statistiques en cartes
stats = [
    ("7.3", "médecins\npour 10 000 hab.", BLEU_ROYAL),
    ("3.2M", "personnes\nâgées de +60 ans", VERT_EMERAUDE),
    ("42%", "de la population\nen zone rurale", ORANGE),
    ("< 5%", "recours à des\nsoins à domicile\ndigitalisés", ROUGE),
]

for i, (val, label, color) in enumerate(stats):
    x = Inches(0.8 + i * 3.1)
    y = Inches(1.5)
    
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(2.8), Inches(2.2))
    box.fill.solid()
    box.fill.fore_color.rgb = BLANC
    box.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0)
    box.line.width = Pt(1)
    
    add_textbox(slide, x + Inches(0.2), y + Inches(0.3), Inches(2.4), Inches(0.8),
                val, font_size=40, color=color, bold=True, alignment=PP_ALIGN.CENTER)
    add_textbox(slide, x + Inches(0.2), y + Inches(1.2), Inches(2.4), Inches(0.8),
                label, font_size=13, color=GRIS_FONCE, alignment=PP_ALIGN.CENTER)

# Problématique
add_textbox(slide, Inches(0.8), Inches(4.2), Inches(11.5), Inches(0.5),
            "Problématique", font_size=22, color=BLEU_ROYAL, bold=True)

prob_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.8), Inches(11.5), Inches(1.8))
prob_box.fill.solid()
prob_box.fill.fore_color.rgb = BLANC
prob_box.line.color.rgb = RGBColor(0xBF, 0xDB, 0xFE)
prob_box.line.width = Pt(2)

add_textbox(slide, Inches(1.2), Inches(5.0), Inches(10.7), Inches(1.4),
            "Comment concevoir et développer une plateforme web sécurisée, performante et ergonomique\n"
            "permettant de digitaliser l'ensemble du parcours de soins infirmiers à domicile,\n"
            "de la demande du patient jusqu'à la facturation, tout en intégrant un ERP de gestion\n"
            "pour l'administration de l'activité ?",
            font_size=15, color=GRIS_FONCE, alignment=PP_ALIGN.CENTER)

add_footer(slide)
set_notes(slide, """Le Maroc dispose de seulement 7,3 médecins pour 10 000 habitants, un ratio bien en dessous de la recommandation de l'OMS qui est de 44,5 pour 10 000. Plus de 3,2 millions de Marocains sont âgés de plus de 60 ans, et ce chiffre est en constante augmentation avec le vieillissement de la population.

42% de la population vit en zone rurale, loin des structures de soins spécialisées. Et surtout, moins de 5% des soins à domicile sont aujourd'hui digitalisés : les patients appellent directement un infirmier qu'ils connaissent, négocient le prix de bouche à oreille, et il n'y a aucune traçabilité ni transparence tarifaire.

C'est dans ce contexte que s'inscrit notre problématique : Comment concevoir et développer une plateforme web sécurisée, performante et ergonomique qui digitalise l'ensemble du parcours de soins infirmiers à domicile, de la demande du patient jusqu'à la facturation, tout en intégrant un système ERP complet pour l'administration de l'activité ?

Cette problématique recouvre donc à la fois un volet technique (sécurité, performance, architecture), un volet fonctionnel (UX patient, workflow infirmier) et un volet managérial (gestion, comptabilité, stocks).""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 5 — PRÉSENTATION DU PROJET
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_section_title(slide, "II. Présentation du Projet",
                  "Dar-Soins : La santé, chez vous, en un clic")

set_notes(slide, """Passons maintenant à la présentation détaillée du projet Dar-Soins.

Dar-Soins signifie littéralement « Maison de Soins » en arabe dialectal marocain. Le nom a été choisi volontairement pour évoquer la proximité, le confort du domicile et la dimension locale et culturelle du projet.

L'ambition de Dar-Soins est de devenir la référence marocaine en matière de mise en relation digitale entre patients et professionnels de soins infirmiers à domicile.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 6 — QU'EST-CE QUE DAR-SOINS
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.3), Inches(10), Inches(0.6),
            "Qu'est-ce que Dar-Soins ?", font_size=30, color=BLEU_ROYAL, bold=True)

# Colonne gauche — Mission
add_card(slide, Inches(0.8), Inches(1.3), Inches(5.6), Inches(2.5),
         "🏠  Notre Mission", 
         "Digitaliser l'intégralité du parcours de soins\n"
         "infirmiers à domicile au Maroc :\n\n"
         "• Commande en ligne par le patient\n"
         "• Affectation intelligente d'un infirmier\n"
         "• Devis automatique avant intervention\n"
         "• Facturation transparente après intervention\n"
         "• Gestion complète via un ERP intégré")

# Colonne droite — Les 3 espaces
add_card(slide, Inches(6.8), Inches(1.3), Inches(5.6), Inches(2.5),
         "👥  Les 3 Espaces Utilisateurs",
         "🔵 Espace Patient : commande de soins,\n"
         "     suivi en temps réel, historique, devis & factures\n\n"
         "🟢 Espace Infirmier : réception des missions,\n"
         "     clôture, constantes médicales, commissions\n\n"
         "🟠 Espace Gestionnaire (ERP) : administration\n"
         "     complète, RH, stocks, finances, reporting")

# Proposition de valeur
add_textbox(slide, Inches(0.8), Inches(4.2), Inches(11.5), Inches(0.5),
            "Proposition de Valeur Unique", font_size=22, color=VERT_EMERAUDE, bold=True)

props = [
    ("Transparence tarifaire", "Devis automatique avant intervention, prix fixe, aucune surprise"),
    ("Affectation intelligente", "Algorithme de proximité géographique pour trouver l'infirmier le plus proche"),
    ("Traçabilité complète", "Historique médical, constantes vitales, factures archivées, signatures numériques"),
    ("ERP intégré", "Gestion des achats, stocks, RH, comptabilité — tout dans une seule plateforme"),
]

for i, (title, desc) in enumerate(props):
    x = Inches(0.8 + (i % 2) * 6.2)
    y = Inches(4.9 + (i // 2) * 1.0)
    
    add_textbox(slide, x, y, Inches(5.8), Inches(0.35),
                f"✦  {title}", font_size=14, color=BLEU_ROYAL, bold=True)
    add_textbox(slide, x + Inches(0.35), y + Inches(0.3), Inches(5.45), Inches(0.5),
                desc, font_size=12, color=GRIS_FONCE)

add_footer(slide)
set_notes(slide, """Dar-Soins est une plateforme web full-stack qui digitalise l'intégralité du parcours de soins infirmiers à domicile.

Elle s'articule autour de trois espaces distincts :

L'Espace Patient permet de commander un soin en ligne en quelques clics, de recevoir un devis automatique calculé selon la tarification en vigueur, de suivre l'état de son intervention en temps réel, de consulter et télécharger ses factures en PDF, et de signer numériquement.

L'Espace Infirmier permet de recevoir les missions, de les accepter ou refuser, de saisir les constantes médicales, de consigner les matériels utilisés, de clôturer l'intervention et de consulter ses commissions.

L'Espace Gestionnaire, qui est un véritable ERP, offre une administration complète : gestion des produits/services, des stocks et achats, des utilisateurs et rôles, de la facturation, de la numérotation automatique, des paramètres système, etc.

Notre proposition de valeur repose sur quatre piliers : la transparence tarifaire, l'affectation intelligente par géolocalisation, la traçabilité complète du dossier patient, et l'intégration d'un ERP complet dans la même plateforme.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 7 — TITRE SECTION : ÉTUDE DE MARCHÉ & MODÈLE ÉCONOMIQUE
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_section_title(slide, "III. Étude de Marché & Modèle Économique",
                  "Benchmark concurrentiel, diagnostic SWOT et Business Model Canvas")

set_notes(slide, """Nous abordons à présent l'étude de marché et le modèle économique de Dar-Soins.

Avant de concevoir la solution technique, il était primordial de mener une analyse stratégique rigoureuse : évaluer l'écosystème de la santé au Maroc, analyser les concurrents directs et indirects, formaliser le diagnostic SWOT, et structurer un Business Model pérenne et scalable.

Cette démarche garantit que Dar-Soins ne soit pas seulement une prouesse technique, mais également une opportunité à fort impact socio-économique.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 8 (1/3) — ÉTUDE DE MARCHÉ & ANALYSE CONCURRENTIELLE
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.25), Inches(10.5), Inches(0.55),
            "Étude de Marché & Analyse Concurrentielle", font_size=26, color=BLEU_ROYAL, bold=True)
add_textbox(slide, Inches(1.6), Inches(0.72), Inches(10.5), Inches(0.35),
            "Benchmark du secteur e-santé et des soins à domicile au Maroc", font_size=13, color=GRIS_CLAIR)

# Left Column — Typologie des concurrents
add_textbox(slide, Inches(0.7), Inches(1.15), Inches(5.8), Inches(0.35),
            "Cartographie des Acteurs Existants", font_size=16, color=BLEU_FONCE, bold=True)

concurrents_data = [
    ("DabaDoc / Plateformes RDV", "Prise de RDV cabinet uniquement · Aucun acte infirmier à domicile · Zéro suivi matériel/constantes.", RGBColor(0x3B, 0x82, 0xF6)),
    ("SOS Médecins / SAMU privé", "Focalisé sur l'urgence vitale ponctuelle · Tarifs très élevés (>600 MAD) · Non adapté aux soins réguliers.", RGBColor(0xEF, 0x44, 0x44)),
    ("Infirmiers Libéraux (Informel)", "Pratique par bouche-à-oreille · Aucune transparence tarifaire · Zéro traçabilité légale ni dossier patient.", RGBColor(0xF5, 0x9E, 0x0B)),
    ("Cliniques Privées", "Offre à domicile marginale · Démarches administratives lourdes · Délais longs et tarification opaque.", RGBColor(0x8B, 0x5C, 0xF6)),
]

for idx, (c_name, c_desc, c_col) in enumerate(concurrents_data):
    cy = Inches(1.55 + idx * 1.12)
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.7), cy, Inches(5.6), Inches(1.02))
    card.fill.solid()
    card.fill.fore_color.rgb = BLANC
    card.line.color.rgb = c_col
    card.line.width = Pt(1.5)
    
    add_textbox(slide, Inches(0.85), cy + Inches(0.08), Inches(5.3), Inches(0.32),
                c_name, font_size=13, color=c_col, bold=True)
    add_textbox(slide, Inches(0.85), cy + Inches(0.38), Inches(5.3), Inches(0.58),
                c_desc, font_size=10.5, color=GRIS_FONCE)

# Right Column — Matrice comparative des fonctionnalités
add_textbox(slide, Inches(6.6), Inches(1.15), Inches(6.2), Inches(0.35),
            "Matrice Comparative des Solutions", font_size=16, color=BLEU_FONCE, bold=True)

# Table headers
mat_y = Inches(1.55)
cols_mat = [("Critères Clés", Inches(6.6), Inches(2.3)),
            ("Dar-Soins", Inches(8.95), Inches(1.1)),
            ("DabaDoc", Inches(10.1), Inches(0.9)),
            ("SOS Méd.", Inches(11.05), Inches(0.9)),
            ("Freelance", Inches(12.0), Inches(0.9))]

for title, mx, mw in cols_mat:
    hdr = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, mx, mat_y, mw, Inches(0.36))
    hdr.fill.solid()
    hdr.fill.fore_color.rgb = VERT_EMERAUDE if "Dar-Soins" in title else BLEU_ROYAL
    hdr.line.fill.background()
    add_textbox(slide, mx + Inches(0.02), mat_y + Inches(0.04), mw - Inches(0.04), Inches(0.28),
                title, font_size=10, color=BLANC, bold=True, alignment=PP_ALIGN.CENTER)

mat_rows = [
    ("Soins infirmiers à domicile", "OUI", "NON", "Partiel", "OUI"),
    ("Dispatch & Géolocalisation", "OUI", "NON", "Partiel", "NON"),
    ("Devis & Facturation auto", "OUI", "NON", "NON", "NON"),
    ("Suivi constantes & Dossier", "OUI", "Partiel", "NON", "NON"),
    ("ERP & Gestion des stocks", "OUI", "NON", "NON", "NON"),
    ("Contrats garde longue durée", "OUI", "NON", "NON", "Partiel"),
]

for ridx, (crit, c_dar, c_dab, c_sos, c_fre) in enumerate(mat_rows):
    ry = Inches(1.95 + ridx * 0.44)
    rbg = BLANC if ridx % 2 == 0 else FOND_SLIDE
    
    for val, vx, vw in [(crit, Inches(6.6), Inches(2.3)),
                         (c_dar, Inches(8.95), Inches(1.1)),
                         (c_dab, Inches(10.1), Inches(0.9)),
                         (c_sos, Inches(11.05), Inches(0.9)),
                         (c_fre, Inches(12.0), Inches(0.9))]:
        cell = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, vx, ry, vw, Inches(0.40))
        cell.fill.solid()
        cell.fill.fore_color.rgb = rbg
        cell.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0)
        cell.line.width = Pt(1)
        
        is_dar = (vx == Inches(8.95))
        v_col = VERT_FONCE if (val == "OUI" and is_dar) else (VERT_EMERAUDE if val == "OUI" else (ROUGE if val == "NON" else (ORANGE if val == "Partiel" else GRIS_FONCE)))
        v_bold = True if is_dar or vx == Inches(6.6) else False
        v_align = PP_ALIGN.LEFT if vx == Inches(6.6) else PP_ALIGN.CENTER
        
        add_textbox(slide, vx + Inches(0.06), ry + Inches(0.06), vw - Inches(0.12), Inches(0.3),
                    val, font_size=9.5, color=v_col, bold=v_bold, alignment=v_align)

# Bottom Advantage Banner
banner = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.6), Inches(4.75), Inches(6.3), Inches(1.5))
banner.fill.solid()
banner.fill.fore_color.rgb = RGBColor(0xEE, 0xF2, 0xFF)
banner.line.color.rgb = BLEU_ROYAL
banner.line.width = Pt(1.5)

add_textbox(slide, Inches(6.75), Inches(4.85), Inches(6.0), Inches(0.3),
            "Positionnement Unique & Avantage Concurrentiel", font_size=12, color=BLEU_ROYAL, bold=True)
add_textbox(slide, Inches(6.75), Inches(5.18), Inches(6.0), Inches(0.98),
            "Dar-Soins comble un vide stratégique au Maroc en combinant un portail patient intuitif, un dispatch soignant géolocalisé et un ERP médical complet avec traçabilité et conformité réglementaire.", font_size=10, color=GRIS_FONCE)

add_footer(slide)
set_notes(slide, """Notre étude de marché montre qu'il existe un besoin massif et non comblé de soins à domicile structurés au Maroc.

L'analyse de la concurrence fait ressortir quatre catégories d'acteurs :
1. Les plateformes de téléconsultation et de prise de rendez-vous comme DabaDoc, qui se limitent aux consultations en cabinet médical.
2. Les services d'urgence mobile comme SOS Médecins, réservés aux urgences médicales lourdes à des tarifs très élevés.
3. Les infirmiers libéraux indépendants, qui constituent l'essentiel de l'offre actuelle mais fonctionnent de manière informelle, sans régulation tarifaire ni suivi médical formel.
4. Les cliniques privées, dont les prestations à domicile sont marginales, lentes et très coûteuses.

Comme le prouve notre matrice comparative, Dar-Soins est la seule plateforme capable de centraliser la demande de soins, l'affectation géolocalisée temps réel, la facturation automatisée, le dossier médical partagé et un ERP de gestion des stocks et du personnel.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 9 (2/3) — ANALYSE STRATÉGIQUE SWOT
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.25), Inches(10.5), Inches(0.55),
            "Analyse Stratégique SWOT Approfondie", font_size=26, color=BLEU_ROYAL, bold=True)
add_textbox(slide, Inches(1.6), Inches(0.72), Inches(10.5), Inches(0.35),
            "Diagnostic interne (Forces / Faiblesses) et externe (Opportunités / Menaces)", font_size=13, color=GRIS_CLAIR)

swot_cards = [
    ("FORCES (Strengths)", [
        "Architecture moderne & robuste (Laravel 12 REST API + React 19)",
        "ERP médical complet intégré (Stocks, RH, Facturation, Contrats)",
        "Dispatch géolocalisé & calcul kilométrique automatique",
        "Traçabilité rigoureuse (constantes, signature, selfie check-in)",
        "Transparence tarifaire avec devis validé avant intervention"
    ], VERT_EMERAUDE, Inches(0.7), Inches(1.2), Inches(5.7), Inches(2.55)),
    
    ("FAIBLESSES (Weaknesses)", [
        "Projet en phase de lancement (notoriété de marque à bâtir)",
        "Dépendance initiale à la taille du réseau d'infirmiers certifiés",
        "Nécessité d'une connectivité mobile permanente sur le terrain",
        "Délai d'adoption de l'application par les seniors sans aide familiale"
    ], ROUGE, Inches(6.8), Inches(1.2), Inches(5.8), Inches(2.55)),
    
    ("OPPORTUNITÉS (Opportunities)", [
        "Généralisation de l'Assurance Maladie Obligatoire (AMO) au Maroc",
        "Vieillissement de la population et hausse des maladies chroniques",
        "Accélération de la digitalisation et appétence pour la e-santé",
        "Partenariats mutuelles, cliniques, laboratoires et assurances",
        "Extension possible aux soins de kinésithérapie et garde de nuit"
    ], BLEU_ROYAL, Inches(0.7), Inches(3.95), Inches(5.7), Inches(2.65)),
    
    ("MENACES (Threats)", [
        "Résistance culturelle au paiement en ligne et aux outils digitaux",
        "Évolution du cadre réglementaire et juridique de la télésanté",
        "Risque de contournement de la plateforme par le relationnel direct",
        "Arrivée potentielle d'acteurs internationaux du secteur"
    ], ORANGE, Inches(6.8), Inches(3.95), Inches(5.8), Inches(2.65)),
]

for title, points, color, sx, sy, sw, sh in swot_cards:
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx, sy, sw, sh)
    box.fill.solid()
    box.fill.fore_color.rgb = BLANC
    box.line.color.rgb = color
    box.line.width = Pt(2)
    
    # Title badge header
    hdr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx + Inches(0.12), sy + Inches(0.1), sw - Inches(0.24), Inches(0.38))
    hdr_box.fill.solid()
    hdr_box.fill.fore_color.rgb = color
    hdr_box.line.fill.background()
    
    add_textbox(slide, sx + Inches(0.2), sy + Inches(0.12), sw - Inches(0.4), Inches(0.32),
                title, font_size=13, color=BLANC, bold=True, alignment=PP_ALIGN.CENTER)
    
    # Bullets
    add_bullet_list(slide, sx + Inches(0.2), sy + Inches(0.55), sw - Inches(0.4), sh - Inches(0.65),
                    points, font_size=10.5, color=GRIS_FONCE, bullet_color=color)

add_footer(slide)
set_notes(slide, """L'analyse SWOT met en évidence les atouts majeurs et les leviers de réussite de Dar-Soins :

Parmi nos Forces principales : une architecture technologique d'excellence avec Laravel 12 et React 19, l'intégration native d'un ERP de gestion hospitalière, un système d'affectation géolocalisée et une traçabilité médicale complète conforme aux standards de sécurité les plus stricts.

Nos Faiblesses sont classiques pour un nouveau produit : la nécessité d'amorcer le réseau d'infirmiers et d'accompagner les utilisateurs les moins familiers du digital via une ergonomie ultra-simplifiée.

Les Opportunités sont historiques au Maroc : le déploiement généralisé de l'AMO, la transition démographique avec l'augmentation des affections de longue durée, et la volonté nationale de moderniser le système de santé.

Face aux Menaces comme le risque de désintermédiation ou la résistance au paiement en ligne, Dar-Soins apporte des réponses concrètes : flexibilité des moyens de paiement (espèces, carte, virement), sécurisation du dossier patient et fidélisation des soignants grâce à un outil ERP gratuit et complet pour leur gestion.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 10 (3/3) — BUSINESS MODEL CANVAS ENRICHI
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.25), Inches(10.5), Inches(0.55),
            "Business Model Canvas Enrichi", font_size=26, color=BLEU_ROYAL, bold=True)
add_textbox(slide, Inches(1.6), Inches(0.72), Inches(10.5), Inches(0.35),
            "Architecture de valeur, flux de revenus et leviers de viabilité économique", font_size=13, color=GRIS_CLAIR)

canvas_items = [
    ("Partenaires Clés", "• Infirmiers diplômés d'État certifiés\n• Grossistes & Fournisseurs médicaux\n• Compagnies d'assurance (AMO/CNSS)\n• Cliniques & Laboratoires d'analyses", Inches(0.6), Inches(1.15), Inches(2.45), Inches(2.8)),
    ("Activités Clés", "• Développement plateforme web/ERP\n• Dispatching & géolocalisation\n• Contrôle qualité & vérification diplômes\n• Facturation & support client 24/7", Inches(3.12), Inches(1.15), Inches(2.45), Inches(1.36)),
    ("Ressources Clés", "• Infrastructure Cloud & API sécurisée\n• Réseau soignant qualifié\n• Algorithme d'affectation intelligente", Inches(3.12), Inches(2.58), Inches(2.45), Inches(1.37)),
    ("Proposition de Valeur", "• Soins à domicile rapides et certifiés\n• Transparence des prix (devis clair)\n• Dossier patient & constantes partagés\n• ERP médical complet pour la gestion", Inches(5.64), Inches(1.15), Inches(2.4), Inches(2.8)),
    ("Relations Clients", "• Suivi en temps réel de l'infirmier\n• Espace client sécurisé avec historique\n• Notifications instantanées\n• Support & assistance réactive", Inches(8.11), Inches(1.15), Inches(2.45), Inches(1.36)),
    ("Canaux", "• Application Web Responsive\n• Référencement SEO & Réseaux sociaux\n• Recommandations médecins & cliniques\n• Bouche-à-oreille et partenariats", Inches(8.11), Inches(2.58), Inches(2.45), Inches(1.37)),
    ("Segments Clients", "• Patients chroniques (diabète, HTA)\n• Seniors & personnes à mobilité réduite\n• Patients en convalescence post-opératoire\n• Entreprises (gardes & bilans santé)", Inches(10.63), Inches(1.15), Inches(2.2), Inches(2.8)),
]

for title, body, x, y, w, h in canvas_items:
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h)
    box.fill.solid()
    box.fill.fore_color.rgb = BLANC
    box.line.color.rgb = RGBColor(0xBF, 0xDB, 0xFE)
    box.line.width = Pt(1.5)
    
    # Header strip inside box
    h_strip = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x + Inches(0.06), y + Inches(0.06), w - Inches(0.12), Inches(0.32))
    h_strip.fill.solid()
    h_strip.fill.fore_color.rgb = RGBColor(0xEE, 0xF2, 0xFF)
    h_strip.line.fill.background()
    
    add_textbox(slide, x + Inches(0.1), y + Inches(0.08), w - Inches(0.2), Inches(0.28),
                title, font_size=10, color=BLEU_ROYAL, bold=True)
    add_textbox(slide, x + Inches(0.1), y + Inches(0.42), w - Inches(0.2), h - Inches(0.48),
                body, font_size=8.8, color=GRIS_FONCE)

# Bottom Row: Structure de coûts & Sources de revenus (High visual impact)
cost_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(4.08), Inches(5.8), Inches(2.5))
cost_box.fill.solid()
cost_box.fill.fore_color.rgb = BLANC
cost_box.line.color.rgb = ROUGE
cost_box.line.width = Pt(1.5)

add_textbox(slide, Inches(0.75), Inches(4.16), Inches(5.5), Inches(0.3),
            "Structure de Coûts", font_size=12, color=ROUGE, bold=True)
cost_points = [
    "Hébergement Cloud haute disponibilité & sécurité des données",
    "Maintenance applicative, développement continu et R&D",
    "Marketing digital, acquisition client et communication B2B",
    "Frais administratifs, assurance responsabilité civile et support"
]
add_bullet_list(slide, Inches(0.75), Inches(4.5), Inches(5.5), Inches(1.95), cost_points, font_size=9.5, color=GRIS_FONCE, bullet_color=ROUGE)

rev_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.5), Inches(4.08), Inches(6.33), Inches(2.5))
rev_box.fill.solid()
rev_box.fill.fore_color.rgb = BLANC
rev_box.line.color.rgb = VERT_EMERAUDE
rev_box.line.width = Pt(1.5)

add_textbox(slide, Inches(6.65), Inches(4.16), Inches(6.0), Inches(0.3),
            "Sources de Revenus Multiples (Monétisation)", font_size=12, color=VERT_FONCE, bold=True)
rev_points = [
    "Commission par acte (15% à 20%) prélevée sur chaque soin validé",
    "Abonnements Infirmiers Pro (visibilité prioritaire, modules ERP avancés)",
    "Marge sur vente de matériel & consommables médicaux via ERP",
    "Contrats de garde longue durée & forfaits santé pour entreprises (B2B)"
]
add_bullet_list(slide, Inches(6.65), Inches(4.5), Inches(6.0), Inches(1.95), rev_points, font_size=9.5, color=GRIS_FONCE, bullet_color=VERT_EMERAUDE)

add_footer(slide)
set_notes(slide, """Voici la structure détaillée du Business Model Canvas de Dar-Soins.

Notre modèle repose sur 4 piliers de monétisation très complémentaires qui assurent la résilience et la rentabilité du projet :
1. La commission sur les actes (15 à 20%), qui constitue le flux principal et croît proportionnellement au volume des soins réalisés.
2. Les abonnements pour les soignants premium, offrant une visibilité renforcée et des outils de gestion avancés.
3. La marge commerciale sur le matériel médical et les consommables gérés directement dans le module Stock de l'ERP.
4. Les contrats de garde de nuit, longue durée et les partenariats d'entreprise pour les soins programmés.

Cette structure permet d'amortir rapidement les coûts d'infrastructure et de marketing pour atteindre un point mort financier dès la première année d'exploitation.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 11 — BUSINESS PLAN
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.3), Inches(10), Inches(0.6),
            "Business Plan — Projections sur 3 Ans", font_size=28, color=BLEU_ROYAL, bold=True)

# Table header
header_y = Inches(1.3)
cols = [("Indicateur", Inches(0.8), Inches(3.2)),
        ("Année 1", Inches(4.2), Inches(2.5)),
        ("Année 2", Inches(6.9), Inches(2.5)),
        ("Année 3", Inches(9.6), Inches(2.5))]

for title, x, w in cols:
    box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, header_y, w, Inches(0.45))
    box.fill.solid()
    box.fill.fore_color.rgb = BLEU_ROYAL
    box.line.fill.background()
    add_textbox(slide, x + Inches(0.1), header_y + Inches(0.05), w - Inches(0.2), Inches(0.35),
                title, font_size=13, color=BLANC, bold=True, alignment=PP_ALIGN.CENTER)

rows_data = [
    ("Infirmiers partenaires", "50", "200", "500"),
    ("Interventions / mois", "300", "1 500", "5 000"),
    ("Chiffre d'affaires (MAD)", "180 000", "1 080 000", "4 500 000"),
    ("Coûts fixes annuels (MAD)", "240 000", "420 000", "720 000"),
    ("Résultat net (MAD)", "−60 000", "+660 000", "+3 780 000"),
    ("Point mort", "Mois 14", "—", "—"),
]

for i, (label, a1, a2, a3) in enumerate(rows_data):
    row_y = Inches(1.85 + i * 0.48)
    bg = BLANC if i % 2 == 0 else FOND_SLIDE
    
    for val, x, w in [(label, Inches(0.8), Inches(3.2)),
                       (a1, Inches(4.2), Inches(2.5)),
                       (a2, Inches(6.9), Inches(2.5)),
                       (a3, Inches(9.6), Inches(2.5))]:
        box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, row_y, w, Inches(0.45))
        box.fill.solid()
        box.fill.fore_color.rgb = bg
        box.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0)
        box.line.width = Pt(0.5)
        
        is_label = (x == Inches(0.8))
        color = GRIS_FONCE if is_label else (VERT_FONCE if "+" in val else (ROUGE if "−" in val else GRIS_FONCE))
        add_textbox(slide, x + Inches(0.1), row_y + Inches(0.07), w - Inches(0.2), Inches(0.35),
                    val, font_size=12, color=color, bold=not is_label,
                    alignment=PP_ALIGN.LEFT if is_label else PP_ALIGN.CENTER)

# Investissement initial
add_textbox(slide, Inches(0.8), Inches(5.0), Inches(11), Inches(0.4),
            "Investissement Initial Estimé", font_size=18, color=BLEU_ROYAL, bold=True)

invest_items = [
    ("Développement & Design", "80 000 MAD"),
    ("Hébergement Cloud (1 an)", "24 000 MAD"),
    ("Marketing Lancement", "50 000 MAD"),
    ("Frais juridiques & RC", "15 000 MAD"),
]

for i, (label, val) in enumerate(invest_items):
    x = Inches(0.8 + (i % 2) * 6.2)
    y = Inches(5.5 + (i // 2) * 0.45)
    add_textbox(slide, x, y, Inches(4), Inches(0.35),
                f"▸  {label}", font_size=13, color=GRIS_FONCE)
    add_textbox(slide, x + Inches(4.2), y, Inches(1.8), Inches(0.35),
                val, font_size=13, color=BLEU_ROYAL, bold=True, alignment=PP_ALIGN.RIGHT)

add_textbox(slide, Inches(0.8), Inches(6.5), Inches(11), Inches(0.4),
            "Total Investissement : 169 000 MAD  ·  ROI estimé : Mois 14",
            font_size=15, color=VERT_EMERAUDE, bold=True, alignment=PP_ALIGN.CENTER)

add_footer(slide)
set_notes(slide, """Nos projections financières sur 3 ans montrent une trajectoire de croissance ambitieuse mais réaliste.

En Année 1, nous visons 50 infirmiers partenaires et environ 300 interventions par mois, générant un chiffre d'affaires de 180 000 MAD. Avec des coûts fixes de 240 000 MAD (principalement le développement et le marketing de lancement), le résultat net serait déficitaire de 60 000 MAD, ce qui est normal pour une startup en phase de lancement.

Le point mort est estimé au 14ème mois d'activité.

En Année 2, avec 200 infirmiers et 1 500 interventions mensuelles, nous passerions à un résultat net positif de 660 000 MAD.

En Année 3, avec 500 infirmiers et 5 000 interventions mensuelles, le chiffre d'affaires atteindrait 4,5 millions de MAD pour un résultat net de 3,78 millions de MAD.

L'investissement initial total est estimé à 169 000 MAD, réparti entre le développement, l'hébergement, le marketing et les frais juridiques. C'est un investissement très raisonnable pour une plateforme de cette envergure.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 12 — CAHIER DES CHARGES
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_section_title(slide, "V. Cahier des Charges Fonctionnel",
                  "Exigences fonctionnelles et non-fonctionnelles")

set_notes(slide, """Nous entrons maintenant dans la partie technique du projet. Le cahier des charges fonctionnel est le document fondateur qui a guidé toute la conception et le développement.

Il définit l'ensemble des exigences fonctionnelles et non-fonctionnelles que la plateforme doit satisfaire.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 13 — EXIGENCES FONCTIONNELLES
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.3), Inches(10), Inches(0.6),
            "Exigences Fonctionnelles", font_size=28, color=BLEU_ROYAL, bold=True)

# 3 colonnes par acteur
actors = [
    ("👤 Patient (Client)", [
        "Inscription / Authentification",
        "Commander un soin",
        "Consulter le devis PDF",
        "Accepter / Refuser le devis",
        "Suivre l'intervention",
        "Consulter ses factures PDF",
        "Signer numériquement",
        "Historique des interventions",
    ]),
    ("🩺 Infirmier", [
        "Authentification sécurisée",
        "Réceptionner les missions",
        "Accepter / Refuser une mission",
        "Saisir constantes médicales",
        "Enregistrer consommables",
        "Clôturer l'intervention",
        "Consulter ses commissions",
        "Historique complet",
    ]),
    ("⚙️ Gestionnaire (ERP)", [
        "Tableau de bord analytique",
        "CRUD Produits & Services",
        "Gestion des achats & stocks",
        "Gestion utilisateurs & rôles",
        "Facturation & numérotation",
        "Paramètres système",
        "Devises & taxes",
        "Imports / exports de données",
    ]),
]

for col, (actor_name, items) in enumerate(actors):
    x = Inches(0.8 + col * 4.1)
    
    # Actor title
    title_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.2), Inches(3.8), Inches(0.45))
    title_box.fill.solid()
    title_box.fill.fore_color.rgb = BLEU_ROYAL
    title_box.line.fill.background()
    add_textbox(slide, x + Inches(0.1), Inches(1.23), Inches(3.6), Inches(0.4),
                actor_name, font_size=14, color=BLANC, bold=True, alignment=PP_ALIGN.CENTER)
    
    for i, item in enumerate(items):
        y = Inches(1.85 + i * 0.52)
        item_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.8), Inches(0.45))
        item_box.fill.solid()
        item_box.fill.fore_color.rgb = BLANC
        item_box.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0)
        item_box.line.width = Pt(0.5)
        add_textbox(slide, x + Inches(0.15), y + Inches(0.06), Inches(3.5), Inches(0.35),
                    f"▸ {item}", font_size=11, color=GRIS_FONCE)

# Non-fonctionnelles
add_textbox(slide, Inches(0.8), Inches(6.1), Inches(11), Inches(0.4),
            "Exigences Non-Fonctionnelles : Sécurité (OWASP) · Performance (< 200ms API) · Responsive · Accessibilité · Maintenabilité",
            font_size=12, color=GRIS_CLAIR, alignment=PP_ALIGN.CENTER)

add_footer(slide)
set_notes(slide, """Le cahier des charges fonctionnel a été structuré par acteur, en identifiant précisément les User Stories de chaque profil.

Le Patient peut s'inscrire et s'authentifier, commander un soin en ligne parmi le catalogue de prestations, recevoir un devis PDF automatique qu'il peut consulter, accepter ou refuser. Il peut suivre l'état de son intervention en temps réel, consulter et télécharger ses factures en PDF, signer numériquement et accéder à l'historique complet de ses interventions.

L'Infirmier dispose d'une authentification sécurisée avec gestion des rôles, peut réceptionner les missions assignées par l'algorithme de proximité, les accepter ou refuser, saisir les constantes médicales du patient, enregistrer les consommables utilisés, clôturer l'intervention et consulter ses commissions.

Le Gestionnaire, via l'ERP intégré, dispose d'un tableau de bord analytique, de la gestion CRUD des produits et services, de la gestion des achats et stocks, de la gestion des utilisateurs et des rôles RBAC, de la facturation automatique avec numérotation séquentielle, et de tous les paramètres système.

Les exigences non-fonctionnelles incluent la conformité aux recommandations OWASP pour la sécurité, un temps de réponse API inférieur à 200 millisecondes, un design responsive adapté à tous les écrans, et une architecture maintenable et extensible.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 14 — CONCEPTION UML
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_section_title(slide, "VI. Conception UML & Modélisation",
                  "Diagrammes de cas d'utilisation, classes et séquence")

set_notes(slide, """La phase de conception a été réalisée en suivant la méthodologie UML (Unified Modeling Language), qui est le standard de modélisation dans l'industrie du génie logiciel.

Nous avons produit trois types de diagrammes fondamentaux : le diagramme de cas d'utilisation, le diagramme de classes et les diagrammes de séquence pour les processus critiques.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 15 — DIAGRAMME DE CAS D'UTILISATION (descriptif)
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.3), Inches(10), Inches(0.6),
            "Diagramme de Cas d'Utilisation", font_size=28, color=BLEU_ROYAL, bold=True)

# 3 acteurs en colonnes visuelles
actors_uc = [
    ("Patient", BLEU_ROYAL, [
        "S'inscrire", "S'authentifier", "Commander un soin",
        "Consulter le devis", "Accepter le devis", "Suivre l'intervention",
        "Consulter les factures", "Signer numériquement"
    ]),
    ("Infirmier", VERT_EMERAUDE, [
        "S'authentifier", "Consulter les missions",
        "Accepter/Refuser mission", "Saisir constantes médicales",
        "Enregistrer consommables", "Clôturer intervention",
        "Consulter commissions"
    ]),
    ("Gestionnaire", ORANGE, [
        "Gérer produits/services", "Gérer utilisateurs",
        "Gérer les rôles (RBAC)", "Administrer stocks/achats",
        "Configurer paramètres", "Consulter tableau de bord",
        "Gérer facturation"
    ]),
]

for col, (actor, color, cases) in enumerate(actors_uc):
    x = Inches(0.8 + col * 4.1)
    
    # Actor header
    actor_shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.2), Inches(3.8), Inches(0.5))
    actor_shape.fill.solid()
    actor_shape.fill.fore_color.rgb = color
    actor_shape.line.fill.background()
    add_textbox(slide, x + Inches(0.1), Inches(1.25), Inches(3.6), Inches(0.4),
                f"🔹 {actor}", font_size=15, color=BLANC, bold=True, alignment=PP_ALIGN.CENTER)
    
    for i, uc in enumerate(cases):
        y = Inches(1.9 + i * 0.6)
        ellipse = slide.shapes.add_shape(MSO_SHAPE.OVAL, x + Inches(0.2), y, Inches(3.4), Inches(0.48))
        ellipse.fill.solid()
        ellipse.fill.fore_color.rgb = BLANC
        ellipse.line.color.rgb = color
        ellipse.line.width = Pt(1.5)
        add_textbox(slide, x + Inches(0.3), y + Inches(0.06), Inches(3.2), Inches(0.35),
                    uc, font_size=11, color=GRIS_FONCE, alignment=PP_ALIGN.CENTER)

add_footer(slide)
set_notes(slide, """Ce diagramme de cas d'utilisation synthétise les interactions entre les trois acteurs principaux et le système Dar-Soins.

Le Patient dispose de 8 cas d'utilisation allant de l'inscription à la signature numérique, en passant par la commande de soins, la consultation des devis et factures.

L'Infirmier dispose de 7 cas d'utilisation couvrant la réception et gestion des missions, la saisie des données médicales, la clôture d'intervention et la consultation des commissions.

Le Gestionnaire dispose de 7 cas d'utilisation centrés sur l'administration via l'ERP : gestion des produits, des utilisateurs, des rôles RBAC, des stocks, de la facturation et du paramétrage.

Notez que certains cas d'utilisation sont partagés entre acteurs, comme l'authentification, ce qui traduit une architecture de sécurité unifiée basée sur Laravel Sanctum et Spatie Permissions.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 16 — DIAGRAMME DE CLASSES (simplifié)
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.3), Inches(10), Inches(0.6),
            "Diagramme de Classes — Modèle de Données", font_size=28, color=BLEU_ROYAL, bold=True)

# Classes principales (représentation visuelle en cards)
classes = [
    ("User", "id, name, prenom, email,\npassword, role, telephone", Inches(4.8), Inches(1.2)),
    ("Client", "id, user_id, adresse,\nville, cin", Inches(1.5), Inches(2.8)),
    ("Infirmier", "id, user_id, specialite,\nlat, lng, disponible", Inches(4.8), Inches(2.8)),
    ("Gestionnaire", "id, user_id, departement", Inches(8.2), Inches(2.8)),
    ("Intervention", "id, client_id, infirmier_id,\nproduit_id, type, statut,\ndate_prevue, montant", Inches(1.5), Inches(4.6)),
    ("Produit", "id, nom, prix_client,\ncategorie, type_remise,\nstock_quantite", Inches(4.8), Inches(4.6)),
    ("Devis", "id, intervention_id,\nmontant_estime, statut,\nfrais_deplacement", Inches(8.2), Inches(4.6)),
    ("Facture", "id, intervention_id,\nreference, montant_total,\ndate", Inches(10.5), Inches(4.6)),
]

for cls_name, attrs, x, y in classes:
    # Class box
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(2.5), Inches(1.3))
    box.fill.solid()
    box.fill.fore_color.rgb = BLANC
    box.line.color.rgb = BLEU_ROYAL
    box.line.width = Pt(2)
    
    # Title bar
    title_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, Inches(2.5), Inches(0.35))
    title_bar.fill.solid()
    title_bar.fill.fore_color.rgb = BLEU_ROYAL
    title_bar.line.fill.background()
    add_textbox(slide, x + Inches(0.05), y + Inches(0.02), Inches(2.4), Inches(0.3),
                cls_name, font_size=12, color=BLANC, bold=True, alignment=PP_ALIGN.CENTER)
    
    # Attributes
    add_textbox(slide, x + Inches(0.1), y + Inches(0.4), Inches(2.3), Inches(0.85),
                attrs, font_size=9, color=GRIS_FONCE)

add_textbox(slide, Inches(0.8), Inches(6.3), Inches(12), Inches(0.4),
            "34 modèles Eloquent  ·  44 migrations  ·  Relations : belongsTo, hasMany, morphMany  ·  Soft Deletes",
            font_size=12, color=GRIS_CLAIR, alignment=PP_ALIGN.CENTER)

add_footer(slide)
set_notes(slide, """Le modèle de données de Dar-Soins comprend 34 modèles Eloquent et 44 migrations de base de données.

La classe centrale est User, qui utilise un système de rôles polymorphiques via les relations morphMany de Spatie Permissions. Un User peut être un Client, un Infirmier ou un Gestionnaire, chacun ayant ses attributs spécifiques.

L'Intervention est le cœur métier : elle lie un Client à un Infirmier pour un Produit donné, et engendre un Devis puis une Facture. Chaque intervention peut avoir des ConstantesMédicales et des Consommations associées.

Le modèle Produit gère à la fois les prestations de soins et le matériel médical, avec un système de remise intégré (pourcentage ou fixe) et une gestion de stock.

Les relations Eloquent utilisent belongsTo, hasMany et morphMany, avec des soft deletes sur les entités critiques pour garantir l'intégrité historique des données médicales et financières.

La base de données est PostgreSQL en production et SQLite en développement, avec une base pré-remplie incluse dans le projet pour faciliter le déploiement.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 17 — ARCHITECTURE TECHNIQUE
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_section_title(slide, "VII. Architecture Technique",
                  "Stack technologique et choix d'architecture")

set_notes(slide, """Nous abordons maintenant l'architecture technique du projet, qui est le fruit de choix réfléchis en matière de performance, de sécurité et de maintenabilité.

L'architecture suit le pattern API-First avec une séparation stricte entre le frontend et le backend, communiquant exclusivement via des appels API REST sécurisés.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 18 — STACK TECHNOLOGIQUE
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.3), Inches(10), Inches(0.6),
            "Stack Technologique & Architecture", font_size=28, color=BLEU_ROYAL, bold=True)

# Architecture diagram (text-based)
layers = [
    ("🌐  FRONTEND (SPA)", "React 19 · Vite 5 · React Router v6 · Axios · Tailwind CSS\nDesign Glassmorphism · Composants réutilisables · Auto-refresh temps réel", BLEU_ROYAL, Inches(1.2)),
    ("🔗  API REST", "HTTP/JSON · Bearer Token (Sanctum) · Rate Limiting 60 req/min\nAPI Resources · Validation FormRequest · CORS · Intercepteurs Axios", VERT_EMERAUDE, Inches(2.6)),
    ("⚙️  BACKEND (API)", "Laravel 12 · PHP 8.2+ · Services métier (Tarification, Affectation,\nGéolocalisation, Numérotation) · DomPDF · Spatie Permissions (RBAC)", BLEU_FONCE, Inches(4.0)),
    ("💾  DONNÉES", "PostgreSQL 15 (Prod) · SQLite (Dev) · Redis 7 (Cache & Sessions)\n34 Modèles Eloquent · 44 Migrations · Soft Deletes", RGBColor(0x7C, 0x3A, 0xED), Inches(5.4)),
]

for label, desc, color, y in layers:
    # Layer box
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y, Inches(11.5), Inches(1.2))
    box.fill.solid()
    box.fill.fore_color.rgb = BLANC
    box.line.color.rgb = color
    box.line.width = Pt(2)
    
    add_textbox(slide, Inches(1.0), y + Inches(0.08), Inches(11), Inches(0.35),
                label, font_size=15, color=color, bold=True)
    add_textbox(slide, Inches(1.0), y + Inches(0.42), Inches(11), Inches(0.7),
                desc, font_size=12, color=GRIS_FONCE)

# DevOps footer
add_textbox(slide, Inches(0.8), Inches(6.8), Inches(11.5), Inches(0.35),
            "DevOps : Docker & Docker Compose · Nginx Reverse Proxy · CI/CD GitHub Actions · Playwright E2E Tests",
            font_size=12, color=GRIS_CLAIR, alignment=PP_ALIGN.CENTER)

add_footer(slide)
set_notes(slide, """L'architecture technique de Dar-Soins suit une approche en couches strictement séparées.

La couche Frontend est une Single Page Application développée avec React 19 et Vite 5 pour un Hot Module Replacement ultra-rapide. Le routage côté client est géré par React Router v6, et les appels API sont effectués via Axios avec des intercepteurs pour la gestion automatique des tokens et des erreurs. Le design utilise Tailwind CSS avec un style Glassmorphism premium.

La couche API REST sert d'interface entre le frontend et le backend. Chaque requête est authentifiée via un Bearer Token généré par Laravel Sanctum. Un Rate Limiting de 60 requêtes par minute est appliqué sur les routes API et de 5 par minute sur les routes d'authentification. Les réponses sont formatées via des API Resources pour une transformation sécurisée des données.

La couche Backend repose sur Laravel 12 avec PHP 8.2+. La logique métier est encapsulée dans 5 services dédiés : ServiceTarification pour le calcul des prix et devis, ServiceAffectation pour l'algorithme de proximité, ServiceGéolocalisation, ServiceNumérotation pour la génération séquentielle des références factures/devis, et CacheService pour la gestion du cache Redis.

La couche Données utilise PostgreSQL 15 en production et SQLite en développement, avec Redis 7 pour le cache et les sessions. Le modèle de données comprend 34 modèles Eloquent et 44 migrations.

L'infrastructure DevOps inclut Docker et Docker Compose pour la conteneurisation, Nginx comme reverse proxy, et un pipeline CI/CD via GitHub Actions avec des tests end-to-end Playwright.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 19 — RÉALISATION SITE VITRINE
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_section_title(slide, "VIII. Réalisation",
                  "Site vitrine, espaces utilisateurs & ERP")

set_notes(slide, """Passons à la partie réalisation du projet. Nous allons voir concrètement les différentes interfaces développées.

Le site vitrine est la vitrine publique de Dar-Soins, accessible sans authentification. Il présente les services proposés, la page À Propos, la FAQ et les formulaires de contact et d'inscription.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 20 — SITE VITRINE DÉTAILS
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.3), Inches(10), Inches(0.6),
            "Site Vitrine & Pages Publiques", font_size=28, color=BLEU_ROYAL, bold=True)

pages = [
    ("🏠 Page d'Accueil (Home.jsx)", "Hero section avec CTA · Présentation des services\nStatistiques animées · Témoignages · Footer complet", "21 524 octets de code"),
    ("💊 Page Services", "Catalogue de soins avec descriptions détaillées\nCatégories de prestations · Tarifs indicatifs", "9 358 octets de code"),
    ("ℹ️ Page À Propos", "Mission et vision · Équipe · Valeurs\nHistoire de Dar-Soins", "6 101 octets de code"),
    ("❓ FAQ", "Questions fréquentes avec accordéon interactif\nRéponses détaillées par catégorie", "5 195 octets de code"),
    ("📧 Contact", "Formulaire de contact · Carte interactive\nInformations de contact · Réseaux sociaux", "8 713 octets de code"),
    ("🔐 Login / Register", "Authentification sécurisée · Inscription multi-rôle\nValidation en temps réel · UI Glassmorphism", "25 290 octets de code"),
]

for i, (title, desc, size) in enumerate(pages):
    x = Inches(0.8 + (i % 2) * 6.2)
    y = Inches(1.2 + (i // 2) * 1.8)
    
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.8), Inches(1.5))
    card.fill.solid()
    card.fill.fore_color.rgb = BLANC
    card.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0)
    card.line.width = Pt(1)
    
    add_textbox(slide, x + Inches(0.2), y + Inches(0.1), Inches(5.4), Inches(0.35),
                title, font_size=14, color=BLEU_ROYAL, bold=True)
    add_textbox(slide, x + Inches(0.2), y + Inches(0.5), Inches(5.4), Inches(0.7),
                desc, font_size=11, color=GRIS_FONCE)
    add_textbox(slide, x + Inches(0.2), y + Inches(1.15), Inches(5.4), Inches(0.25),
                size, font_size=9, color=GRIS_CLAIR)

add_footer(slide)
set_notes(slide, """Le site vitrine de Dar-Soins comprend 6 pages publiques majeures, totalisant plus de 76 000 octets de code React.

La Page d'Accueil est la plus imposante avec un hero section intégrant un call-to-action principal, une présentation des services avec des animations au scroll, des statistiques animées, une section témoignages et un footer complet. Le design utilise le style Glassmorphism avec des effets de transparence et de flou caractéristiques.

La Page Services présente le catalogue complet des soins proposés avec des descriptions détaillées et des tarifs indicatifs.

La Page À Propos raconte la mission, la vision et l'histoire de Dar-Soins.

La FAQ utilise un composant accordéon interactif pour organiser les questions fréquentes par catégorie.

La Page Contact intègre un formulaire fonctionnel et les informations de contact.

Les pages Login et Register offrent une authentification sécurisée avec un formulaire d'inscription multi-rôle (patient ou infirmier) et une validation en temps réel des champs. L'ensemble totalise plus de 25 000 octets de code.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 21 — ESPACE PATIENT & INFIRMIER
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.3), Inches(10), Inches(0.6),
            "Espaces Patient & Infirmier", font_size=28, color=BLEU_ROYAL, bold=True)

# Patient Dashboard
patient_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.2), Inches(5.6), Inches(5.2))
patient_card.fill.solid()
patient_card.fill.fore_color.rgb = BLANC
patient_card.line.color.rgb = BLEU_ROYAL
patient_card.line.width = Pt(2)

add_textbox(slide, Inches(1.0), Inches(1.3), Inches(5.2), Inches(0.4),
            "👤 Tableau de Bord Patient", font_size=18, color=BLEU_ROYAL, bold=True)

patient_features = [
    "▸ Commande de soins avec sélection du produit",
    "▸ Devis PDF automatique avec détails tarifaires",
    "▸ Acceptation / Refus du devis en un clic",
    "▸ Suivi en temps réel de l'intervention",
    "▸ Constantes médicales enregistrées",
    "▸ Facture PDF avec cachet et signature",
    "▸ Historique complet des interventions",
    "▸ Mise à jour automatique des données",
    "▸ Affichage du nom personnalisé",
    "▸ 32 106 octets de code React",
]

for i, feat in enumerate(patient_features):
    add_textbox(slide, Inches(1.2), Inches(1.9 + i * 0.42), Inches(5.0), Inches(0.35),
                feat, font_size=12, color=GRIS_FONCE)

# Infirmier Dashboard
inf_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.2), Inches(5.6), Inches(5.2))
inf_card.fill.solid()
inf_card.fill.fore_color.rgb = BLANC
inf_card.line.color.rgb = VERT_EMERAUDE
inf_card.line.width = Pt(2)

add_textbox(slide, Inches(7.0), Inches(1.3), Inches(5.2), Inches(0.4),
            "🩺 Tableau de Bord Infirmier", font_size=18, color=VERT_EMERAUDE, bold=True)

inf_features = [
    "▸ Réception des missions assignées",
    "▸ Acceptation / Refus de mission",
    "▸ Saisie des constantes médicales",
    "▸ Enregistrement des consommables",
    "▸ Clôture d'intervention avec distance",
    "▸ Validation du montant et facturation",
    "▸ Historique détaillé des interventions",
    "▸ Consultation des commissions",
    "▸ Mise à jour automatique temps réel",
    "▸ 30 263 octets de code React",
]

for i, feat in enumerate(inf_features):
    add_textbox(slide, Inches(7.2), Inches(1.9 + i * 0.42), Inches(5.0), Inches(0.35),
                feat, font_size=12, color=GRIS_FONCE)

add_footer(slide)
set_notes(slide, """Les deux espaces utilisateurs principaux sont le tableau de bord Patient et le tableau de bord Infirmier.

Le Tableau de Bord Patient (32 106 octets de code React) offre une interface complète pour commander un soin, recevoir un devis PDF, l'accepter ou le refuser, suivre l'intervention en temps réel, consulter les constantes médicales enregistrées, télécharger les factures PDF avec cachet et signature numérique, et accéder à l'historique complet. Les données se mettent à jour automatiquement grâce à un système de polling toutes les 10 secondes.

Le Tableau de Bord Infirmier (30 263 octets de code React) permet de recevoir les missions assignées par l'algorithme de proximité géographique, de les accepter ou refuser, de saisir les constantes médicales du patient (tension, température, pouls, etc.), d'enregistrer les consommables utilisés avec les quantités exactes, de clôturer l'intervention en renseignant la distance parcourue, de valider le montant et de générer la facture. L'infirmier peut également consulter l'historique détaillé de toutes ses interventions et ses commissions.

Les deux interfaces affichent le nom personnalisé de l'utilisateur connecté et bénéficient d'un design Glassmorphism cohérent avec le reste de la plateforme.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 22 — ERP & BACK-OFFICE
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.3), Inches(10), Inches(0.6),
            "ERP Intégré — Back-Office Gestionnaire", font_size=28, color=BLEU_ROYAL, bold=True)

erp_modules = [
    ("📦 Produits & Catalogue", "CRUD complet, codes-barres,\nvariations, unités, catégories"),
    ("🛒 Achats & Fournisseurs", "Bons de commande, réceptions,\nretours, paiements partiels"),
    ("📊 Stocks & Entrepôts", "Mouvements, ajustements,\ntransferts, seuils d'alerte"),
    ("👥 Utilisateurs & Rôles", "RBAC Spatie, permissions\ngranulaires, gestion complète"),
    ("💰 Finances", "Comptes bancaires, transactions,\ncommissions, devises"),
    ("📄 Facturation", "Numérotation auto, préfixes,\nPDF branded, historique"),
    ("⚙️ Paramètres", "Config système, identité,\nlogo, TVA, mentions légales"),
    ("📈 Reporting", "Tableaux de bord, rapports\nanalyses, exports données"),
]

for i, (title, desc) in enumerate(erp_modules):
    x = Inches(0.8 + (i % 4) * 3.1)
    y = Inches(1.3 + (i // 4) * 2.6)
    
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(2.8), Inches(2.1))
    card.fill.solid()
    card.fill.fore_color.rgb = BLANC
    card.line.color.rgb = RGBColor(0xBF, 0xDB, 0xFE)
    card.line.width = Pt(1.5)
    
    add_textbox(slide, x + Inches(0.15), y + Inches(0.15), Inches(2.5), Inches(0.4),
                title, font_size=13, color=BLEU_ROYAL, bold=True)
    add_textbox(slide, x + Inches(0.15), y + Inches(0.65), Inches(2.5), Inches(1.2),
                desc, font_size=11, color=GRIS_FONCE)

add_textbox(slide, Inches(0.8), Inches(6.5), Inches(12), Inches(0.4),
            "52 composants ERP  ·  31 contrôleurs API  ·  Architecture modulaire extensible",
            font_size=13, color=GRIS_CLAIR, alignment=PP_ALIGN.CENTER)

add_footer(slide)
set_notes(slide, """L'ERP intégré de Dar-Soins est un véritable système de gestion d'entreprise complet, composé de 52 composants React et pilotés par 31 contrôleurs API Laravel.

Le module Produits & Catalogue permet la gestion CRUD complète des produits avec génération de codes-barres, variations de produits, gestion des unités de mesure, catégories et marques.

Le module Achats & Fournisseurs gère l'intégralité du cycle d'achat : création de bons de commande, réception des marchandises, gestion des retours fournisseurs et des paiements partiels avec suivi documentaire.

Le module Stocks & Entrepôts permet de suivre les mouvements de stock, effectuer des ajustements d'inventaire, gérer les transferts inter-entrepôts et configurer des seuils d'alerte de réapprovisionnement.

Le module Utilisateurs & Rôles implémente un système RBAC complet via Spatie Permissions, avec des permissions granulaires configurables.

Le module Finances gère les comptes bancaires, les transactions financières, les commissions infirmiers et le multi-devises.

Le module Facturation offre une numérotation automatique séquentielle avec préfixes configurables, des factures PDF brandées avec le logo officiel, le cachet et la signature.

Le module Paramètres centralise toute la configuration système : identité de l'entreprise, logo, TVA, mentions légales, conditions de paiement, pied de page des documents.

Le module Reporting propose des tableaux de bord analytiques avec des indicateurs clés de performance.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 23 — SÉCURITÉ
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_section_title(slide, "IX. Sécurité & Bonnes Pratiques",
                  "Protection des données et conformité OWASP")

set_notes(slide, """La sécurité est un pilier fondamental de Dar-Soins, d'autant plus critique que nous traitons des données de santé, qui sont des données sensibles au sens de la réglementation.

Nous allons détailler les mécanismes de sécurité mis en place à chaque couche de l'application.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 24 — DÉTAILS SÉCURITÉ
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.3), Inches(10), Inches(0.6),
            "Mécanismes de Sécurité Implémentés", font_size=28, color=BLEU_ROYAL, bold=True)

sec_items = [
    ("🔐 Authentification", "Laravel Sanctum — Tokens API\nsécurisés, expiration automatique,\nrévocation à la déconnexion", BLEU_ROYAL),
    ("🛡️ Autorisation", "Spatie Permissions — RBAC\ncontrôle granulaire par rôle,\nmiddleware auth:sanctum", VERT_EMERAUDE),
    ("⚡ Rate Limiting", "ThrottleRequests — 60 req/min\nsur l'API, 5 req/min sur\nl'authentification", ORANGE),
    ("🌐 CORS", "Configuration stricte, restreint\nà localhost:5173, headers\nautorisés définis", BLEU_FONCE),
    ("🔒 Hachage", "bcrypt — Mots de passe\nhachés irréversiblement,\nfacteur de coût 12", RGBColor(0x7C, 0x3A, 0xED)),
    ("📋 Validation", "FormRequest — Validation\ncôté serveur stricte, règles\nmétier, sanitisation", VERT_FONCE),
    ("💾 Cache", "Redis 7 — Sessions sécurisées,\ncache de données sensibles,\nisolation par clé", ROUGE),
    ("📊 API Resources", "Transformation sécurisée —\nFiltrage des champs sensibles,\npas d'exposition directe", GRIS_FONCE),
]

for i, (title, desc, color) in enumerate(sec_items):
    x = Inches(0.8 + (i % 4) * 3.1)
    y = Inches(1.2 + (i // 4) * 2.8)
    
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(2.8), Inches(2.4))
    card.fill.solid()
    card.fill.fore_color.rgb = BLANC
    card.line.color.rgb = color
    card.line.width = Pt(2)
    
    add_textbox(slide, x + Inches(0.15), y + Inches(0.15), Inches(2.5), Inches(0.4),
                title, font_size=13, color=color, bold=True)
    add_textbox(slide, x + Inches(0.15), y + Inches(0.65), Inches(2.5), Inches(1.5),
                desc, font_size=11, color=GRIS_FONCE)

add_footer(slide)
set_notes(slide, """Les mécanismes de sécurité de Dar-Soins couvrent les principales recommandations OWASP et sont implémentés à chaque couche :

L'Authentification utilise Laravel Sanctum avec des tokens API sécurisés qui expirent automatiquement et sont révoqués à la déconnexion. Chaque token est lié à un utilisateur et à un device spécifique.

L'Autorisation implémente le modèle RBAC via Spatie Permissions, avec un contrôle d'accès granulaire par rôle. Le middleware auth:sanctum protège toutes les routes sensibles. Chaque contrôleur vérifie les permissions avant d'exécuter une action.

Le Rate Limiting prévient les attaques par force brute avec des limites de 60 requêtes par minute sur l'API et seulement 5 par minute sur les routes d'authentification.

La politique CORS est configurée de manière stricte, n'autorisant que l'origine localhost:5173 en développement, avec des headers autorisés explicitement définis.

Le Hachage des mots de passe utilise l'algorithme bcrypt avec un facteur de coût de 12, rendant le déchiffrement computationnellement impraticable.

La Validation utilise le pattern FormRequest de Laravel pour une validation côté serveur stricte de chaque paramètre d'entrée, avec des règles métier et une sanitisation automatique.

Le Cache Redis isole les sessions et les données sensibles par clé unique, empêchant les fuites inter-utilisateurs.

Les API Resources filtrent systématiquement les champs sensibles avant toute réponse, évitant l'exposition accidentelle de données comme les mots de passe ou les tokens.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 25 — TESTS & CI/CD
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_section_title(slide, "X. Tests, Déploiement & CI/CD",
                  "Assurance qualité et pipeline d'intégration continue")

set_notes(slide, """La qualité du code est assurée par une stratégie de tests multi-niveaux et un pipeline d'intégration continue.

Nous allons voir les différents niveaux de tests implémentés et l'infrastructure de déploiement.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 26 — TESTS DÉTAILS
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.3), Inches(10), Inches(0.6),
            "Stratégie de Tests & Déploiement", font_size=28, color=BLEU_ROYAL, bold=True)

# Tests
test_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.2), Inches(5.8), Inches(4.5))
test_card.fill.solid()
test_card.fill.fore_color.rgb = BLANC
test_card.line.color.rgb = BLEU_ROYAL
test_card.line.width = Pt(2)

add_textbox(slide, Inches(1.0), Inches(1.3), Inches(5.4), Inches(0.4),
            "🧪 Tests Automatisés", font_size=18, color=BLEU_ROYAL, bold=True)

tests_details = [
    "Tests Unitaires (Pest PHP)",
    "  ▸ ServiceTarification : 7 tests, 14 assertions",
    "  ▸ Calcul prix, remises, frais déplacement",
    "  ▸ Multiplication heures garde_malade",
    "",
    "Tests Fonctionnels (Feature Tests)",
    "  ▸ AuthTest : inscription, connexion, profil",
    "  ▸ InterventionTest : commande, clôture, sécurité",
    "  ▸ ProduitTest : CRUD admin, accès public",
    "",
    "Tests End-to-End (Playwright)",
    "  ▸ Scénarios utilisateur complets",
    "  ▸ Exécution navigateur headless",
    "",
    "Résultat : 21 tests, 38 assertions — 100% ✅",
]

for i, line in enumerate(tests_details):
    bold = not line.startswith("  ") and line and not line.startswith("Résultat")
    color = VERT_EMERAUDE if "100%" in line else (BLEU_FONCE if bold else GRIS_FONCE)
    add_textbox(slide, Inches(1.2), Inches(1.85 + i * 0.28), Inches(5.2), Inches(0.25),
                line, font_size=11, color=color, bold=bold or "100%" in line)

# Déploiement
deploy_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.0), Inches(1.2), Inches(5.6), Inches(4.5))
deploy_card.fill.solid()
deploy_card.fill.fore_color.rgb = BLANC
deploy_card.line.color.rgb = VERT_EMERAUDE
deploy_card.line.width = Pt(2)

add_textbox(slide, Inches(7.2), Inches(1.3), Inches(5.2), Inches(0.4),
            "🚀 Déploiement & CI/CD", font_size=18, color=VERT_EMERAUDE, bold=True)

deploy_items = [
    ("Docker Compose", "Conteneurisation multi-services\n(Backend, Frontend, DB, Redis)"),
    ("Dockerfile.prod", "Build multi-stage optimisé\npour production"),
    ("Nginx", "Reverse proxy, compression\ngzip, SSL/TLS ready"),
    ("GitHub Actions", "Pipeline CI/CD automatisé :\nlint → test → build → deploy"),
    ("Scripts Auto", "start.bat / start.sh pour\ndémarrage one-click"),
]

for i, (title, desc) in enumerate(deploy_items):
    y = Inches(1.9 + i * 0.85)
    add_textbox(slide, Inches(7.4), y, Inches(2), Inches(0.3),
                f"▸ {title}", font_size=12, color=VERT_FONCE, bold=True)
    add_textbox(slide, Inches(9.4), y, Inches(3), Inches(0.7),
                desc, font_size=10, color=GRIS_FONCE)

add_footer(slide)
set_notes(slide, """La stratégie de tests de Dar-Soins comprend trois niveaux complémentaires :

Les Tests Unitaires, réalisés avec le framework Pest PHP, testent isolément les services métier. Le ServiceTarification est couvert par 7 tests et 14 assertions, vérifiant le calcul du prix de base, l'application des remises en pourcentage et en valeur fixe, les frais de déplacement, la multiplication par les heures pour les gardes malades, et la gestion d'erreur en cas de configuration absente.

Les Tests Fonctionnels (Feature Tests) testent les endpoints API de bout en bout : l'AuthTest vérifie l'inscription, la connexion et le profil. L'InterventionTest vérifie la commande de soins, la clôture, les contrôles de sécurité inter-utilisateurs. Le ProduitTest vérifie le CRUD admin et l'accès public.

Les Tests End-to-End utilisent Playwright pour simuler des scénarios utilisateur complets dans un navigateur headless.

Au total, 21 tests et 38 assertions passent à 100%.

Le déploiement utilise Docker Compose avec des Dockerfiles multi-stage optimisés pour la production, Nginx comme reverse proxy avec compression gzip et configuration SSL-ready, et un pipeline CI/CD GitHub Actions qui exécute automatiquement le lint, les tests, le build et le déploiement à chaque push.

Des scripts start.bat et start.sh permettent un démarrage one-click en développement, sans aucune configuration manuelle.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 27 — DÉMONSTRATION
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_section_title(slide, "XI. Démonstration en Direct",
                  "🖥️  Parcours complet : de la commande à la facture")

set_notes(slide, """C'est le moment de la démonstration en direct. Je vais vous montrer le parcours complet d'une intervention sur Dar-Soins.

SCÉNARIO DE DÉMONSTRATION :

1. Page d'accueil — Présentation du site vitrine, navigation, services
2. Inscription d'un patient — Formulaire, validation, redirection
3. Commande d'un soin — Sélection du produit, confirmation
4. Devis automatique — Réception du PDF, consultation, acceptation
5. Côté infirmier — Réception de la mission, acceptation, saisie des constantes
6. Clôture — Enregistrement des consommables, distance, validation
7. Facturation — Génération automatique de la facture PDF
8. ERP — Paramètres système, gestion des produits, utilisateurs, stocks
9. Signature numérique — Validation finale par le patient

Ce parcours démontre concrètement la fluidité et la cohérence de l'application de bout en bout.

[BASCULER SUR LE NAVIGATEUR - localhost:5173]""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 28 — BILAN & PERSPECTIVES
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_section_title(slide, "XII. Bilan, Perspectives & Conclusion",
                  "Ce qui a été accompli et la suite")

set_notes(slide, """Nous arrivons à la dernière partie de cette présentation : le bilan du travail accompli, les perspectives d'évolution et la conclusion générale.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 29 — BILAN TECHNIQUE
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.3), Inches(10), Inches(0.6),
            "Bilan Technique du Projet", font_size=28, color=BLEU_ROYAL, bold=True)

# Chiffres clés en grille
metrics = [
    ("34", "Modèles\nEloquent", BLEU_ROYAL),
    ("44", "Migrations\nDB", VERT_EMERAUDE),
    ("31", "Contrôleurs\nAPI", BLEU_FONCE),
    ("52", "Composants\nERP React", ORANGE),
    ("21", "Tests\nautomatisés", VERT_FONCE),
    ("5", "Services\nmétier", RGBColor(0x7C, 0x3A, 0xED)),
    ("11", "Pages\nfrontend", ROUGE),
    ("100%", "Tests\nréussis ✅", VERT_EMERAUDE),
]

for i, (val, label, color) in enumerate(metrics):
    x = Inches(0.8 + (i % 4) * 3.1)
    y = Inches(1.2 + (i // 4) * 2.5)
    
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(2.8), Inches(2.0))
    card.fill.solid()
    card.fill.fore_color.rgb = BLANC
    card.line.color.rgb = color
    card.line.width = Pt(2)
    
    add_textbox(slide, x + Inches(0.2), y + Inches(0.25), Inches(2.4), Inches(0.7),
                val, font_size=36, color=color, bold=True, alignment=PP_ALIGN.CENTER)
    add_textbox(slide, x + Inches(0.2), y + Inches(1.1), Inches(2.4), Inches(0.7),
                label, font_size=13, color=GRIS_FONCE, alignment=PP_ALIGN.CENTER)

# Compétences acquises
add_textbox(slide, Inches(0.8), Inches(6.3), Inches(12), Inches(0.5),
            "Compétences acquises : Full-Stack Development · Architecture logicielle · Sécurité web · UX/UI Design · DevOps · Gestion de projet",
            font_size=12, color=GRIS_CLAIR, alignment=PP_ALIGN.CENTER)

add_footer(slide)
set_notes(slide, """Le bilan technique du projet est très positif et dépasse les objectifs initiaux.

En termes de backend, nous avons développé 34 modèles Eloquent, 44 migrations de base de données, 31 contrôleurs API et 5 services métier spécialisés. Chaque entité est couverte par des API Resources pour une transformation sécurisée des données.

En termes de frontend, nous avons développé 11 pages principales et 52 composants ERP React, totalisant plus de 400 000 octets de code JavaScript avec un design Glassmorphism premium cohérent.

Les 21 tests automatisés avec 38 assertions passent tous à 100%, couvrant les tests unitaires, fonctionnels et d'intégration.

Au-delà des chiffres, ce projet m'a permis d'acquérir des compétences transversales précieuses : le développement full-stack avec des technologies modernes, l'architecture logicielle avec le pattern API-First, la sécurité web avec les bonnes pratiques OWASP, le design UX/UI avec la méthodologie Glassmorphism, les pratiques DevOps avec Docker et CI/CD, et la gestion de projet de bout en bout.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 30 — PERSPECTIVES
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, FOND_SLIDE)
add_side_bar(slide, color=BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.06), color=VERT_EMERAUDE)
add_logo(slide, left=Inches(0.6), top=Inches(0.25))

add_textbox(slide, Inches(1.6), Inches(0.3), Inches(10), Inches(0.6),
            "Perspectives d'Évolution", font_size=28, color=BLEU_ROYAL, bold=True)

perspectives = [
    ("📱 Application Mobile", "Développement d'applications iOS et Android\navec React Native pour étendre la portée", "Court terme"),
    ("🤖 Intelligence Artificielle", "Recommandation intelligente de soins,\nprédiction des besoins, chatbot médical", "Moyen terme"),
    ("🗺️ Géolocalisation Avancée", "Suivi GPS en temps réel de l'infirmier,\ncalcul d'itinéraire optimal", "Court terme"),
    ("💳 Paiement en Ligne", "Intégration CMI / Stripe pour le paiement\nen ligne sécurisé (3D Secure)", "Court terme"),
    ("🏥 Télémédecine", "Consultations vidéo, ordonnances\nnumériques, dossier médical partagé", "Long terme"),
    ("🌍 Expansion Régionale", "Déploiement dans d'autres villes\nmarocaines puis en Afrique francophone", "Moyen terme"),
]

for i, (title, desc, timeline) in enumerate(perspectives):
    x = Inches(0.8 + (i % 2) * 6.2)
    y = Inches(1.2 + (i // 2) * 1.8)
    
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.8), Inches(1.5))
    card.fill.solid()
    card.fill.fore_color.rgb = BLANC
    card.line.color.rgb = RGBColor(0xBF, 0xDB, 0xFE)
    card.line.width = Pt(1.5)
    
    add_textbox(slide, x + Inches(0.2), y + Inches(0.1), Inches(4), Inches(0.35),
                title, font_size=14, color=BLEU_ROYAL, bold=True)
    
    # Timeline badge
    badge_color = VERT_EMERAUDE if "Court" in timeline else (ORANGE if "Moyen" in timeline else BLEU_FONCE)
    badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x + Inches(4.2), y + Inches(0.12), Inches(1.4), Inches(0.28))
    badge.fill.solid()
    badge.fill.fore_color.rgb = badge_color
    badge.line.fill.background()
    add_textbox(slide, x + Inches(4.25), y + Inches(0.12), Inches(1.3), Inches(0.28),
                timeline, font_size=9, color=BLANC, bold=True, alignment=PP_ALIGN.CENTER)
    
    add_textbox(slide, x + Inches(0.2), y + Inches(0.55), Inches(5.4), Inches(0.8),
                desc, font_size=11, color=GRIS_FONCE)

add_footer(slide)
set_notes(slide, """Les perspectives d'évolution de Dar-Soins sont nombreuses et structurées en trois horizons temporels.

À court terme, nous prévoyons le développement d'une application mobile avec React Native pour étendre la portée aux utilisateurs mobiles, l'intégration d'une géolocalisation avancée avec suivi GPS en temps réel de l'infirmier et calcul d'itinéraire optimal, et l'intégration d'un système de paiement en ligne via CMI ou Stripe avec sécurité 3D Secure.

À moyen terme, nous envisageons l'intégration de l'intelligence artificielle pour la recommandation intelligente de soins et la prédiction des besoins patients, ainsi qu'une expansion régionale vers d'autres villes marocaines puis en Afrique francophone.

À long terme, la plateforme pourrait évoluer vers la télémédecine avec des consultations vidéo, des ordonnances numériques et un dossier médical partagé, positionnant Dar-Soins comme un acteur majeur de la e-santé au Maroc.

Chacune de ces perspectives est techniquement faisable grâce à l'architecture modulaire et extensible que nous avons mise en place dès la conception.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 31 — CONCLUSION
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.1), color=VERT_EMERAUDE)
add_accent_bar(slide, top=Inches(7.4), height=Inches(0.1), color=VERT_EMERAUDE)

if os.path.exists(LOGO_PATH):
    slide.shapes.add_picture(LOGO_PATH, Inches(5.667), Inches(0.6), Inches(2), Inches(2))

add_textbox(slide, Inches(1), Inches(2.8), Inches(11.333), Inches(0.8),
            "Conclusion", font_size=40, color=BLANC, bold=True, alignment=PP_ALIGN.CENTER)

line_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(5.5), Inches(3.7), Inches(2.333), Inches(0.04))
line_shape.fill.solid()
line_shape.fill.fore_color.rgb = VERT_EMERAUDE
line_shape.line.fill.background()

add_textbox(slide, Inches(1.5), Inches(4.0), Inches(10.333), Inches(1.5),
            "Dar-Soins apporte une réponse concrète et fonctionnelle\n"
            "à la problématique de digitalisation des soins infirmiers à domicile au Maroc.\n\n"
            "Une plateforme complète, sécurisée et prête à transformer le secteur.",
            font_size=18, color=RGBColor(0xBF, 0xDB, 0xFE), alignment=PP_ALIGN.CENTER)

add_textbox(slide, Inches(1), Inches(5.8), Inches(11.333), Inches(0.6),
            "« La santé, chez vous, en un clic »", font_size=24, color=VERT_EMERAUDE, bold=True, alignment=PP_ALIGN.CENTER)

set_notes(slide, """Pour conclure, Dar-Soins apporte une réponse concrète, fonctionnelle et ambitieuse à la problématique de digitalisation des soins infirmiers à domicile au Maroc.

Ce projet de fin d'études m'a permis de mobiliser l'ensemble des compétences acquises au cours de ma formation en Licence Professionnelle à IFIAG : le développement full-stack avec les technologies les plus récentes (Laravel 12, React 19), la sécurité des systèmes d'information avec les bonnes pratiques OWASP, la conception et la modélisation UML, le déploiement et le DevOps avec Docker et CI/CD.

Au-delà de l'exercice académique, Dar-Soins a un potentiel de marché réel, avec un business plan viable démontrant un retour sur investissement dès le 14ème mois.

La plateforme est prête à être déployée en production et à commencer à servir de véritables patients et infirmiers.

Je vous remercie pour votre attention et je suis à votre disposition pour toute question.""")

# ════════════════════════════════════════════════════════════════════
# DIAPO 32 — MERCI
# ════════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, BLEU_ROYAL)
add_accent_bar(slide, top=0, height=Inches(0.1), color=VERT_EMERAUDE)
add_accent_bar(slide, top=Inches(7.4), height=Inches(0.1), color=VERT_EMERAUDE)

if os.path.exists(LOGO_PATH):
    slide.shapes.add_picture(LOGO_PATH, Inches(5.667), Inches(1.0), Inches(2), Inches(2))

add_textbox(slide, Inches(1), Inches(3.3), Inches(11.333), Inches(1),
            "Merci de votre attention", font_size=42, color=BLANC, bold=True, alignment=PP_ALIGN.CENTER)

add_textbox(slide, Inches(1), Inches(4.3), Inches(11.333), Inches(0.6),
            "Questions ?", font_size=28, color=VERT_EMERAUDE, bold=True, alignment=PP_ALIGN.CENTER)

line_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(5), Inches(5.0), Inches(3.333), Inches(0.04))
line_shape.fill.solid()
line_shape.fill.fore_color.rgb = VERT_EMERAUDE
line_shape.line.fill.background()

add_textbox(slide, Inches(1), Inches(5.3), Inches(11.333), Inches(0.5),
            "contact@darsoins.ma  ·  darsoins.ma", font_size=16, color=RGBColor(0x93, 0xC5, 0xFD), alignment=PP_ALIGN.CENTER)

add_textbox(slide, Inches(1), Inches(5.8), Inches(11.333), Inches(0.5),
            "Dar-Soins — La santé, chez vous, en un clic", font_size=14, color=RGBColor(0xBF, 0xDB, 0xFE), alignment=PP_ALIGN.CENTER)

set_notes(slide, """Merci beaucoup pour votre attention tout au long de cette présentation.

Je suis maintenant à votre entière disposition pour répondre à vos questions, qu'elles soient d'ordre technique, fonctionnel, sécuritaire ou économique.

Ce projet a été pour moi une expérience extrêmement enrichissante, tant sur le plan technique que sur le plan personnel, et je suis convaincu que Dar-Soins peut réellement contribuer à améliorer l'accès aux soins à domicile au Maroc.

Merci encore, et au plaisir d'échanger avec vous.""")

# ─── SAUVEGARDE ─────────────────────────────────────────────────────
output_path = os.path.join(os.path.dirname(__file__), 'Dar-Soins_PFE_Presentation.pptx')
prs.save(output_path)
print(f"[OK] Presentation generee avec succes : {output_path}")
print(f"   -> {len(prs.slides)} diapos creees avec notes de commentaire completes")
