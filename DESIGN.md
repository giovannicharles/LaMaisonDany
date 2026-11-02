---
name: LaMaison Dany
description: Boutique de parfums, cosmétiques et vins qui se commande par WhatsApp, rose poudré et bordeaux.
colors:
  blush: "#fbeef0"
  blush-deep: "#f6dde1"
  blush-edge: "#ecc6cd"
  rose: "#b23a5b"
  wine: "#6b1730"
  wine-deep: "#4a0f22"
  ink: "#34141d"
  ink-soft: "#6e4a54"
typography:
  display:
    fontFamily: "Bodoni Moda, Didot, Georgia, serif"
    fontSize: "clamp(2.5rem, 6vw, 4.6rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bodoni Moda, Didot, Georgia, serif"
    fontSize: "clamp(2.25rem, 4vw, 3.75rem)"
    fontWeight: 500
    lineHeight: 1.03
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bodoni Moda, Didot, Georgia, serif"
    fontSize: "1.15rem"
    fontWeight: 500
    lineHeight: 1.35
  body:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 500
    letterSpacing: "0.01em"
rounded:
  field: "16px"
  card: "24px"
  panel: "28px"
  pill: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.wine}"
    textColor: "{colors.blush}"
    rounded: "{rounded.pill}"
    padding: "15px 30px"
  button-primary-hover:
    backgroundColor: "{colors.wine-deep}"
  button-ghost:
    textColor: "{colors.wine}"
    rounded: "{rounded.pill}"
    padding: "15px 30px"
  card-product:
    backgroundColor: "#ffffff"
    textColor: "{colors.wine}"
    rounded: "{rounded.card}"
  field:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "14px 18px"
  chip:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  chip-active:
    backgroundColor: "{colors.wine}"
    textColor: "{colors.blush}"
---

# Design System: LaMaison Dany

## Overview

**Creative North Star: "Le comptoir du parfumeur"**

Un comptoir où l'on pose un flacon sous la lumière et où l'on parle au vendeur. Le fond est un rose poudré chaud, les titres sont en serif à fort contraste, et les vraies photos des produits portent la page : elles viennent des clichés pris par la maison, pas d'illustrations. Le site doit donner envie d'écrire sur WhatsApp, pas impressionner.

La densité est aérée, avec beaucoup d'espace entre les sections et peu d'éléments par écran. Les ornements restent rares : le décor sert la lecture, il ne la remplace pas. Le ton est direct et concret, jamais emphatique.

**Key Characteristics:**
- Rose poudré en fond, bordeaux pour tout ce qui doit être lu ou cliqué.
- Serif Bodoni Moda pour les titres, Jost pour le texte et les contrôles.
- Formes arrondies et douces : boutons en pilule, cartes à grands rayons.
- Photographie réelle avant tout ; les illustrations vectorielles ne servent que de repli quand une photo manque.
- Mouvement discret : apparition au défilement, jamais d'effet qui détourne de la demande WhatsApp.

## Colors

Une palette de rose et de vin, chaude et peu saturée, avec un seul accent vif.

### Primary
- **Bordeaux profond** (#6b1730) : boutons pleins, titres, texte d'action, bande d'atouts, pied de page.
- **Bordeaux nuit** (#4a0f22) : survol des boutons, fond du pied de page.

### Secondary
- **Rose vif** (#b23a5b) : accent rare (mot en italique du titre d'accueil, pastilles de compteur, anneau de focus).

### Neutral
- **Rose poudré** (#fbeef0) : fond de toutes les pages.
- **Rose tendre** (#f6dde1) : sections alternées, puces, fonds de squelette.
- **Rose bord** (#ecc6cd) : filets, contours de champs et de cartes.
- **Encre prune** (#34141d) : texte courant.
- **Prune douce** (#6e4a54) : texte secondaire (contraste suffisant sur le fond rose).

### Named Rules
**The One Accent Rule.** Le rose vif ne dépasse pas quelques occurrences par écran ; le bordeaux porte l'action.
**The Tinted Neutral Rule.** Aucun gris pur : chaque neutre est teinté de prune.

## Typography

**Display Font:** Bodoni Moda (avec Didot, Georgia, serif), hébergée localement.
**Body Font:** Jost (avec system-ui, sans-serif), hébergée localement.

**Character:** un serif de mode très contrasté face à un sans géométrique sobre : l'élégance d'une enseigne de parfumerie, lisible sur petit écran.

### Hierarchy
- **Display** (500, 2.5 à 4.6rem, 1) : titre d'accueil, en deux couleurs (bordeaux puis rose en italique).
- **Headline** (500, 2.25 à 3.75rem, 1.03) : titres de section, en bordeaux uni.
- **Title** (500, 1.15rem, 1.35) : noms de produits sur les cartes.
- **Body** (400, 1rem, 1.6) : texte courant, mesure d'environ 46 à 56 caractères.
- **Label** (500, 0.95rem, 0.01em) : boutons, chips, champs.

### Named Rules
**The Plain Heading Rule.** Seul le titre de l'accueil joue sur deux couleurs ; les autres titres restent unis.

## Layout

Conteneur de 1320 px, marges de 20 px sur mobile et 40 px dès 768 px, sections séparées par 96 à 128 px. Grilles de produits à 2 colonnes sur mobile, 3 dès 768 px, 4 dès 1280 px. En bas d'écran mobile, une barre de navigation fixe (accueil, boutique, recherche, favoris, WhatsApp) ; l'en-tête se compose d'une barre bordeaux d'annonces puis du menu, qui se réduit au défilement.

## Elevation & Depth

Hybride : surfaces plates tonales (rose sur rose) avec de légères ombres teintées de bordeaux sous les cartes et les boutons pleins. L'ombre augmente au survol ; la profondeur reste douce.

### Shadow Vocabulary
- **Carte** (`box-shadow: 0 18px 36px -30px rgba(107,23,48,0.6)`) : cartes produit au repos.
- **Bouton plein** (`box-shadow: 0 10px 24px -10px rgba(107,23,48,0.55)`) : bouton bordeaux, plus marqué au survol.
- **Fenêtre** (`box-shadow: 0 40px 90px -30px rgba(74,15,34,0.7)`) : recherche, installation, contact.

### Named Rules
**The Tinted Shadow Rule.** Toute ombre est teintée de bordeaux, jamais noire neutre, et porte un décalage et un flou.

## Shapes

Formes arrondies : pilule pour boutons et chips, 16 px pour les champs, 24 px pour les cartes, 28 px pour les fenêtres, grandes arches pour la composition photo de l'accueil. Contours fins de 1,5 px en rose bord.

## Components

### Buttons
- **Shape:** pilule (9999px), 15 px de haut, 30 px de côté.
- **Primary:** bordeaux plein, texte rose poudré, ombre teintée.
- **Hover / Focus:** passe au bordeaux nuit en montant de 2 px ; anneau de focus rose de 2 px, décalé de 3 px.
- **Ghost:** contour bordeaux de 1,5 px, se remplit au survol.

### Chips
- **Style:** pilule blanche à contour rose bord ; actif en bordeaux plein.
- **State:** `aria-pressed` pour les filtres (catégories, « Disponibles uniquement »).

### Cards / Containers
- **Corner Style:** 24 px.
- **Background:** blanc, contour rose bord à 60 %.
- **Shadow Strategy:** voir Carte ; se soulève de 4 px au survol.
- **Internal Padding:** 16 à 20 px ; photo en 4:5 avec cœur de favori et nom en serif.

### Inputs / Fields
- **Style:** fond rose très clair, contour 1,5 px rose bord, rayon 16 px.
- **Focus:** contour bordeaux et halo rose de 4 px.
- **Error / Disabled:** message en bordeaux sous le champ.

### Navigation
- Menu horizontal en Jost 15 px, soulignement rose animé sous la page active ; menu « Boutique » déroulant (catégories et coups de cœur). Sur mobile, barre du bas à cinq entrées.

### Product card
- Photo, catégorie, nom en serif, prix ou « Prix sur demande », puis bouton WhatsApp plein ; cœur de favori en haut à droite ; la carte entière est cliquable.

## Do's and Don'ts

### Do:
- **Do** laisser les photos réelles des produits porter la page ; recadrer sans les déformer.
- **Do** utiliser le bordeaux (#6b1730) pour tout élément cliquable principal.
- **Do** écrire des textes courts et concrets, sans tiret long.
- **Do** garder des cibles tactiles de 44 px minimum.

### Don't:
- **Don't** ajouter d'étincelles, d'anneaux qui tournent, de grilles de points ni de dégradés décoratifs.
- **Don't** mettre le mot d'accent en italique rose dans chaque titre.
- **Don't** utiliser du gris pur, du noir pur ni des ombres sans teinte.
- **Don't** ajouter de panier, de total ou d'étape de paiement : le site mène à WhatsApp.
