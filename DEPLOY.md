# Mise en ligne du site

Ce dépôt contient le site public et l'interface d'administration (`/admin`). L'API est dans un autre dépôt (`lmd_api`), hébergée sur Render : voir son `DEPLOY.md`.

Hébergeurs prévus : **Netlify** (fichier `netlify.toml`) ou **Vercel** (fichier `vercel.json`). Un seul des deux suffit.

## 1. Avant de commencer

Il faut l'adresse de l'API, par exemple `https://lmd-api.onrender.com` (étape 3 du `DEPLOY.md` de l'API). Si elle n'existe pas encore, faites d'abord l'API.

## 2. Netlify

1. <https://app.netlify.com> > **Add new site** > **Import an existing project** > choisissez le dépôt GitHub du site.
2. Les réglages de construction viennent de `netlify.toml` (commande `npm run build`, dossier `dist`).
3. **Avant le premier déploiement**, ouvrez `netlify.toml` et remplacez `lmd-api-qixr.onrender.com` par l'adresse de votre API (3 endroits), puis poussez.
4. Dans **Site configuration > Environment variables**, ajoutez :

| Variable | Valeur |
|---|---|
| `VITE_API_URL` | `https://lmd-api-qixr.onrender.com/api` |

5. Déployez. Le site est disponible sur `https://quelquechose.netlify.app`.

### Variante Vercel

Même principe : importez le dépôt, remplacez `lmd-api-qixr.onrender.com` dans `vercel.json`, ajoutez `VITE_API_URL`.

## 3. Relier le site et l'API

Retournez dans Render, dans les variables de l'API, et renseignez l'adresse du site (sans `/` final) :

- `CORS_ORIGIN`
- `FRONTEND_URL`
- `PUBLIC_SITE_URL`

Redéployez l'API. Sans `CORS_ORIGIN`, le site ne pourra pas lire les produits.

## 4. Pourquoi les pages produit passent par l'API

Un site statique envoie toujours la même page, avec le même titre. Quand vous collez un lien produit dans WhatsApp, l'aperçu a besoin du **nom, de la photo et de la description de ce produit**. Les règles `/produit/*` de `netlify.toml` demandent donc cette page à l'API, qui renvoie le site avec les bonnes balises. Les autres pages ne dépendent pas de l'API pour s'afficher.

Conséquence : si l'API est en veille (offre gratuite de Render), l'ouverture d'un lien produit peut attendre environ une minute. Voir « Éviter la mise en veille » dans le `DEPLOY.md` de l'API.

## 5. Nom de domaine

Dans Netlify > **Domain management**, ajoutez votre domaine et créez les enregistrements DNS indiqués. HTTPS est automatique. Mettez ensuite à jour `PUBLIC_SITE_URL`, `FRONTEND_URL` et `CORS_ORIGIN` dans Render avec le domaine définitif, puis redéployez l'API.

## 6. Vérifier

- `https://VOTRE-SITE/` s'affiche, avec les produits.
- `https://VOTRE-SITE/admin` : connexion avec votre numéro de téléphone.
- `https://VOTRE-SITE/sitemap.xml` liste les produits avec l'adresse du site.
- Un lien produit envoyé sur WhatsApp affiche la photo et le nom du produit (testez avec un lien jamais partagé : WhatsApp garde les aperçus en mémoire).
- Le bouton WhatsApp d'un produit ouvre la conversation avec le bon numéro et le message prêt.

## Variables

| Variable | Rôle |
|---|---|
| `VITE_API_URL` | Adresse de l'API, avec `/api` à la fin. Obligatoire en production. |
| `VITE_WHATSAPP_NUMBER`, `VITE_WHATSAPP_DEFAULT_MESSAGE` | Valeurs de secours seulement : tout se règle dans l'admin. |

Le numéro WhatsApp, les textes, les produits et le référencement se gèrent dans l'admin (`/admin`), pas dans ces fichiers.
