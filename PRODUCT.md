# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Clients au Cameroun (numéro +237, prix en FCFA) qui découvrent la boutique sur téléphone, souvent avec une connexion lente, et qui commandent par WhatsApp. Leur tâche : repérer un parfum, un cosmétique ou un vin, savoir si c'est disponible et à quel prix, puis écrire à la maison.

Second public : la propriétaire et son équipe, qui gèrent produits, contenu et messages depuis l'administration (téléphone ou ordinateur, connexion par numéro de téléphone).

## Product Purpose

Vitrine de LaMaison Dany : parfums, cosmétiques, vins et autres produits. Le site présente le catalogue et mène à une conversation WhatsApp ; il ne vend pas en ligne. Réussite : un visiteur trouve un produit et envoie sa demande en quelques secondes.

## Positioning

Commande directe par WhatsApp : pas de panier, pas de paiement en ligne. Le visiteur choisit un produit, un message prérempli s'ouvre (modifiable), et la maison confirme prix et disponibilité.

## Operating Context

Hébergement séparé : site sur Vercel, API Node/Express sur Render, base PostgreSQL sur Neon, médias sur Cloudinary. Installable comme application (site et administration ont chacun leur PWA). Tout le contenu (textes, FAQ, atouts, chatbot, numéro WhatsApp, devise, images, couleurs, sections affichées) se modifie depuis l'administration.

## Capabilities and Constraints

- Périmètre V1 (AGENTS.md, non négociable) : catalogue, fiche produit, filtre par catégorie, À propos, Contact, demande WhatsApp préremplie et modifiable, chatbot d'aide (règles et catalogue, relais WhatsApp, réponses Gemini), préchargement de marque, CMS d'administration complet.
- Hors périmètre avant lancement explicite de leur phase : panier, commandes, paiement en ligne, livraison et suivi, comptes clients et fidélité. Les favoris du site ne sont ni un panier ni une commande.
- Livraison, retrait et paiement ne sont pas promis par le site : ils se règlent au cas par cas sur WhatsApp. Aucune promesse de délai, de remise ou de stock.
- Langue de l'interface et du contenu : français. Code, noms de fichiers et commits en anglais.
- Pas de tirets longs (cadratins ni demi-cadratins) dans les textes visibles.
- Numéro WhatsApp de la maison : 237696272947, modifiable dans l'administration.
- Décisions encore ouvertes : adresse et horaires réels, liens des réseaux sociaux, zone de livraison éventuelle.

## Brand Commitments

Nom : LaMaison Dany. Rose poudré en fond, bordeaux en accent, titres serif (Bodoni Moda), texte en Jost. Positionnement élégant et sensoriel, sans effet « généré par une IA » : pas d'ornements décoratifs superflus, pas de textes marketing creux. Mention de réalisation en pied de page : « Powered by Giovanni Charles E. » avec choix du moyen de contact (WhatsApp, appel, email).

## Evidence on Hand

38 produits réels avec photos (parfums, déodorants, soins du corps, vins, maison), hébergées sur Cloudinary. Aucun avis client, témoignage, chiffre de vente ni récompense : ne rien inventer de tel. Pas encore de vidéos produit (emplacement prévu, contenu à fournir).

## Product Principles

1. Le chemin le plus court entre un produit et la conversation WhatsApp prime sur tout le reste.
2. Le site ne promet que ce que la maison tient : prix et disponibilité se confirment par message.
3. Tout ce que voit le visiteur reste modifiable par la propriétaire, sans développeur.
4. Pensé d'abord pour le téléphone et une connexion lente : rapide, lisible, installable.
5. Un ton direct et concret, jamais emphatique.

## Accessibility & Inclusion

Contraste de texte d'au moins 4,5:1, cibles tactiles d'au moins 44 px, navigation au clavier, animations réduites quand le système le demande.
