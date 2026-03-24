# CLAUDE.md — BARGO

Référence permanente pour le développement du projet BARGO. Ces règles sont **irréversibles** sauf indication explicite.

---

## Stack technique

| Technologie | Rôle |
|---|---|
| **Astro 5** | Framework principal, rendu SSR (adapter Node standalone) |
| **Tailwind CSS 4** | Styling — **prioritaire sur le CSS brut** (via @tailwindcss/vite) |
| **JavaScript** | Scripts côté client (pas de TypeScript) |
| **PocketBase** | Backend : base de données, auth, images |
| **CSS pur** | Uniquement si Tailwind ne peut pas le faire, ou règles globales dans `global.css` |

**Jamais** : React, Vue, TypeScript, fichiers dans `public/assets/` pour les images.

---

## Rendu & déploiement

- **SSR** (Server-Side Rendering) via `output: 'server'` + `@astrojs/node` (mode standalone)
- `security: { checkOrigin: false }` — désactivé intentionnellement
- Tailwind 4 : configuré dans `global.css` via `@theme {}` (pas de `tailwind.config.mjs`)
- Les pages dynamiques ont des fichiers `[id].astro` dans leur dossier

---

## Structure des fichiers

```
src/
├── assets/
│   ├── img/      → images statiques en .avif (jamais dans /public/)
│   └── icon/     → icônes en .svg
├── components/   → composants réutilisables (.astro)
├── js/           → scripts JS côté client
│   └── backend.js → toutes les fonctions d'accès PocketBase
├── layouts/      → Layout.astro (enveloppe globale)
├── pages/
│   ├── index.astro           → accueil (redirige vers LandingPage si non connecté)
│   ├── LandingPage.astro     → page d'accueil non connecté
│   ├── connexion.astro       → formulaire login (POST)
│   ├── inscription.astro     → formulaire register (POST)
│   ├── bienvenue.astro       → onboarding post-inscription
│   ├── Apropos.astro
│   ├── boutique.astro        → shop (onglets: décoration_avatar, theme, titre)
│   ├── abonnement.astro      → plans Gratuit/VIP/Premium
│   ├── contact.astro         → formulaire + carte Leaflet
│   ├── mention_legal.astro
│   ├── paiement.astro
│   ├── jeux.astro            → grille jeux avec pagination
│   ├── 404.astro
│   ├── admin.astro
│   ├── bar/
│   │   ├── index.astro       → grille de tous les bars
│   │   └── [id].astro        → détail bar
│   ├── jeux_questionaire/
│   │   ├── index.astro       → liste questionnaires
│   │   └── jouer.astro       → lecture questionnaire
│   ├── profil/
│   │   ├── index.astro       → mon profil (onglets: profil, notifications, inventaire, paramètres)
│   │   └── [id].astro        → profil d'un autre utilisateur
│   └── session/
│       ├── index.astro       → liste des sessions de l'utilisateur
│       ├── creer.astro       → création d'une nouvelle session
│       └── [id].astro        → détail + gestion session (app-like)
└── styles/
    └── global.css            → variables @theme, typo, classes custom
public/
    └── favicon.svg           → seul fichier statique autorisé dans /public
```

---

## Composants existants (`src/components/`)

| Composant | Rôle |
|---|---|
| `Layout.astro` | Enveloppe globale : head, Header, Footer, CookieBanner, NotifBubble |
| `Header.astro` | Nav fixe top-0 (logo, liens, avatar user, hamburger mobile) |
| `Footer.astro` | Pied de page 4 colonnes desktop / colonne mobile, fond image |
| `PbImage.astro` | Affichage images PocketBase avec fallback gris. Props: `record`, `recordImage`, `src`, `alt`, `class`, `width`, `height` |
| `Seo.astro` | Meta, Open Graph, Twitter Card, canonical |
| `HeroSection.astro` | Bannière hero `bg-primary-900`, props: `title`, `descMobile`, `overflow` |
| `Faq.astro` | FAQ accordion (détails HTML, une seule ouverte à la fois) |
| `Partenaires.astro` | Carousel drag-scroll partenaires (no scrollbar) |
| `CookieBanner.astro` | Bandeau RGPD fixed bottom, localStorage `cookie_consent` |
| `NotifBubble.astro` | Widget notifications fixed bottom-right (demandes amis, sessions, notifs) |
| `LikeButton.astro` | Bouton favori (cœur), props: `id`, `liked`, `variant` (bar\|jeux\|item) |
| `SessionPanel.astro` | Panneau latéral session/[id] (onglets: Bars, Jeux, Amis, Paramètres) |
| `SessionModals.astro` | Modales session/[id] (ajout, suppression, arrêt, écran fin) |
| `LeafletMap.astro` | Carte Leaflet, props: `id`, `lat`, `lon`, `name`, `zoom` |
| `Pagination.astro` | Pagination réutilisable, props: `page`, `totalPages`, `currentUrl` |

**Règle** : créer un composant **uniquement si l'élément se répète sur plusieurs pages**.
**Nommage** : PascalCase (`MonComposant.astro`). Pages : kebab-case ou PascalCase selon l'existant.

---

## PocketBase (backend dynamique)

**URL de base** : `https://pbbargo.pierre-mouilleseaux-lhuillier.fr`

### Fonctions dans `src/js/backend.js`

| Fonction | Description |
|---|---|
| `getCollection(collection, params)` | Fetch liste (perPage: 50 par défaut) |
| `getRecord(collection, id)` | Fetch un enregistrement |
| `getImageUrl(record, filename)` | Construit l'URL d'une image PB |
| `loginUser(email, password)` | Authentification → `{ token, record }` |
| `registerUser(data)` | Création de compte |
| `getUserAuth(userId, token)` | Fetch user avec tous les expand nécessaires |
| `updateUser(userId, token, data)` | PATCH user (FormData ou JSON) |
| `getCollectionAuth(collection, token, params)` | Fetch authentifiée |
| `deleteUser(userId, token)` | Suppression de compte |

### Collections PocketBase utilisées

| Collection | Champs clés |
|---|---|
| `users` | avatar, pseudo, prenom, nom, email, age, ville, description, points, abonnements, insta, `facbook` *(typo)*, discord, bar_favori, boisson_favori, jeux_favori, items_favori, amies, demande_amies, demande_session, equiper_avatar_decoration, equiper_titre, equiper_theme, possed_avatar_decoration, possed_titre, possed_theme |
| `bar` | nom, adresse, description, img[], galerie[], horaires_*, specialites, disponibilite, contact, localisation{lat,lon} |
| `jeux` | nom, description, img, type_du_jeux |
| `boison` | *(typo : boisson)* |
| `boutique` | type (decoration_avatar\|theme\|titre), type_decoration_avatar, `type_them` *(typo)*, type_titre, prix |
| `session_barathon` | nom, date_heur_depart, date_heur_arriver, description, etat_session, id_hote, id_inviter[], id_bar[], id_jeux, id_sam[], bar_actuel |
| `notifications` | user, texte/message/contenu, lu, created |
| `jeux_questionaire` | questions, réponses |

> ⚠️ **Typos connues dans PocketBase** (ne pas corriger côté code) :
> - `facbook` (users) au lieu de `facebook`
> - `boison` au lieu de `boisson`
> - `heur_depart` au lieu de `heure_depart`
> - `type_them` (boutique) au lieu de `type_theme`

### Authentification (cookies httpOnly)

```js
// Cookies posés à la connexion (7 jours)
Astro.cookies.set('pb_token',   token,  { path: '/', httpOnly: true, maxAge: 604800 });
Astro.cookies.set('pb_user_id', userId, { path: '/', httpOnly: true, maxAge: 604800 });

// Guard dans chaque page protégée
const token  = Astro.cookies.get('pb_token')?.value;
const userId = Astro.cookies.get('pb_user_id')?.value;
if (!token || !userId) return Astro.redirect('/connexion');
```

### Expand standard pour getUserAuth

```
bar_favori, boisson_favori, jeux_favori, demande_amies, amies,
amies.equiper_avatar_decoration, demande_session,
equiper_avatar_decoration, equiper_titre, equiper_theme,
possed_avatar_decoration, possed_titre, possed_theme, items_favori
```

### Règles PocketBase

1. **Toutes les fonctions d'accès** → dans `src/js/backend.js`
2. **Toutes les images PocketBase** → composant `<PbImage>` (jamais `<img>` directement)
3. **Le fetch se fait dans le frontmatter** (SSR), jamais côté client
4. **Les PATCH/POST côté client** (like, équiper article, etc.) utilisent `fetch()` en JS avec `Authorization: Bearer token`

### Pattern standard

```astro
---
import { getCollection } from '../js/backend.js';
import PbImage from '../components/PbImage.astro';

const bars = await getCollection('bar', { sort: 'created' });
---

{bars.map(bar => (
  <div>
    <PbImage record={bar} recordImage={bar.img?.[0]} width={845} height={670} />
    <p>{bar.nom}</p>
  </div>
))}
```

### Passage de données SSR → JS client

```astro
<script is:inline>
  window.__AUTH__ = { token: {JSON.stringify(token)}, userId: {JSON.stringify(userId)} };
</script>
<script src="/src/js/mon-script.js"></script>
```

---

## Images et icônes

- **Images statiques** (`.avif`, `.svg`) : toujours utiliser `<Image src={import} />` — **jamais `<img src={x.src} />`**
- **Images PocketBase** : toujours utiliser `<PbImage>` — **jamais `<img>` directement**
- **Jamais** de fichiers statiques dans `/public/assets/` (seul `favicon.svg` est dans `/public/`)
- Pour rendre un SVG blanc sur fond sombre : `class="invert"` (Tailwind)

### `<Image>` — assets statiques

```astro
---
import { Image } from 'astro:assets';
import monImage from '../assets/img/mon-image.avif';
import monIcone from '../assets/icon/mon-icone.svg';
---
<Image src={monImage} alt="..." class="..." />
<Image src={monIcone} alt="" width={24} height={24} />
```

> ⚠️ Passer l'import **directement** (pas `.src`). `width`/`height` en nombres `{24}` pas en strings `"24"`.

### `<PbImage>` — images PocketBase

Props disponibles :

| Prop | Type | Description |
|---|---|---|
| `record` | object | Enregistrement PocketBase (requis si pas de `src`) |
| `recordImage` | string | Nom du fichier image dans le record |
| `src` | string | URL PocketBase pré-construite (alternative à record+recordImage) |
| `alt` | string | Texte alternatif (défaut : `record.nom`) |
| `class` | string | Classes CSS (défaut : `w-full h-full object-cover`) |
| `width` | number | Largeur (défaut : 400) |
| `height` | number | Hauteur (défaut : 300) |

```astro
---
import PbImage from '../components/PbImage.astro';
---

<!-- Avec record + fichier -->
<PbImage record={bar} recordImage={bar.img?.[0]} width={845} height={670} />

<!-- Avec URL pré-construite (avatar, décoration, etc.) -->
<PbImage src={avatarUrl} alt="Avatar" class="w-full h-full object-cover rounded-full" />
```

---

## Typographie — 5 variantes fixes

Définies dans `global.css` avec responsive intégré. Toujours utiliser les balises sémantiques.

| Variante | Balise | Font | Weight | Mobile | Desktop | Line-height | Letter-spacing |
|---|---|---|---|---|---|---|---|
| **H1** | `<h1>` | Manrope | Bold 700 | 35px | 90px | 100% | +6% |
| **H2** | `<h2>` | Manrope | Bold 700 | 26px | 50px | 100% | +6% |
| **H3** | `<h3>` | Manrope | Medium 500 | 18px | 25px | 140% | -4% |
| **base** | `<p>` | Inter | Medium 500 | 16px | 16px | 140% | 0 |
| **sm** | `.text-sm` | Inter | Medium 500 | 14px | 14px | 110% | 0 |

> Exceptions ponctuelles autorisées si le design le justifie (ex: `text-[35px] lg:text-[90px]` sur un élément spécifique).

---

## Couleurs — palette complète

Définies via `@theme` dans `global.css`. En Tailwind : `bg-primary-900`, `text-primary-500`, etc.

| Token | Hex | Usage |
|---|---|---|
| `primary-900` | `#094736` | Vert très foncé (fonds hero, boutons principaux) |
| `primary-600` | `#347645` | Vert moyen (boutons équipé, succès) |
| `primary-550` | `#5AAD5B` | Vert intermédiaire |
| `primary-500` | `#72C073` | Vert principal / accent (indicateur, badges) |
| `neutral-800` | `#1E1E1E` | Quasi-noir (fonds sombres, sidebar, navbar) |
| `neutral-500` | `#646262` | Gris texte secondaire |
| `neutral-350` | `#E7E5E5` | Gris séparateur (border-b tabs) |
| `neutral-300` | `#DFDFDF` | Gris clair (borders, fonds neutres) |
| `neutral-200` | `#F7F1ED` | Beige clair (fonds de page) |

> `neutral-100` = blanc → utiliser `white` ou `bg-white` directement.

---

## Responsive — mobile-first avec Tailwind

Le responsive se fait **exclusivement avec les préfixes Tailwind**. Pas de `@media` en CSS brut, pas d'`!important`.

| Contexte | Préfixe | Exemple |
|---|---|---|
| **Mobile** (base, < 1024px) | *(aucun)* | `text-sm`, `flex-col`, `px-4` |
| **Desktop** (≥ 1024px) | `lg:` | `lg:text-base`, `lg:flex-row`, `lg:px-20` |

> **`lg:` est le breakpoint principal**. Les autres (`sm:`, `md:`, `xl:`) sont autorisés si le design le justifie.

```astro
<div class="flex flex-col lg:flex-row gap-4 lg:gap-13">
  <h1 class="text-[35px] lg:text-[90px]">Titre</h1>
  <p class="text-sm lg:text-base px-4 lg:px-20">Texte</p>
</div>

<!-- Visible uniquement mobile -->
<div class="block lg:hidden">...</div>

<!-- Visible uniquement desktop -->
<div class="hidden lg:block">...</div>
```

**À ne jamais faire :**
- `style="..."` avec des media queries inline
- `@media` dans `<style>` ou `global.css` pour du responsive page par page
- `!important` pour écraser des styles responsive
- Dupliquer le HTML pour mobile/desktop (sauf cas extrême avec `hidden lg:block`)

---

## Layout & grille

- Largeur max des contenus : `max-w-[1440px] mx-auto px-4 lg:px-20`
- Les sections pleine largeur n'ont **pas** de `max-w` sur l'élément `<section>`
- `main` dans `Layout.astro` est `w-full pt-23` (padding-top pour le header fixe de 92px)
- Fond beige global : `bg-neutral-200` — les panels de profil et contenus principaux s'appuient dessus

### Grille 12 colonnes (base Figma)

Conteneur 1440px, padding 80px × 2 = **1280px utiles**.

| Colonnes | Valeur Tailwind |
|---|---|
| 3 col | `w-1/4` |
| 4 col | `w-1/3` |
| 6 col | `w-1/2` |
| 8 col | `w-2/3` |
| 12 col | `w-full` |

---

## Règles de style

1. **Tailwind avant tout** — n'écrire du CSS que si Tailwind est insuffisant
2. **CSS global / partagé** → dans `src/styles/global.css`
3. **CSS spécifique à une page** → balise `<style>` dans le `.astro` si court et non réutilisable
4. **Inline styles autorisés uniquement pour** :
   - `z-index` sur des éléments avec positionnement absolu imbriqué
   - `background-image` avec une URL dynamique (ex: thème profil)
   - Positions pixel-exact issues de la grille Figma (`left: calc(...)`)
   - Transitions JS (`style="left: 0; width: 0;"` pour indicateurs animés)
5. **Pas de `!important`**
6. Les espacements suivent les valeurs Figma exactes (px arbitraires autorisés : `gap-[109px]`)

---

## JavaScript

### Fichiers JS dans `src/js/`

| Fichier | Usage |
|---|---|
| `backend.js` | Toutes les fonctions PocketBase (SSR + client) |
| `header.js` | Menu hamburger mobile |
| `carousel.js` | Carousel bars (translateX) |
| `drag-scroll.js` | Carousel partenaires (mousedown/move) |
| `faq.js` | FAQ accordion |
| `cookie-banner.js` | Consentement cookies |
| `notif-bubble.js` | Panel notifications flottant |
| `like.js` | Système favoris (bar, jeux, boutique) |
| `profil.js` | Gestion profil (upload avatar, tabs, edit) |
| `profil-id.js` | Profil tiers (demande ami, etc.) |
| `inventaire.js` | Équiper articles depuis l'inventaire |
| `boutique.js` | Boutique (acheter, équiper, tabs) |
| `session-detail.js` | Session active (modales, onglets) |
| `session-creer.js` | Création session |
| `amis.js` | Gestion demandes d'amis |
| `inscription.js` | Validation formulaire inscription |
| `leaflet-map.js` | Init carte Leaflet (CDN) |

### Règles JS

- **Vanilla JS uniquement** — pas de framework (React, Vue, Alpine…)
- **Pas de TypeScript** — `.js` seulement
- Cibler les éléments par classe ou attribut `data-*`
- Le script s'exécute après le rendu HTML (bas de page = comportement par défaut)
- Utiliser `is:inline` uniquement si Astro interfère avec le script (rare)

```astro
<details class="faq-item">...</details>

<script>
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        items.forEach(other => { if (other !== item) other.open = false; });
      }
    });
  });
</script>
```

**À éviter :** `document.write`, `eval`, manipulation DOM avant chargement, `setTimeout` pour attendre le DOM.

---

## Patterns récurrents à respecter

### Carte bar / jeu / boutique
```html
<div class="bg-white rounded-0.5 shadow-[0px_7px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden">
  <div class="h-40 lg:h-50 overflow-hidden"><!-- Image --></div>
  <div class="p-4">
    <h3 class="m-0 text-black">{nom}</h3>
    <button class="w-full h-12 bg-neutral-800 text-white ...">Action</button>
  </div>
</div>
```

### Section alternée (beige ↔ sombre)
```html
<section class="bg-neutral-200 px-4 lg:px-20 py-8 lg:py-20">...</section>
<section class="bg-neutral-800 px-4 lg:px-20 py-8 lg:py-20">...</section>
```

### Header de section avec séparateur
```html
<div class="flex items-center gap-7.5 mb-11.25">
  <h2 class="text-black m-0 shrink-0">Titre section</h2>
  <div class="flex-1 h-0.5 bg-neutral-300"></div>
</div>
```

### Bouton principal
```html
<!-- Pleine largeur -->
<button class="w-full h-12 bg-primary-900 text-white text-4 font-medium border-0 cursor-pointer hover:opacity-90 transition-opacity">
  Action
</button>
```

### Avatar avec décoration (profil)
```html
<!-- Le conteneur ne doit PAS avoir de border CSS — utiliser un div anneau séparé -->
<div class="relative w-25 h-25 rounded-full">
  <div class="absolute inset-0 rounded-full" style="border: 8px solid #dfdfdf; z-index:1;"></div>
  <div class="absolute inset-2 rounded-full overflow-hidden" style="z-index:2;">
    <!-- Photo -->
  </div>
  <!-- La décoration couvre tout le conteneur (inset-0) par-dessus -->
  <img src={decoUrl} class="absolute inset-0 w-full h-full object-contain pointer-events-none" style="z-index:3;" />
</div>
```

> ⚠️ Ne pas mettre `border` CSS sur le conteneur parent d'un `absolute inset-0` : les enfants se positionnent par rapport au content-box (intérieur du border), pas au border-box. Utiliser un div anneau séparé.
