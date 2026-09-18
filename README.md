# Site Spicy — spicy-fr

Site statique de la streameuse Spicy, avec séparation nette des **données** (`data/content.yml`) et du **rendu** (`assets/`, `index.html`). Généré par un simple script Node sans dépendance, déployé sur **GitHub Pages**.

## Structure

```
data/content.yml      # TOUT le contenu éditable (textes, liens, réseaux, jeux)
assets/style.css      # Design (thème violet/doré, cadre orné, étoiles)
assets/main.js        # Rendu : lit les données et remplit la page
assets/data.js        # Généré par le build (données inlinées)
index.html            # Squelette HTML statique
scripts/build.mjs     # Build : inlines les données pour un rendu 100% statique
.github/workflows/deploy.yml  # Déploiement automatique GitHub Pages
```

## Modifier le contenu

Éditez uniquement `data/content.yml` (prénom, bio, anniversaire, réseaux, jeux…), poussez sur `main` : le site se reconstruit et se déploie automatiquement.

## Build local / développement

```bash
node scripts/build.mjs        # génère assets/data.js (données inlinées)
npx serve .                   # prévisualisation
```

## Déploiement

GitHub Actions (`deploy.yml`) build et publie sur Pages à chaque push sur `main`. À activer dans **Settings → Pages → Source: GitHub Actions** si nécessaire.

## Domaine personnalisé

Le fichier `CNAME` contient déjà `spicy-fr.com`. Pointez le DNS (CNAME/ALIAS vers `vignemail1.github.io`) comme décrit dans la doc GitHub Pages.
