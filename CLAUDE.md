# CLAUDE.md — BARGO

Référence permanente pour le développement du projet BARGO. Ces règles sont **irréversibles** sauf indication explicite.

---

## Stack technique

| Technologie | Rôle |
|---|---|
| **Astro** | Framework principal, rendu SSR (adapter Netlify) |
| **Tailwind CSS** | Styling — **prioritaire sur le CSS brut** |
| **JavaScript** | Scripts côté client (pas de TypeScript) |
| **CSS pur** | Uniquement si Tailwind ne peut pas le faire, ou pour des règles globales dans `global.css` |

**Jamais** : React, Vue, TypeScript, fichiers `public/assets/` pour les images.

---

## Rendu

Le projet est en **SSR** (Server-Side Rendering) via l'adapter Netlify.
Les pages dynamiques sont dans des dossiers avec fichiers `[id].astro`.

---

## Structure des fichiers

```
src/
├── assets/
│   ├── img/      → images en .avif (jamais dans /public/)
│   └── icon/     → icônes en .svg
├── components/   → composants réutilisables (.astro)
│   └── PbImage.astro → composant image PocketBase (toujours utiliser pour les images PB)
├── js/
│   └── backend.js → fonctions d'accès PocketBase (getCollection, getRecord, getImageUrl)
├── layouts/      → Layout.astro (wrapping global)
├── pages/        → pages Astro
│   ├── index.astro
│   ├── Apropos.astro
│   ├── boutique.astro
│   ├── connexion.astro
│   ├── mention_legal.astro
│   ├── profil.astro
│   ├── bar/
│   │   ├── index.astro
│   │   └── [id].astro
│   └── session/
│       ├── index.astro
│       └── [id].astro
└── styles/
    └── global.css
```

---

## PocketBase (backend dynamique)

URL de base : `https://pbbargo.pierre-mouilleseaux-lhuillier.fr`

### Règles obligatoires

1. **Toutes les fonctions d'accès PocketBase** → dans `src/js/backend.js`
   - `getCollection(collection, params)` — récupère une liste d'enregistrements
   - `getRecord(collection, id)` — récupère un seul enregistrement
   - `getImageUrl(record, filename)` — construit l'URL d'une image PB
2. **Toutes les images PocketBase** → utiliser le composant `<PbImage>` (jamais `<img>` ou `<Image>` directement)
3. Le fetch se fait dans le **frontmatter** (SSR), jamais côté client

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

### Props de PbImage

| Prop | Type | Description |
|---|---|---|
| `record` | Object | L'enregistrement PocketBase complet |
| `recordImage` | string | Le nom du fichier (`bar.img[0]`, etc.) |
| `width` | number | Largeur en px (défaut : 400) |
| `height` | number | Hauteur en px (défaut : 300) |

---

## Images et icônes

- **Images statiques** : format `.avif`, dans `src/assets/img/`, importées avec `import { Image } from 'astro:assets'`
- **Images PocketBase** : utiliser `<PbImage>` (voir section PocketBase)
- **Icônes SVG** : dans `src/assets/icon/`, référencées avec `<img src={icon.src} />` (pas `<Image>`)
- **Jamais** de fichiers statiques dans `/public/assets/`
- Pour rendre un SVG noir (`fill="#000"`) blanc sur fond sombre : `class="invert"` (Tailwind)

```astro
---
import { Image } from 'astro:assets';
import monImage from '../assets/img/mon-image.avif';
import monIcone from '../assets/icon/mon-icone.svg';
---
<Image src={monImage} alt="..." class="..." />
<img src={monIcone.src} alt="" width="24" height="24" />
```

---

## Composants

Créer un composant dans `src/components/` **uniquement si l'élément se répète sur plusieurs pages**.
Nommage : **PascalCase** (`MonComposant.astro`).
Pages : **kebab-case ou PascalCase** selon l'existant.

---

## Typographie — 5 variantes fixes

Ces classes sont **déjà définies dans `global.css`**. Toujours utiliser les balises sémantiques `h1`, `h2`, `h3` plutôt que de ré-écrire les styles manuellement.

| Variante | Balise | Font | Weight | Size | Line-height | Letter-spacing |
|---|---|---|---|---|---|---|
| **H1** | `<h1>` | Manrope | Bold (700) | 90px | 100% | +6% (tracking-[5.4px]) |
| **H2** | `<h2>` | Manrope | Medium (500) | 50px | 100% | +6% (tracking-[3px]) |
| **H3** | `<h3>` | Manrope | Medium (500) | 25px | 140% | -4% (tracking-[-1px]) |
| **base** | `<p>` / `.text-base` | Inter | Medium (500) | 16px | 140% | 0 |
| **sm** | `.text-sm` | Inter | Medium (500) | 14px | 110% | 0 |

> 1 ou 2 exceptions possibles (ex : taille spécifique sur un élément ponctuel), toujours justifiées par le design Figma.

---

## Couleurs — palette principale

| Token | Hex | Usage |
|---|---|---|
| `primary-900` | `#094736` | Vert très foncé |
| `primary-600` | `#347645` | Vert moyen |
| `primary-500` | `#72C073` | Vert principal / accent |
| `neutral-900` | `#000000` | Noir pur |
| `neutral-800` | `#1E1E1E` | Quasi-noir (fonds sombres, navbar) |
| `neutral-500` | `#646262` | Gris texte secondaire |
| `neutral-300` | `#DFDFDF` | Gris clair |
| `neutral-200` | `#F7F1ED` | Beige clair (fonds clairs) |
| `neutral-100` | `#FFFFFF` | Blanc |

En Tailwind, utiliser les valeurs hex directement : `bg-[#094736]`, `text-[#72c073]`, etc.
> 1 ou 2 exceptions possibles si le design Figma l'impose.

---

## Layout

- Largeur max des contenus : `max-w-[1440px] mx-auto px-20`
- Les sections pleine largeur n'ont **pas** de `max-w` sur l'élément `<section>` lui-même
- `main` dans `Layout.astro` est `w-full` sans padding ni max-width
- Design **desktop uniquement** pour l'instant (responsive mobile à prévoir plus tard)
- Breakpoints Tailwind par défaut

### Grille 12 colonnes

La maquette Figma est construite sur une **grille de 12 colonnes** dans un conteneur de 1440px avec `px-20` (80px de padding de chaque côté). Largeur utile : **1280px**.

| Colonnes | Calcul | Valeur Tailwind |
|---|---|---|
| 1 col | 1280 / 12 ≈ 106.67px | — |
| 2 col | 1280 / 6 ≈ 213.33px | — |
| 3 col | 1280 / 4 = 320px | `w-1/4` (dans le conteneur) |
| 4 col | 1280 / 3 ≈ 426.67px | `w-1/3` |
| 6 col | 1280 / 2 = 640px | `w-1/2` |
| 8 col | 1280 × 2/3 ≈ 853.33px | `w-2/3` |
| 12 col | 1280px | `w-full` |

Les positions Figma exprimées en `calc(X%+Ypx)` correspondent aux colonnes de cette grille (ex: `calc(33.33%+38px)` = colonne 5 en partant de la gauche absolue).

---

## Règles de style

1. **Tailwind avant tout** — n'écrire du CSS que si Tailwind est insuffisant
2. **Pas d'inline styles** sauf pour `grid-template-columns` complexes que Tailwind ne supporte pas
3. **Pas de `!important`**
4. Les espacements suivent les valeurs Figma exactes (px arbitraires autorisés : `gap-[109px]`, etc.)

---

## JavaScript

### Où écrire le JS

- **JS spécifique à une page** → balise `<script>` directement dans le fichier `.astro` de la page (en bas, après le HTML)
- **JS partagé entre plusieurs pages** → fichier dans `src/scripts/` importé avec `<script src="/src/scripts/mon-script.js">` ou importé dans le frontmatter si nécessaire

### Règles

- **Vanilla JS uniquement** — pas de framework (React, Vue, Alpine…)
- **Pas de TypeScript** — `.js` seulement, pas de types ni d'annotations
- Utiliser `document.querySelectorAll` / `addEventListener` standard
- Cibler les éléments par classe ou attribut `data-*`
- Le script s'exécute après le rendu HTML (placé en bas de page = comportement par défaut)
- Utiliser `is:inline` uniquement si Astro interfère avec le script (rare)

### Pattern standard

```astro
<!-- HTML de la page -->
<details class="faq-item">...</details>

<script>
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        items.forEach(other => {
          if (other !== item) other.open = false;
        });
      }
    });
  });
</script>
```

### À éviter

- Pas de `document.write`
- Pas de `eval`
- Pas de manipulation du DOM avant que la page soit chargée (les scripts en bas de page sont déjà sûrs)
- Pas de `setTimeout` pour attendre le DOM — repositionner le script à la place
