---
name: skin-system-rokkit
description: Use when switching color skins (which palette backs paper/ink/primary/accent) in a Rokkit (Svelte 5) app — the vibe.skin state, the data-skin mechanism, themable sync, defining skins in rokkit.config.js (skins:), built-in skins, SkinSwitcherToggle, and the skinnable action for dynamic/runtime skins.
---

# Rokkit Skin System

A **skin** is a named colormap — it selects which palette fills each semantic role
(`surface`, `ink`, `primary`, `accent`, …). Swapping the skin changes the entire palette
backing `--paper`, `--ink`, `--primary`, `--accent`, and all their derivatives. Named tokens
(`bg-paper`, `text-ink`, `bg-primary`) keep working unchanged; only the palette under them
shifts.

**Skin vs style vs mode:**

| Dimension | Controls | Example values |
|-----------|----------|----------------|
| **skin** | which palette backs the roles | `default` · `ocean` · `violet` |
| **style** | which visual theme (border radius, shadow, surface recipe) | `rokkit` · `minimal` · `zen-sumi` |
| **mode** | light or dark rendering | `light` · `dark` |

These three are orthogonal — a skin switch does not change the style or mode.

---

## Defining skins

Declare named skins in `rokkit.config.js` under `skins:`. Each key is a skin name; each
value maps role names to palette names. **Use `skins:` OR `skin:`, not both** — `skins:`
wins when both are present.

```js
// rokkit.config.js
export default {
  skins: {
    default: {
      surface: { light: 'kami', dark: 'sumi' },  // dual-palette → emits dark block
      ink:     { light: 'kami', dark: 'sumi' },
      primary: 'shu',
      accent:  'shu',
      success: 'hisui', warning: 'kohaku', danger: 'shu', error: 'shu', info: 'kohaku',
    },
    ocean:   { surface: 'slate', ink: 'slate', primary: 'sky',     accent: 'teal'   },
    violet:  { surface: 'zinc',  ink: 'zinc',  primary: 'violet',  accent: 'indigo' },
    rose:    { surface: 'stone', ink: 'stone', primary: 'rose',    accent: 'orange' },
    emerald: { surface: 'slate', ink: 'slate', primary: 'emerald', accent: 'cyan'   },
  },
  // ... palettes, colorSpace, tokens, etc.
}
```

**Dual-palette roles** (`{ light, dark }`) tell the preset to emit both a light block and a
`[data-mode='dark']` override block. Single-palette roles (e.g. `primary: 'shu'`) stay
constant across modes — correct for brand accents.

### Built-in skins (available out of the box)

The preset ships five built-in skins in `@rokkit/unocss`. Their `[data-skin='name']` CSS
blocks are emitted automatically — no config needed to use them:

| Skin | Surface | Primary | Accent |
|------|---------|---------|--------|
| `default` | (DEFAULT_THEME_MAPPING) | — | — |
| `ocean` | `slate` | `sky` | `teal` |
| `violet` | `zinc` | `violet` | `indigo` |
| `rose` | `stone` | `rose` | `orange` |
| `emerald` | `slate` | `emerald` | `cyan` |

Consumer `skins:` in `rokkit.config.js` merge on top and can override or extend these.

---

## Switching at runtime

Three moving parts: **`vibe.skin`** (reactive state), **`themable`** (writes `data-skin` to
DOM), **`SkinSwitcherToggle`** (ready-made control).

### 1. Wire once in the root layout

Set `vibe.allowedSkins` **before** `themable` runs — persisted skin can only restore if the
value is already in the allowed list when `themable` calls `theme.load(storageKey)`.

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { vibe } from '@rokkit/states'
  import { themable } from '@rokkit/actions'

  // MUST be set before themable so a persisted skin restores correctly.
  vibe.allowedSkins = ['default', 'ocean', 'violet', 'rose', 'emerald']
</script>

<svelte:body use:themable={{ theme: vibe, storageKey: 'app-theme' }} />
```

`themable` writes `data-skin={vibe.skin}` on `<body>` (and mirrors to `<html>`) reactively.
When `storageKey` is provided it also loads/saves the persisted skin.

### 2. Drop in the toggle

```svelte
<script>
  import { SkinSwitcherToggle } from '@rokkit/app'
</script>

<!-- Reads vibe.allowedSkins by default -->
<SkinSwitcherToggle />

<!-- Or pass an explicit list (same names as skins: in config) -->
<SkinSwitcherToggle skins={['default', 'ocean', 'violet', 'rose', 'emerald']} />

<!-- With labels -->
<SkinSwitcherToggle
  skins={[
    { name: 'default', label: 'Zen Sumi' },
    { name: 'ocean',   label: 'Ocean' },
    { name: 'violet',  label: 'Violet' },
  ]}
  showLabels
  size="md"
/>
```

**`SkinSwitcherToggle` props:**

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `skins` | `Array<string \| { name, label?, icon? }>` | `vibe.allowedSkins` | skin options |
| `labels` | `Record<string, string>` | `{}` | display labels keyed by name |
| `showLabels` | `boolean` | `false` | show label text in the toggle |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | control size |
| `disabled` | `boolean` | `false` | disable the control |
| `onchange` | `(skin: string) => void` | — | callback after switching |

The component sets `vibe.skin` directly — no extra wiring needed.

### 3. Switch programmatically

```svelte
<button onclick={() => (vibe.skin = 'ocean')}>Ocean</button>
```

`vibe.skin`'s setter validates against `vibe.allowedSkins` — the assignment is a no-op if
the skin name is not in the allowed list.

---

## How the CSS works

The UnoCSS preset emits one CSS block per skin:

```css
/* default skin on :root — always active as fallback */
:root {
  --paper: oklch(0.985 0.005 85);
  --ink:   oklch(0.220 0.012 50);
  --primary: oklch(0.580 0.150 35);
  /* ... all named tokens ... */
}

/* named skin blocks — activated by data-skin attribute */
[data-skin='ocean'] {
  --paper: /* slate.50 */;
  --ink:   /* slate.900 */;
  --primary: /* sky.500 */;
  /* ... */
}

/* dark mode override for dual-palette skins */
[data-mode='dark'][data-skin='ocean'],
[data-mode='dark'] [data-skin='ocean'] {
  --paper: /* slate.950 (inverted) */;
  --ink:   /* slate.50 (inverted) */;
}
```

`themable` keeps `data-skin` on `<body>` (and `<html>`) in sync with `vibe.skin`. CSS
specificity does the rest — no JavaScript skin loops, no `classList` juggling.

**The old `skin-{name}` class is removed.** Do not use `class="skin-ocean"` — it no longer
exists. `data-skin='ocean'` is the only mechanism.

---

## Dynamic / custom skins (skinnable)

For skins that are not pre-baked in config (server-configured palettes, user-customized
color pickers, multi-tenant theming), use the `skinnable` action from `@rokkit/actions`.
It applies CSS custom properties inline on a specific element, scoped to that element's
subtree.

```svelte
<script>
  import { skinnable } from '@rokkit/actions'

  // varMap: CSS var name → complete color value
  const brandVars = {
    '--primary': 'oklch(0.60 0.18 260)',
    '--accent':  'oklch(0.55 0.15 200)',
    '--paper':   'oklch(0.97 0.005 260)',
    '--ink':     'oklch(0.22 0.010 260)',
  }
</script>

<div use:skinnable={brandVars}>
  <!-- descendants resolve CSS vars from inline styles -->
</div>
```

`skinnable` is complementary to the `data-skin` cascade, not a replacement. Use
`vibe.skin` + `themable` for app-wide named skins; use `skinnable` for scoped or
runtime-only color overrides.

---

## Common mistakes

| Mistake | Why it fails | Fix |
|---------|-------------|-----|
| `vibe.allowedSkins` set after `themable` runs | persisted skin can't restore; `vibe.skin = storedValue` is a no-op because the list defaults to `['default']` only | set `vibe.allowedSkins` before `<svelte:body use:themable ...>` in the root layout |
| `class="skin-ocean"` on an element | `skin-{name}` class was removed | use `data-skin='ocean'` attribute, or let `themable` write it via `vibe.skin` |
| Hand-rolling `<style>` injection for a skin | brittle, order-dependent, bypasses named-token aliases | define in `rokkit.config.js` `skins:` + let the preset emit `[data-skin='name']` blocks |
| `vibe.skin = 'ocean'` with no `allowedSkins` set | setter rejects unknown values | set `vibe.allowedSkins = ['default', 'ocean', ...]` first |
| `skins:` and `skin:` both in config | `skins:` silently wins; `skin:` is ignored | pick one |
| Single-palette `surface` in a skin (`surface: 'slate'`) expecting dark-mode flip | no `[data-mode='dark']` block is emitted for single-palette roles | use dual-palette `surface: { light: 'kami', dark: 'sumi' }` for dark support |
