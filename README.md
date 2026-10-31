# OK Foods Cameroun - " Le site qui se grignote "

Site vitrine **Nuxt 4** (SSR) : le produit se croque, la page se balaie d'une couleur à l'autre, le pied de page est un tas de
miettes qu'on disperse. Bleu dominant, rouge et jaune en ponctuation, typographies géantes (Bagel Fat One - Fraunces - DM Sans).

| Domaine                 | Choix                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| Framework               | Nuxt 4.6 (Vue 3.5, Nitro `node-server`)                                                         |
| Gestionnaire de paquets | **pnpm 12.16.1** (dernière version publiée, épinglée dans `packageManager`)                     |
| Style                   | Tailwind CSS 4 + design tokens CSS (`app/assets/css/tokens.css`, **une seule source**)          |
| Contenu                 | `@nuxt/content` v3 - 100 % JSON, **validé au build** (schémas Zod)                              |
| i18n                    | `@nuxtjs/i18n` - FR (défaut, sans préfixe) + EN (`/en`), repli automatique EN -> FR             |
| Images                  | `@nuxt/image` (AVIF/WebP, lazy, dimensions réservées) + placeholders de marque                  |
| Animations              | GSAP + ScrollTrigger (chargés à la demande), Matter.js (desktop), canvas léger (mobile)         |
| Polices                 | Auto-hébergées (`public/fonts`), `@nuxt/fonts` pour les replis métriques - aucun appel à Google |
| Docker                  | Dockerfile multi-étapes, **sans nginx ni Caddy** (Dokploy gère TLS et reverse-proxy)            |

---

## 1. Démarrer

```bash
# Node 24 LTS recommandé (voir .nvmrc) - Nuxt 4.6 exige >= 22.22.3 / 24.15
npm install -g pnpm@12.16.1      # ou : corepack enable (Node <= 24)
pnpm install                      # utilise pnpm-lock.yaml
cp .env.example .env
pnpm dev                          # http://localhost:3000
```

| Commande                                          | Rôle                                                                                                       |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `pnpm dev` / `pnpm build` / `pnpm start`          | développement - compilation - serveur de production                                                        |
| `pnpm lint` - `pnpm format` - `pnpm format:check` | ESLint + garde-fou de caracteres (`check:chars`) - Prettier                                                |
| `pnpm typecheck`                                  | `vue-tsc` sur l'app **et** le serveur                                                                      |
| `pnpm test`                                       | tests unitaires Vitest (utilitaires purs : morsure, dates, WhatsApp, badge, contraste, repli de langue...) |
| `pnpm test:e2e`                                   | tests Playwright mobile 360 px + desktop 1440 px (voir `tests/e2e`, site déjà lancé)                       |
| `pnpm images:check`                               | état des images attendues ([ok] presente, [!!] requise manquante, [--] optionnelle)                        |

> **pnpm 12 bloque par défaut les scripts d'installation** des dépendances. `pnpm-workspace.yaml` (clé `allowBuilds`) autorise
> uniquement `esbuild`. **Ce fichier doit rester commité et copié dans l'image Docker** (c'est le cas).

## 2. Docker

```bash
cp .env.example .env
docker compose up --build -d          # production locale  -> http://localhost:3000
pnpm docker:dev                       # développement avec rechargement à chaud
docker compose down
```

- `Dockerfile` : `base` (Node 24 + pnpm à la version de `packageManager`) -> `deps` -> `dev` | `build` -> `runtime`.
  L'image finale ne contient que `.output` (Nitro), tourne en utilisateur **non-root** et expose le port **3000**.
- pnpm est installé via `npm install -g pnpm@<version lue dans package.json>` : Corepack n'est plus livré avec Node >= 25 et
  peut échouer sur la vérification de signature des versions récentes. Un seul endroit à modifier pour monter de version : `packageManager`.
- `@nuxt/content` ouvre sa base SQLite au démarrage (`.output/server/contents.sqlite`, générée au build) : `/app` appartient donc à
  l'utilisateur non-root `node`. Elle est dérivée du build : **aucun volume n'est nécessaire**. L'image finale ne contient que `.output` (~ 40 Mo).
- Santé : `GET /api/health` -> `{ "status": "ok" }` (utilisé par `HEALTHCHECK`).

### Déploiement Dokploy

1. _Create Application_ -> source Git -> **Build Type : Dockerfile** (`./Dockerfile`, cible `runtime`). Docker Compose fonctionne aussi avec `docker-compose.yml`.
2. **Port du conteneur : 3000.** Ajouter le domaine dans l'onglet _Domains_ (HTTPS Let's Encrypt géré par Traefik).
3. Onglet _Environment_ - au minimum :
   ```
   NUXT_PUBLIC_SITE_URL=https://votre-domaine.cm
   NUXT_PUBLIC_SHOW_PLACEHOLDERS=false
   ```
   Pour le formulaire de contact : `NUXT_CONTACT_TO`, `NUXT_CONTACT_FROM`, `NUXT_SMTP_HOST`, `NUXT_SMTP_PORT`, `NUXT_SMTP_SECURE`, `NUXT_SMTP_USER`, `NUXT_SMTP_PASS`.
4. _Health check_ (optionnel) : chemin `/api/health`. Chaque `git push` reconstruit l'image : ajouter une image ou un texte = commit + déploiement.

## 3. Variables d'environnement

| Variable                                       | Défaut                  | Usage                                                                           |
| ---------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------- |
| `PORT`                                         | `3000`                  | port d'écoute                                                                   |
| `NUXT_PUBLIC_SITE_URL`                         | `http://localhost:3000` | canonical, hreflang, sitemap, Open Graph (lue à l'exécution)                    |
| `NUXT_PUBLIC_SHOW_PLACEHOLDERS`                | `false`                 | affiche le **nom du fichier attendu** sur chaque placeholder d'image            |
| `NUXT_CONTACT_TO` / `NUXT_CONTACT_FROM`        | -                       | destinataire / expéditeur des messages                                          |
| `NUXT_SMTP_HOST` `PORT` `SECURE` `USER` `PASS` | -                       | SMTP. **Sans SMTP** : le message est journalisé et l'API répond " succès démo " |

## 4. Où modifier quoi (aucun code à toucher)

```
content/
  fr/            <- langue par défaut (obligatoire et complète)
    ui.json          tous les libellés d'interface, mots géants, phrases décoratives
    site.json        nom, slogan, réseaux, n deg WhatsApp de recrutement, mentions légales, confidentialité
    lieu.json        adresse, téléphone, e-mail, horaires, lien carte (+ `mapsEmbedUrl`, `gps` optionnels)
    produits/<slug>.json   un fichier par produit (>= 1)
    recette.json     3 à 8 étapes + 3 à 5 repères
    postes.json      postes (la date limite passée grise la ligne automatiquement)
    avis.json        phrases " Je mange OK Foods quand... "
    croqueurs.json   3 à 24 personnes (3 à 5 avec `enAvant: true` pour " Face à face ")
    contact.json     parcours de conversation par profil
  en/            <- mêmes fichiers ; un fichier ou un champ manquant retombe sur le FR (jamais de page vide)
  images.manifest.json   liste des emplacements d'images (id, chemin, ratio, taille minimale, requis)
config/
  envies.ts  moments.ts  <- listes fermées (envies des produits, moments de la journée)
```

- **Ajouter un produit** : copier un fichier de `content/fr/produits/`, changer `slug` (= nom du fichier), `order`, couleurs `#RRGGBB`,
  `envies`, `kind` (`biscuit` | `sachet` | `bonbon` pour la silhouette de repli) ; ajouter `public/images/produits/<slug>.png`. Il apparaît partout.
- **Ajouter une envie** : l'ajouter dans `config/envies.ts` **et** son libellé dans `ui.json > envies` (FR + EN).
- **Contenu d'exemple** : tout fichier ou entrée avec `"placeholder": true` affiche un badge visible " Contenu d'exemple ".
  Mettre `false` une fois la donnée réelle saisie : le badge disparaît.
- **Validation au build** : couleurs hexadécimales, slugs, dates `AAAA-MM-JJ`, 3-24 croqueurs, références `croqueurs.produit -> produits`,
  identifiants d'images uniques... Une donnée invalide **fait échouer le build** avec le chemin exact de l'erreur.

### Images

1. Déposer le fichier au chemin du manifeste (`public/images/...`) : l'emplacement passe de placeholder à image **sans changer le code**
   (un autre format du même nom - `.webp`, `.png`... - est aussi reconnu). L'index est généré au build : _commit + redéploiement_.
2. Produits : **PNG détouré** (>= 1200 px) - la morsure suit le **contour réel** des pixels non transparents.
3. `pnpm images:check` liste ce qui manque. `NUXT_PUBLIC_SHOW_PLACEHOLDERS=true` affiche, sur chaque placeholder, le nom du fichier attendu.
4. **Droit à l'image** : une photo de croqueur n'est affichée que si `consentement: true`. Sinon placeholder, même si le fichier est présent
   (le build avertit si une photo réelle n'a pas de consentement).

## 5. Architecture des pages (chacune a sa propre ouverture)

| Route             | Mécanique                                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`               | **Le Sachet** (déchirure au scroll sur desktop, automatique ~ 2 s sur mobile) -> " T'as envie de quoi ? " -> " L'heure de la pause " -> bandeau de mots -> aperçu recette -> Team bleue |
| `/produits`       | **Le Défilé** : un produit par écran, couleur qui balaie, index collant, filtre d'envie, **" Croque-moi "** x3 puis " Remanger "                                                        |
| `/recette`        | étapes empilées (collantes sur desktop), chiffres géants, icônes SVG animées, compteurs de repères                                                                                      |
| `/nous-trouver`   | **La Tournée** Douala -> Bonabéri : un tricycle suit le tracé (pont du Wouri) en laissant des miettes ; infos toujours visibles                                                         |
| `/team-bleue`     | postes (ligne grisée après la date limite), **badge candidat** généré sur l'appareil (canvas), candidature WhatsApp                                                                     |
| `/ils-en-parlent` | tableau de gare des réponses (la suivante monte du bas et pousse la précédente vers le haut) - mosaïque organique + visionneuse - "Face à face"                                         |
| `/contact`        | parcours en conversation (jamais l'unique voie) + formulaire classique anti-spam -> `/api/contact`                                                                                      |

### Les trois états de mouvement

| État     | Quand                                                                                             | Effet                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `full`   | desktop capable                                                                                   | physique Matter.js (<= 150 miettes), balayages scrub, transition de page " morsure "            |
| `lite`   | mobile, `Save-Data`, <= 2 cœurs / <= 2 Go, ou < 30 fps mesurés                                    | particules canvas (~ 20), animations déclenchées sans scrub                                     |
| `static` | `prefers-reduced-motion` **ou** bouton " Réduire les animations " (pied de page + menu, mémorisé) | aucun mouvement : états finaux directs ; la morsure passe simplement de " entier " à " croqué " |

La mise en page (sections hautes à contenu collant) est décidée **une seule fois au chargement** (`<html data-layout>`) : la sonde de
fluidité ne peut donc jamais faire " sauter " la page en cours de visite. Le défilement natif n'est jamais détourné.

### Navigation, langue, réseaux sociaux

- **Barre haute** à partir de **1024 px** (7 liens sur une seule ligne, `whitespace-nowrap`). En dessous (mobile **et tablette**), la **barre du bas**
  (Accueil, Produits, Recette, Trouver, Plus) prend le relais, avec un en-tête réduit au logo et au commutateur de langue.
- **Commutateur de langue** : un seul contrôle (`app/components/ui/LangSwitch.vue`) dont le pouce jaune glisse sur la langue active.
  Il fonctionne avec n'importe quel nombre de langues (passe à la suivante). Pas de bouton "Devenir partenaire" dans la navigation ;
  le lien Contact reste dans la barre et dans le menu "Plus".
- **Pied de page - réseaux sociaux** : icônes rondes générées depuis `content/<lang>/site.json` > `social` (`name`, `url`, `placeholder`).
  Noms reconnus (insensibles à la casse) : Facebook, Instagram, TikTok, YouTube, WhatsApp, LinkedIn, Telegram, X/Twitter ; tout autre nom
  affiche une icône de lien. Les 4 entrées livrées pointent vers la page d'accueil de chaque réseau et sont marquées `placeholder: true`
  (le build affiche un avertissement) : **remplacez-les par les vrais comptes**, puis passez `placeholder` à `false`.

## Conventions de code

- **ASCII uniquement** (plus les lettres accentuées françaises) dans le code, les commentaires, les contenus JSON et la documentation :
  pas de flèches, tirets longs, guillemets typographiques, points médians ou traits de dessin. On documente avec des caractères simples
  (`-`, `_`, `<`, `>`, `...`) et on utilise des **icônes** dans l'interface : `UiIcon` (flèches, citation, alerte...), `SocialIcon`,
  `Sep` (petit point séparateur). `pnpm lint` échoue si un caractère interdit est ajouté (`scripts/check-chars.mjs`).

## 6. Accessibilité, performance, SEO

- Un seul `h1` par page, ordre des titres logique, lien d'évitement, focus visible (rouge / jaune sur fond sombre), cibles tactiles >= 44 px,
  `aria-live` sur les compteurs, `<dialog>` natifs (focus géré), texte important **toujours dans le DOM** (jamais derrière un survol).
- Boutons : texte gras >= 19 px (" grand texte " WCAG) ; couleur de texte des écrans produit calculée par contraste (`utils/color.ts`).
- Marquee, tableau de gare et tricycle : pause hors écran ; GSAP chargé uniquement par les pages qui en ont besoin.
- SEO : titre/description uniques par page et par langue, canonical, hreflang (FR/EN/x-default), Open Graph (image de repli
  `public/og/og-default.png` tant que `/og/og-image.png` n'existe pas), `sitemap.xml`, `robots.txt`, JSON-LD `Organization`,
  `LocalBusiness` (champs réels seulement) et `JobPosting` (**postes ouverts et non-exemple uniquement**).
- Sécurité : aucun secret dans le dépôt, champ piège + délai minimum + limite de débit (5 messages / 10 min / IP) sur `/api/contact`,
  carte externe chargée **uniquement au clic**, aucun traceur.

## 7. Ce que j'ai vérifié - et ce que je n'ai pas pu vérifier

**Vérifié ici** : installation pnpm 12 (lockfile gelé) - build de production - lint, formatage, `vue-tsc` (app + serveur) - 16 tests unitaires -
serveur de production : 9 routes x 2 langues (200, 404 correct, SEO, hreflang, JSON-LD, aucune clé de traduction brute) - `/api/contact`
(validation, champ piège, limite de débit -> 429) - échec du build sur donnée invalide - **navigateur Chromium réel** en 1440 px et 360 px :
aucune erreur console ni écart d'hydratation dans les 3 états de mouvement, aucun débordement horizontal, morsure sur un vrai PNG détouré,
badge, conversation, visionneuse, tricycle, déchirure du sachet, détection automatique d'une image déposée + optimisation IPX en production.

**Non vérifié (environnement sans Docker ni vrai appareil)** :

- `docker build` / `docker compose` : le `Dockerfile` n'a pas pu être exécuté ici. Il suit la procédure validée en local
  (`pnpm install --frozen-lockfile` -> `pnpm build` -> `node .output/server/index.mjs`) ; un premier build sur Dokploy est la vraie recette.
- **Lighthouse** (>= 90 perf, >= 95 a11y) et les téléphones réels d'entrée de gamme : à mesurer après déploiement. Les images de production
  (PNG >= 1200 px, photos) pèseront bien plus que les placeholders SVG actuels.
- `pnpm test:e2e` (Playwright) est écrit mais n'a pas été exécuté : les navigateurs Playwright ne sont pas téléchargeables ici.

## 8. Décisions, idées ajoutées et points à valider

- **Textes d'interface proposés** (`ui.json`) - " Ça croque, ça fond, ça se partage. ", " T'as envie de quoi ? ", " Il ne reste que des miettes "...
  Ce sont des propositions de ton : à valider ou remplacer par le client. Aucun chiffre ni fait d'entreprise n'a été inventé : tout est marqué _placeholder_.
- **Silhouettes de repli** dessinées en SVG (biscuit, sachet, bonbon) : le site est complet et crédible avant l'arrivée des PNG.
- **Numéro WhatsApp vide** (`site.json > whatsappRecrutement`) : le lien s'ouvre alors sans destinataire, avec un avertissement visible.
- **Adresse e-mail d'exemple** `a-renseigner@example.com` (domaine réservé) - à remplacer dans `site.json` et `lieu.json`.
- **Nous trouver** : la géographie est respectée (Bonabéri à l'ouest du Wouri, Douala à l'est) ; le tricycle roule donc de droite à gauche.
  La carte intégrée est optionnelle (`mapsEmbedUrl`).
- **JobPosting** non émis pour les postes d'exemple (éviter de publier de faux emplois dans Google). Ajouter `datePublication` aux vrais postes.
- Au build, `@nuxt/content` affiche un avertissement bénin sur les fichiers-tableaux (`avis`, `croqueurs`, `postes`) : il les range sous la clé `body`, ce que le code attend.
- Mentions légales et politique de confidentialité : textes **à fournir et à faire valider**.
