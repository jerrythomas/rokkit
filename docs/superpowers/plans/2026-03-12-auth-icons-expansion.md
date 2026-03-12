# Auth Icon Set Expansion Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the `@rokkit/icons` auth set from 13 to ~120+ icons covering auth platforms, social providers, and auth methods with brand variants and Solar-style design variants.

**Architecture:** All SVGs live flat in `src/auth/` with hyphenated naming for variants (e.g. `github-white.svg`). Brand icons sourced from Simple Icons (npm) and official brand kits. Auth method icons sourced from the Solar Iconify set. No build system changes needed — existing `rokkit-cli bundle` command picks up all SVGs automatically.

**Tech Stack:** Bun, `simple-icons` npm, `@iconify-json/solar` npm, `@iconify/tools` (already in CLI), SVG normalization scripts in `scripts/`

**Spec:** `docs/superpowers/specs/2026-03-12-auth-icons-expansion-design.md`

---

## Chunk 1: Convex Icons + Scripting Infrastructure

### Task 1: Create SVG normalization helper script

**Files:**
- Create: `solution/packages/icons/scripts/normalize.js`

This script will be used by subsequent tasks to normalize SVG dimensions.

- [ ] **Step 1: Create scripts directory and normalize helper**

```js
// solution/packages/icons/scripts/normalize.js
import { readFileSync, writeFileSync } from 'fs'

/**
 * Parse width/height from SVG string (from attributes or viewBox)
 */
export function parseDimensions(svg) {
  const vbMatch = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)
  if (!vbMatch) throw new Error('No viewBox found in SVG')
  return { w: parseFloat(vbMatch[1]), h: parseFloat(vbMatch[2]) }
}

/**
 * Normalize an SVG to target height, preserving aspect ratio.
 * For square icons pass targetH=24, targetW=24.
 * For wordmarks pass targetH=24, targetW=null (auto).
 */
export function normalizeSVG(svgContent, targetH = 24, targetW = null) {
  const { w, h } = parseDimensions(svgContent)
  const scale = targetH / h
  const finalW = targetW ?? Math.round(w * scale)
  return svgContent
    .replace(/width="[^"]*"/, `width="${finalW}"`)
    .replace(/height="[^"]*"/, `height="${targetH}"`)
}

/**
 * Replace all fill colors (except 'none') with a single color.
 */
export function monochromeVariant(svgContent, color) {
  return svgContent
    .replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`)
    .replace(/stop-color="[^"]*"/g, `stop-color="${color}"`)
    .replace(/fill-opacity="[^"]*"/g, '') // remove opacity overrides
}

/**
 * Read, normalize, and write an SVG file.
 */
export function processFile(inputPath, outputPath, opts = {}) {
  const { targetH = 24, targetW = null, color = null } = opts
  let svg = readFileSync(inputPath, 'utf8')
  svg = normalizeSVG(svg, targetH, targetW)
  if (color) svg = monochromeVariant(svg, color)
  writeFileSync(outputPath, svg, 'utf8')
  console.log(`Written: ${outputPath}`)
}
```

- [ ] **Step 2: Verify script has no syntax errors**

```bash
cd solution/packages/icons && node --input-type=module < scripts/normalize.js
```
Expected: no errors, just imports/exports nothing printed.

---

### Task 2: Add Convex icons from downloaded files

**Files:**
- Create: `solution/packages/icons/scripts/add-convex.js`
- Create: `solution/packages/icons/src/auth/convex.svg`
- Create: `solution/packages/icons/src/auth/convex-white.svg`
- Create: `solution/packages/icons/src/auth/convex-black.svg`
- Create: `solution/packages/icons/src/auth/convex-logo.svg`
- Create: `solution/packages/icons/src/auth/convex-logo-white.svg`
- Create: `solution/packages/icons/src/auth/convex-logo-black.svg`
- Create: `solution/packages/icons/src/auth/convex-wordmark.svg`
- Create: `solution/packages/icons/src/auth/convex-wordmark-white.svg`

Source files are in `/Users/Jerry/Downloads/Logos/SVG/`.

Convex SVG dimensions:
- Symbol: `184×188` viewBox → normalize to `24×24`
- Logo (symbol+wordmark): `382×146` → normalize to `63×24` (width = round(382/146×24))
- Wordmark: `322×146` → normalize to `53×24`

- [ ] **Step 1: Create the Convex processing script**

```js
// solution/packages/icons/scripts/add-convex.js
import { processFile, monochromeVariant, normalizeSVG } from './normalize.js'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const SRC = '/Users/Jerry/Downloads/Logos/SVG'
const OUT = resolve('src/auth')

const files = [
  // symbol
  { in: `${SRC}/symbol-color.svg`,   out: `${OUT}/convex.svg`,               h: 24, w: 24 },
  { in: `${SRC}/symbol-white.svg`,   out: `${OUT}/convex-white.svg`,         h: 24, w: 24 },
  { in: `${SRC}/symbol-black.svg`,   out: `${OUT}/convex-black.svg`,         h: 24, w: 24 },
  // logo (symbol + wordmark)
  { in: `${SRC}/logo-color.svg`,     out: `${OUT}/convex-logo.svg`,          h: 24, w: null },
  { in: `${SRC}/logo-white.svg`,     out: `${OUT}/convex-logo-white.svg`,    h: 24, w: null },
  { in: `${SRC}/logo-black.svg`,     out: `${OUT}/convex-logo-black.svg`,    h: 24, w: null },
  // wordmark only
  { in: `${SRC}/wordmark-black.svg`, out: `${OUT}/convex-wordmark.svg`,      h: 24, w: null },
  { in: `${SRC}/wordmark-white.svg`, out: `${OUT}/convex-wordmark-white.svg`,h: 24, w: null },
]

for (const f of files) {
  processFile(f.in, f.out, { targetH: f.h, targetW: f.w })
}
console.log('Convex icons written.')
```

- [ ] **Step 2: Run the script**

```bash
cd solution/packages/icons && node scripts/add-convex.js
```
Expected: 8 lines "Written: ..." and "Convex icons written."

- [ ] **Step 3: Verify the output SVGs look right**

```bash
head -2 src/auth/convex.svg src/auth/convex-wordmark.svg src/auth/convex-logo.svg
```
Expected: `convex.svg` has `width="24" height="24"`, `convex-wordmark.svg` has `height="24"` with a wider width (~53).

- [ ] **Step 4: Run build to confirm all 8 Convex icons process cleanly**

```bash
cd solution/packages/icons && bun run build
```
Expected: no errors, `lib/auth.json` now contains `convex`, `convex-white`, etc. keys.

- [ ] **Step 5: Commit**

```bash
cd solution && git add packages/icons/scripts/ packages/icons/src/auth/convex*.svg
git commit -m "feat(icons): add Convex icon variants from official brand kit"
```

---

## Chunk 2: Brand Icons via Simple Icons

### Task 3: Set up Simple Icons sourcing script

Simple Icons provides a flat npm package with monochrome SVG paths and hex brand colors. Install it as a dev dependency, then extract SVGs.

**Files:**
- Modify: `solution/packages/icons/package.json`
- Create: `solution/packages/icons/scripts/add-brand-icons.js`

- [ ] **Step 1: Add simple-icons as dev dependency**

```bash
cd solution/packages/icons && bun add -d simple-icons
```

- [ ] **Step 2: Verify simple-icons installs and has the brands we need**

```bash
node -e "import('simple-icons').then(m => { ['github','google','apple','twitter','facebook','supabase','auth0','clerk','okta','appwrite','pocketbase','keycloak','microsoftazure','microsoft','awsamplify','amazoncognito'].forEach(s => { const icon = m['si' + s.charAt(0).toUpperCase() + s.slice(1)]; console.log(s, icon ? icon.hex : 'NOT FOUND') }) })"
```
Expected: hex colors printed for each. Note any NOT FOUND and adjust slug names.

- [ ] **Step 3: Create the brand icons script**

```js
// solution/packages/icons/scripts/add-brand-icons.js
import * as si from 'simple-icons'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const OUT = resolve('src/auth')

// Map: output filename stem → { siSlug, color override or null }
// siSlug is the camelCase key after 'si' prefix in simple-icons
const BRANDS = [
  // Social auth
  { name: 'github',        slug: 'Github' },
  { name: 'google',        slug: 'Google' },
  { name: 'apple',         slug: 'Apple' },
  { name: 'twitter',       slug: 'X',         hex: '000000' }, // X/Twitter uses black
  { name: 'facebook',      slug: 'Facebook' },
  { name: 'microsoft',     slug: 'Microsoft' },
  // Auth platforms
  { name: 'auth0',         slug: 'Auth0' },
  { name: 'clerk',         slug: 'Clerk' },
  { name: 'okta',          slug: 'Okta' },
  { name: 'appwrite',      slug: 'Appwrite' },
  { name: 'pocketbase',    slug: 'Pocketbase' },
  { name: 'keycloak',      slug: 'Keycloak' },
  { name: 'azure',         slug: 'Microsoftazure' },
  { name: 'amplify',       slug: 'Awsamplify' },
  { name: 'cognito',       slug: 'Amazoncognito' },
  { name: 'nextauth',      slug: 'Nextdotjs', hex: '000000' }, // Auth.js uses Next.js icon
  { name: 'supabase',      slug: 'Supabase' },
]

function makeSVG(path, fill, size = 24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="${path}" fill="${fill}"/>
</svg>`
}

for (const brand of BRANDS) {
  const icon = si[`si${brand.slug}`]
  if (!icon) {
    console.warn(`NOT FOUND: ${brand.name} (si${brand.slug})`)
    continue
  }
  const hex = brand.hex ?? icon.hex
  const brandColor = `#${hex}`

  // Default: color version using brand hex
  writeFileSync(`${OUT}/${brand.name}.svg`, makeSVG(icon.path, brandColor))
  // White variant
  writeFileSync(`${OUT}/${brand.name}-white.svg`, makeSVG(icon.path, '#ffffff'))
  // Black variant
  writeFileSync(`${OUT}/${brand.name}-black.svg`, makeSVG(icon.path, '#141414'))

  console.log(`Written: ${brand.name} (color: ${brandColor})`)
}

console.log('Brand icons complete.')
```

- [ ] **Step 4: Run the script**

```bash
cd solution/packages/icons && node scripts/add-brand-icons.js
```
Expected: a line per brand, no NOT FOUND. Adjust any missing slugs using `node -e "import('simple-icons').then(m => Object.keys(m).filter(k => k.includes('Nextauth')))"`.

- [ ] **Step 5: Spot-check a few SVGs**

```bash
head -3 src/auth/github.svg src/auth/facebook.svg src/auth/auth0.svg
```
Expected: `width="24" height="24"` and correct fill colors.

- [ ] **Step 6: Run build**

```bash
cd solution/packages/icons && bun run build
```
Expected: no errors. `lib/auth.json` gains `github`, `github-white`, `github-black`, `facebook`, `auth0`, etc.

- [ ] **Step 7: Commit**

```bash
cd solution && git add packages/icons/src/auth/ packages/icons/scripts/add-brand-icons.js packages/icons/package.json
git commit -m "feat(icons): add brand icon variants (color/white/black) via simple-icons"
```

---

### Task 4: Update Firebase to new 2024 brand

Firebase changed their icon in 2024. The old icon (in `src/auth/firebase.svg`) uses the old flame shape. The new brand uses a colorful abstract symbol.

**Files:**
- Modify: `solution/packages/icons/src/auth/firebase.svg`
- Create: `solution/packages/icons/src/auth/firebase-white.svg`
- Create: `solution/packages/icons/src/auth/firebase-black.svg`

- [ ] **Step 1: Fetch the new Firebase SVG from the official brand page**

Use the browser or fetch the SVG from Firebase's official resources. The new Firebase logo (2024) is available from the Firebase brand guidelines. Key colors: three overlapping circles in orange (`#FF6D00`), yellow (`#FFC400`), and red (`#DD2C00`) — or fetch from `https://www.gstatic.com/devrel-devsite/prod/v*/firebase/images/lockup.svg`.

Alternatively, look it up on Simple Icons: Simple Icons has `siFirebase`. Check if it's been updated:

```bash
cd solution/packages/icons && node -e "import('simple-icons').then(m => console.log('hex:', m.siFirebase?.hex, '\npath length:', m.siFirebase?.path?.length))"
```

If Simple Icons has the updated path (check path length and visual — old icon was a flame, new one is three arcs):

```bash
node -e "import('simple-icons').then(m => { const i = m.siFirebase; require('fs').writeFileSync('src/auth/firebase.svg', \`<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"\${i.path}\" fill=\"#\${i.hex}\"/></svg>\`) })"
```

If Simple Icons has the old icon, manually create the new Firebase SVG from official sources. The new Firebase 2024 symbol paths can be obtained from `firebase.google.com/brand-guidelines`.

- [ ] **Step 2: Create white and black variants**

```bash
cd solution/packages/icons && node -e "
import { readFileSync, writeFileSync } from 'fs'
const svg = readFileSync('src/auth/firebase.svg', 'utf8')
writeFileSync('src/auth/firebase-white.svg', svg.replace(/fill=\"[^\"]*\"/g, 'fill=\"#ffffff\"'))
writeFileSync('src/auth/firebase-black.svg', svg.replace(/fill=\"[^\"]*\"/g, 'fill=\"#141414\"'))
console.log('done')
" --input-type=module
```

- [ ] **Step 3: Build and verify**

```bash
cd solution/packages/icons && bun run build && node -e "
const j = JSON.parse(require('fs').readFileSync('lib/auth.json', 'utf8'))
console.log('firebase keys:', Object.keys(j.icons).filter(k => k.startsWith('firebase')))
"
```
Expected: `['firebase', 'firebase-white', 'firebase-black']`

- [ ] **Step 4: Commit**

```bash
cd solution && git add packages/icons/src/auth/firebase*.svg
git commit -m "feat(icons): update Firebase to 2024 brand, add white/black variants"
```

---

## Chunk 3: Wordmarks for Auth Platforms

### Task 5: Add wordmarks from official brand kits

Wordmarks are available from official brand sites. This task fetches them via browser/fetch and normalizes to `height=24`.

Platforms with official wordmark SVGs:
- **Auth0** — `auth0.com/brand-and-media`
- **Clerk** — `clerk.com/brand`
- **Appwrite** — `appwrite.io/brand`
- **Pocketbase** — `pocketbase.io` (logo from GitHub releases)
- **Supabase** — `supabase.com/brand-assets`
- **Amplify** — AWS brand guidelines
- **NextAuth/Auth.js** — `authjs.dev`

**Files:**
- Create: `solution/packages/icons/scripts/add-wordmarks.js`
- Create: one `{name}-wordmark.svg` and `{name}-wordmark-white.svg` per platform

- [ ] **Step 1: Create wordmark processing helper**

```js
// solution/packages/icons/scripts/add-wordmarks.js
import { normalizeSVG, monochromeVariant } from './normalize.js'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const OUT = resolve('src/auth')

/**
 * Write a wordmark pair (dark + white) from an SVG string.
 * @param {string} name  — icon stem (e.g. 'auth0')
 * @param {string} svg   — raw SVG content
 */
export function writeWordmarkPair(name, svg) {
  const normalized = normalizeSVG(svg, 24, null)
  // Dark version (keep original colors, assume dark text on light bg)
  writeFileSync(`${OUT}/${name}-wordmark.svg`, normalized)
  // White version
  const white = monochromeVariant(normalized, '#ffffff')
  writeFileSync(`${OUT}/${name}-wordmark-white.svg`, white)
  console.log(`Wordmark written: ${name}`)
}
```

- [ ] **Step 2: Fetch and write each wordmark**

For each platform, fetch the official wordmark SVG and call `writeWordmarkPair`. Use the MCP browser tool or direct URLs. Below are the known official SVG sources to check:

| Platform | Source URL |
|----------|-----------|
| auth0 | https://auth0.com/press (download brand kit) |
| clerk | https://clerk.com/brand (SVG download) |
| appwrite | https://appwrite.io/assets/appwrite-logo-white.svg (flip for dark) |
| supabase | https://supabase.com/brand-assets |
| amplify | AWS brand center |
| nextauth | https://authjs.dev logo |
| pocketbase | https://github.com/pocketbase/pocketbase — assets in README |

Fetch each, paste into the script:

```bash
cd solution/packages/icons && node --input-type=module -e "
import { writeWordmarkPair } from './scripts/add-wordmarks.js'

// Paste fetched SVG strings here, one per platform:
const AUTH0_SVG = \`<svg ...>...</svg>\`
writeWordmarkPair('auth0', AUTH0_SVG)
// ... repeat for each
"
```

- [ ] **Step 3: Build and verify wordmark keys exist**

```bash
cd solution/packages/icons && bun run build && node -e "
const j = JSON.parse(require('fs').readFileSync('lib/auth.json', 'utf8'))
const wordmarks = Object.keys(j.icons).filter(k => k.includes('wordmark'))
console.log('Wordmarks:', wordmarks)
"
```

- [ ] **Step 4: Commit**

```bash
cd solution && git add packages/icons/src/auth/*-wordmark*.svg packages/icons/scripts/add-wordmarks.js
git commit -m "feat(icons): add platform wordmarks (auth0, clerk, supabase, appwrite, etc.)"
```

---

## Chunk 4: Solar-Style Auth Method Icons

### Task 6: Source Solar variants for existing auth methods

Solar icon set is available as `@iconify-json/solar`. Each auth method gets 4 variants using Solar's naming:
- `bold` → our default (solid)
- `linear` → our `outline`
- `bold-duotone` → our `duotone`
- `linear-duotone` — Solar doesn't have this; use `broken` as the 4th variant OR draw duotone with strokes. Use `broken` for now, named `duotone-outline`.

Solar icon name mappings:

| Our name | Solar icon base |
|----------|----------------|
| email | `solar:envelope` |
| phone | `solar:phone` |
| password | `solar:password-minimalistic` |
| magic | `solar:magic-stick` |
| passkey | `solar:fingerprint` |
| mfa | `solar:shield-keyhole` |
| incognito | custom (see Task 7) |
| authy | brand only (no Solar variants) |

**Files:**
- Modify: `solution/packages/icons/package.json`
- Create: `solution/packages/icons/scripts/add-solar-methods.js`
- Create: 4 SVG files per auth method (email, phone, password, magic, passkey, mfa)

- [ ] **Step 1: Install @iconify-json/solar**

```bash
cd solution/packages/icons && bun add -d @iconify-json/solar
```

- [ ] **Step 2: Verify the Solar icon set has our required icons**

```bash
node -e "
const solar = require('@iconify-json/solar/icons.json')
const bases = ['envelope', 'phone', 'password-minimalistic', 'magic-stick', 'fingerprint', 'shield-keyhole']
const variants = ['-bold', '-linear', '-bold-duotone', '-broken']
for (const base of bases) {
  for (const v of variants) {
    const key = base + v
    console.log(key, key in solar.icons ? 'OK' : 'MISSING')
  }
}
"
```
Expected: all OK. If any are MISSING, find the correct Solar icon name with:
```bash
node -e "const s = require('@iconify-json/solar/icons.json'); console.log(Object.keys(s.icons).filter(k => k.includes('envelope')))"
```

- [ ] **Step 3: Create the Solar methods script**

```js
// solution/packages/icons/scripts/add-solar-methods.js
import solar from '@iconify-json/solar/icons.json' assert { type: 'json' }
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const OUT = resolve('src/auth')

// Map: our stem → Solar icon base name
const METHODS = [
  { name: 'email',    solarBase: 'envelope' },
  { name: 'phone',    solarBase: 'phone' },
  { name: 'password', solarBase: 'password-minimalistic' },
  { name: 'magic',    solarBase: 'magic-stick' },
  { name: 'passkey',  solarBase: 'fingerprint' },
  { name: 'mfa',      solarBase: 'shield-keyhole' },
]

// Solar variant suffix → our suffix
const VARIANTS = [
  { solarSuffix: '-bold',        ourSuffix: '' },          // default solid
  { solarSuffix: '-linear',      ourSuffix: '-outline' },
  { solarSuffix: '-bold-duotone',ourSuffix: '-duotone' },
  { solarSuffix: '-broken',      ourSuffix: '-duotone-outline' },
]

function iconToSVG(body, size = 24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
${body}
</svg>`
}

for (const method of METHODS) {
  for (const variant of VARIANTS) {
    const solarKey = method.solarBase + variant.solarSuffix
    const icon = solar.icons[solarKey]
    if (!icon) {
      console.warn(`MISSING: solar:${solarKey}`)
      continue
    }
    const filename = method.name + variant.ourSuffix + '.svg'
    writeFileSync(`${OUT}/${filename}`, iconToSVG(icon.body))
    console.log(`Written: ${filename}`)
  }
}
console.log('Solar auth method icons complete.')
```

- [ ] **Step 4: Run the script**

```bash
cd solution/packages/icons && node --input-type=module scripts/add-solar-methods.js
```
Expected: 24 "Written:" lines (6 methods × 4 variants), no MISSING.

- [ ] **Step 5: Verify Solar icons use `currentColor` correctly**

Solar icons use `currentColor` for strokes — check one:
```bash
head -5 src/auth/email.svg src/auth/email-outline.svg src/auth/email-duotone.svg
```

- [ ] **Step 6: Build and verify**

```bash
cd solution/packages/icons && bun run build && node -e "
const j = JSON.parse(require('fs').readFileSync('lib/auth.json', 'utf8'))
const methods = Object.keys(j.icons).filter(k => ['email','phone','password','magic','passkey','mfa'].some(m => k.startsWith(m)))
console.log(methods.sort())
"
```
Expected: all 24 keys present.

- [ ] **Step 7: Commit**

```bash
cd solution && git add packages/icons/src/auth/ packages/icons/scripts/add-solar-methods.js packages/icons/package.json
git commit -m "feat(icons): add Solar-style variants for auth method icons"
```

---

### Task 7: Create incognito icon (Solar-style, custom)

The incognito icon (hat + glasses) doesn't exist in Solar. Design a custom SVG in Solar's aesthetic — clean strokes with a fedora hat and disguise glasses. Provide all 4 variants.

**Files:**
- Create: `solution/packages/icons/src/auth/incognito.svg` (solid)
- Create: `solution/packages/icons/src/auth/incognito-outline.svg`
- Create: `solution/packages/icons/src/auth/incognito-duotone.svg`
- Create: `solution/packages/icons/src/auth/incognito-duotone-outline.svg`

Solar design principles:
- 24×24 viewBox, 1.5px stroke width for linear, bold uses filled paths
- Rounded stroke caps/joins (`stroke-linecap="round" stroke-linejoin="round"`)
- Duotone: primary element at full opacity, secondary at 30% (`opacity="0.3"` or separate fill)
- Color: use `currentColor` for single-tone, secondary at 30% opacity for duotone

- [ ] **Step 1: Create the solid (bold) incognito icon**

The design: a wide-brimmed hat (solid fill) sitting atop round glasses (two circles connected). All `currentColor`.

```svg
<!-- src/auth/incognito.svg — bold/solid style -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Hat brim -->
  <path d="M3 10C3 10 4 8 12 8C20 8 21 10 21 10H3Z" fill="currentColor"/>
  <!-- Hat crown -->
  <path d="M7 8V6C7 4.895 7.895 4 9 4H15C16.105 4 17 4.895 17 6V8H7Z" fill="currentColor"/>
  <!-- Glasses -->
  <circle cx="8.5" cy="15" r="2.5" fill="currentColor"/>
  <circle cx="15.5" cy="15" r="2.5" fill="currentColor"/>
  <path d="M11 15H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M3 15H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M18 15H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 2: Create the outline (linear) incognito icon**

Replace filled paths with stroked outlines:

```svg
<!-- src/auth/incognito-outline.svg — linear/outline style -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Hat brim -->
  <path d="M3 10C3 10 4 8 12 8C20 8 21 10 21 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Hat crown -->
  <path d="M7 8V6C7 4.895 7.895 4 9 4H15C16.105 4 17 4.895 17 6V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Glasses frame -->
  <circle cx="8.5" cy="15" r="2.5" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="15.5" cy="15" r="2.5" stroke="currentColor" stroke-width="1.5"/>
  <path d="M11 15H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M3 15H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M18 15H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 3: Create the duotone (bold-duotone) incognito icon**

Hat is full opacity, glasses have 30% opacity fill for secondary layer:

```svg
<!-- src/auth/incognito-duotone.svg — bold-duotone style -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Hat brim (secondary, 30%) -->
  <path opacity="0.3" d="M3 10C3 10 4 8 12 8C20 8 21 10 21 10H3Z" fill="currentColor"/>
  <!-- Hat crown (primary, full) -->
  <path d="M7 8V6C7 4.895 7.895 4 9 4H15C16.105 4 17 4.895 17 6V8H7Z" fill="currentColor"/>
  <!-- Glasses (secondary, 30%) -->
  <circle opacity="0.3" cx="8.5" cy="15" r="2.5" fill="currentColor"/>
  <circle opacity="0.3" cx="15.5" cy="15" r="2.5" fill="currentColor"/>
  <!-- Connectors (primary) -->
  <path d="M11 15H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M3 15H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M18 15H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 4: Create the duotone-outline incognito icon**

```svg
<!-- src/auth/incognito-duotone-outline.svg — broken/duotone-outline style -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Hat brim (secondary stroke, 30%) -->
  <path opacity="0.3" d="M3 10C3 10 4 8 12 8C20 8 21 10 21 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Hat crown (primary stroke) -->
  <path d="M7 8V6C7 4.895 7.895 4 9 4H15C16.105 4 17 4.895 17 6V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Glasses (secondary stroke, 30%) -->
  <circle opacity="0.3" cx="8.5" cy="15" r="2.5" stroke="currentColor" stroke-width="1.5"/>
  <circle opacity="0.3" cx="15.5" cy="15" r="2.5" stroke="currentColor" stroke-width="1.5"/>
  <!-- Connectors (primary) -->
  <path d="M11 15H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M3 15H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M18 15H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 5: Build and verify**

```bash
cd solution/packages/icons && bun run build && node -e "
const j = JSON.parse(require('fs').readFileSync('lib/auth.json', 'utf8'))
console.log(Object.keys(j.icons).filter(k => k.startsWith('incognito')))
"
```
Expected: `['incognito', 'incognito-duotone', 'incognito-duotone-outline', 'incognito-outline']`

- [ ] **Step 6: Commit**

```bash
cd solution && git add packages/icons/src/auth/incognito*.svg
git commit -m "feat(icons): add custom Solar-style incognito icon (4 variants)"
```

---

## Chunk 5: Final Cleanup and Verification

### Task 8: Audit and remove old duplicate icons

The Solar methods script in Task 6 overwrites existing `email.svg`, `phone.svg`, `password.svg`, `magic.svg` with Solar versions. The old files used different aesthetics. Verify the replacements are intentional and the old `authy.svg` (brand icon) remains untouched.

**Files:**
- Review: all files in `solution/packages/icons/src/auth/`

- [ ] **Step 1: List all auth SVG files and count**

```bash
ls solution/packages/icons/src/auth/*.svg | wc -l
ls solution/packages/icons/src/auth/*.svg | sort
```
Expected: ~120+ files.

- [ ] **Step 2: Verify no stale/unintended duplicates**

Check that `authy.svg` still has the brand icon (red circle with white paths), not Solar replacement:
```bash
head -3 solution/packages/icons/src/auth/authy.svg
```
Expected: original content with `#f22e46` fill.

- [ ] **Step 3: Final full build**

```bash
cd solution/packages/icons && bun run build
```
Expected: zero errors, output in `lib/auth.json` and `lib/auth/`.

- [ ] **Step 4: Verify icon count in auth.json**

```bash
node -e "
const j = JSON.parse(require('fs').readFileSync('solution/packages/icons/lib/auth.json', 'utf8'))
console.log('Total auth icons:', Object.keys(j.icons).length)
console.log('Sample keys:', Object.keys(j.icons).slice(0, 20).join(', '))
"
```

- [ ] **Step 5: Run full test suite to confirm no regressions**

```bash
cd solution && bun run test:ci
```
Expected: same pass count as before (~2536+), zero new failures.

- [ ] **Step 6: Final commit**

```bash
cd solution && git add packages/icons/
git commit -m "feat(icons): complete auth icon expansion — platforms, social, methods with variants"
```

---

## Notes for Implementer

### Simple Icons slug lookup
If a brand slug isn't found, search with:
```bash
node -e "import('simple-icons').then(m => console.log(Object.keys(m).filter(k => k.toLowerCase().includes('auth'))))"
```

### Solar icon name lookup
```bash
node -e "const s = require('@iconify-json/solar/icons.json'); console.log(Object.keys(s.icons).filter(k => k.includes('shield')))"
```

### Build command (from icons package root)
```bash
cd solution/packages/icons && bun run build
```
This runs `rokkit-cli build` which calls `bundleFolders` → reads all SVGs from `src/auth/` → exports `lib/auth.json`.

### viewBox normalization for wordmarks
For any SVG where width/height attributes are missing, add them:
```bash
node -e "
const svg = require('fs').readFileSync('path/to/wordmark.svg', 'utf8')
const vb = svg.match(/viewBox=\"0 0 ([\d.]+) ([\d.]+)\"/)
const w = parseFloat(vb[1]), h = parseFloat(vb[2])
const fw = Math.round(w/h*24)
console.log('Add: width=\"' + fw + '\" height=\"24\"')
"
```

---

## Chunk 6: Icon Browser Page in Learn Site

**Goal:** A `/playground/icons` page that visually browses all icon collections. Auth icons grouped by category (Platforms, Social, Methods) with variant families shown together. Other collections in searchable grids.

**Approach:** Import icon JSON files directly in Svelte, render bodies with `{@html}`. No UnoCSS safelist needed — SVGs are rendered inline.

### Task 9: Create icon browser playground page

**Files:**
- Create: `solution/sites/learn/src/routes/(play)/playground/icons/+page.svelte`
- Modify: `solution/sites/learn/src/routes/(play)/playground/+page.svelte` (add Icons to groups)
- Modify: `solution/sites/learn/src/routes/(play)/playground/+layout.svelte` (add to sidebar)
- Modify: `solution/sites/learn/src/routes/(learn)/docs/toolchain/icon-sets/+page.svelte` (replace stub)

- [ ] **Step 1: Create the icon browser page**

```svelte
<!-- solution/sites/learn/src/routes/(play)/playground/icons/+page.svelte -->
<script>
  // @ts-nocheck
  import authIcons from '@rokkit/icons/auth.json'
  import appIcons from '@rokkit/icons/app.json'
  import componentIcons from '@rokkit/icons/components.json'
  import baseIcons from '@rokkit/icons/ui.json'
  import solidIcons from '@rokkit/icons/solid.json'
  import lightIcons from '@rokkit/icons/light.json'

  // ── Auth grouping ────────────────────────────────────────────────────────
  const AUTH_CATEGORIES = {
    'Auth Platforms': ['supabase', 'firebase', 'convex', 'auth0', 'amplify', 'cognito',
      'clerk', 'okta', 'keycloak', 'nextauth', 'pocketbase', 'appwrite', 'azure', 'microsoft'],
    'Social Auth': ['google', 'github', 'apple', 'twitter', 'facebook'],
    'Auth Methods': ['email', 'phone', 'password', 'magic', 'incognito', 'authy', 'passkey', 'mfa']
  }

  // Order variants for display
  const VARIANT_ORDER = ['', '-white', '-black', '-outline', '-duotone', '-duotone-outline',
    '-logo', '-logo-white', '-logo-black', '-wordmark', '-wordmark-white']

  function getAuthFamilies(category, icons) {
    return category.map((base) => {
      const variants = VARIANT_ORDER
        .map((suffix) => ({ suffix, key: base + suffix, icon: icons[base + suffix] }))
        .filter((v) => v.icon)
      return { base, variants }
    }).filter((f) => f.variants.length > 0)
  }

  // ── Generic icon list ────────────────────────────────────────────────────
  function iconList(collection) {
    return Object.entries(collection.icons).map(([name, icon]) => ({ name, icon }))
  }

  // ── Clipboard ────────────────────────────────────────────────────────────
  const prefixMap = {
    auth: 'logo', app: 'app', component: 'component',
    base: 'base', solid: 'solid', light: 'light'
  }

  let copied = $state(null)

  function copyName(prefix, name) {
    const cls = `i-${prefix}:${name}`
    navigator.clipboard.writeText(cls)
    copied = cls
    setTimeout(() => { copied = null }, 1500)
  }

  // ── Tabs ────────────────────────────────────────────────────────────────
  const TABS = ['Auth', 'App', 'Components', 'Base', 'Solid', 'Light']
  let activeTab = $state('Auth')

  // ── Search ───────────────────────────────────────────────────────────────
  let search = $state('')

  function filtered(list) {
    if (!search) return list
    return list.filter((i) => i.name.includes(search.toLowerCase()))
  }

  // ── SVG rendering ────────────────────────────────────────────────────────
  function iconSVG(icon, collection, size = 24) {
    const w = icon.width ?? collection.width ?? 24
    const h = icon.height ?? collection.height ?? 24
    return `<svg width="${size}" height="${Math.round(size * h / w)}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg">${icon.body}</svg>`
  }

  const COLLECTIONS = {
    Auth: { collection: authIcons, prefix: 'logo' },
    App: { collection: appIcons, prefix: 'app' },
    Components: { collection: componentIcons, prefix: 'component' },
    Base: { collection: baseIcons, prefix: 'base' },
    Solid: { collection: solidIcons, prefix: 'solid' },
    Light: { collection: lightIcons, prefix: 'light' },
  }
</script>

<div class="p-6 space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-semibold text-surface-z8">Icon Browser</h1>
      <p class="text-sm text-surface-z5 mt-0.5">Click any icon to copy its class name</p>
    </div>
    {#if copied}
      <div class="text-xs bg-success-z3 text-success-z8 px-3 py-1.5 rounded-md font-mono">
        Copied: {copied}
      </div>
    {/if}
  </div>

  <!-- Tabs -->
  <div class="flex gap-1 border-b border-surface-z3">
    {#each TABS as tab (tab)}
      <button
        class="px-4 py-2 text-sm font-medium rounded-t-md transition-colors
          {activeTab === tab
            ? 'bg-surface-z2 text-surface-z8 border border-b-0 border-surface-z3'
            : 'text-surface-z5 hover:text-surface-z7'}"
        onclick={() => { activeTab = tab; search = '' }}
      >
        {tab}
      </button>
    {/each}
  </div>

  <!-- Auth tab: grouped by category with variant families -->
  {#if activeTab === 'Auth'}
    {#each Object.entries(AUTH_CATEGORIES) as [category, bases] (category)}
      {@const families = getAuthFamilies(bases, authIcons.icons)}
      {#if families.length}
        <section>
          <h2 class="text-sm font-semibold text-surface-z6 uppercase tracking-wide mb-3">{category}</h2>
          <div class="space-y-2">
            {#each families as family (family.base)}
              <div class="flex items-center gap-1 flex-wrap">
                <span class="text-xs text-surface-z4 w-28 shrink-0 font-mono">{family.base}</span>
                {#each family.variants as v (v.key)}
                  <button
                    class="group relative flex items-center justify-center w-10 h-10 rounded-md
                      bg-surface-z2 hover:bg-surface-z3 border border-transparent
                      hover:border-surface-z4 transition-colors"
                    title="{v.key}"
                    onclick={() => copyName('logo', v.key)}
                  >
                    {@html iconSVG(v.icon, authIcons)}
                    <span class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-surface-z4
                      whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {v.suffix || 'default'}
                    </span>
                  </button>
                {/each}
              </div>
            {/each}
          </div>
        </section>
      {/if}
    {/each}

  <!-- Other tabs: searchable flat grid -->
  {:else}
    {@const { collection, prefix } = COLLECTIONS[activeTab]}
    {@const icons = filtered(iconList(collection))}
    <div class="flex items-center gap-3 mb-4">
      <input
        bind:value={search}
        placeholder="Search icons..."
        class="w-64 px-3 py-1.5 text-sm rounded-md bg-surface-z2 border border-surface-z3
          text-surface-z8 placeholder:text-surface-z4 focus:outline-none focus:border-primary-z5"
      />
      <span class="text-xs text-surface-z4">{icons.length} icons</span>
    </div>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
      {#each icons as { name, icon } (name)}
        <button
          class="flex flex-col items-center gap-1.5 p-2 rounded-md bg-surface-z2
            hover:bg-surface-z3 border border-transparent hover:border-surface-z4
            transition-colors group"
          title="i-{prefix}:{name}"
          onclick={() => copyName(prefix, name)}
        >
          <div class="flex items-center justify-center w-8 h-8">
            {@html iconSVG(icon, collection)}
          </div>
          <span class="text-[10px] text-surface-z5 group-hover:text-surface-z7 text-center
            leading-tight break-all line-clamp-2 font-mono">
            {name}
          </span>
        </button>
      {/each}
    </div>
  {/if}
</div>
```

- [ ] **Step 2: Add Icons entry to playground sidebar (layout)**

In `solution/sites/learn/src/routes/(play)/playground/+layout.svelte`, find the `sections` array and add an Icons entry. Add it as a top-level item (not nested in a group):

```js
// Add to sections array, before the Effects group:
{
  title: 'Icons',
  slug: '/playground/icons',
  icon: 'i-solar:stars-bold-duotone'
},
```

Note: The sidebar uses the `sections` array with nested `children`. For Icons, add it as a standalone entry at the top level of sections. The List component renders it with `href: 'slug'` field mapping.

- [ ] **Step 3: Add Icons to playground index page**

In `solution/sites/learn/src/routes/(play)/playground/+page.svelte`, add a new group for Design Resources:

```js
{
  title: 'Design Resources',
  icon: 'i-solar:stars-bold-duotone',
  basePath: '/playground/',
  components: [
    { name: 'Icons', description: 'Browse all icon collections and auth icon variants', slug: 'icons' }
  ]
}
```

- [ ] **Step 4: Update the toolchain icon-sets stub page**

Replace the "Coming soon" content in `solution/sites/learn/src/routes/(learn)/docs/toolchain/icon-sets/+page.svelte`:

```svelte
<article data-article-root>
  <p class="text-[1.0625rem] leading-7 text-surface-z6 mb-8">
    Rokkit ships curated icon sets for navigation, status, actions, and auth providers.
    All sets are in Iconify JSON format and integrate with UnoCSS via <code>presetRokkit</code>.
  </p>

  <h2>Available Collections</h2>
  <table>
    <thead>
      <tr><th>Collection</th><th>UnoCSS prefix</th><th>Contents</th></tr>
    </thead>
    <tbody>
      <tr><td><code>@rokkit/icons/auth.json</code></td><td><code>i-logo:</code></td><td>Auth platforms, social providers, auth methods with variants</td></tr>
      <tr><td><code>@rokkit/icons/app.json</code></td><td><code>i-app:</code></td><td>Application-level icons (navigation, actions)</td></tr>
      <tr><td><code>@rokkit/icons/components.json</code></td><td><code>i-component:</code></td><td>Component-specific icons</td></tr>
      <tr><td><code>@rokkit/icons/ui.json</code></td><td><code>i-base:</code></td><td>Base UI icons</td></tr>
      <tr><td><code>@rokkit/icons/solid.json</code></td><td><code>i-solid:</code></td><td>Solid fill variants</td></tr>
      <tr><td><code>@rokkit/icons/light.json</code></td><td><code>i-light:</code></td><td>Light stroke variants</td></tr>
    </tbody>
  </table>

  <h2>Configuration</h2>
  <p>Register collections in <code>rokkit.config.js</code>:</p>
  <pre><code>icons: {{'{'}}
  logo: '@rokkit/icons/auth.json',
  app:  '@rokkit/icons/app.json',
  component: '@rokkit/icons/components.json',
{{'}'}}</code></pre>

  <h2>Browse Icons</h2>
  <p>
    Use the <a href="/playground/icons">Icon Browser playground</a> to visually explore all
    collections, see auth icon variants grouped by category, and copy icon class names.
  </p>
</article>
```

- [ ] **Step 5: Build and check the page loads**

```bash
cd solution/sites/learn && npx vite build --mode development 2>&1 | tail -20
```
Or start dev server and navigate to `/playground/icons`.

- [ ] **Step 6: Commit**

```bash
cd solution && git add sites/learn/src/routes/\(play\)/playground/icons/ \
  sites/learn/src/routes/\(play\)/playground/+page.svelte \
  sites/learn/src/routes/\(play\)/playground/+layout.svelte \
  sites/learn/src/routes/\(learn\)/docs/toolchain/icon-sets/+page.svelte
git commit -m "feat(learn): add icon browser playground page with grouped auth icons"
```

---

## Notes for Chunk 6

### Auth icon prefix
Auth icons in `rokkit.config.js` are registered as `logo:` → use `i-logo:github`, `i-logo:supabase`, etc.

### Rendering inline SVG from iconify JSON
```svelte
{@html `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${icon.body}</svg>`}
```
The `body` field contains inner SVG elements (paths, groups) — wrap in `<svg>` to render.

### The sidebar List in playground layout
The `sections` array has items with `{ title, slug, icon, children? }`. Top-level items without children render as direct links. Add Icons as a peer of the group headings.
