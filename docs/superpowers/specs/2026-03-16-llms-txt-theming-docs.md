# Rokkit llms.txt — Theming & UnoCSS Utility Class Documentation

**Backlog item filed:** 2026-03-16
**Source:** Observed while building the sensei dashboard — LLMs consistently fall back to CSS variables in `<style>` blocks instead of using the correct UnoCSS utility classes, because the llms.txt has no documentation on the utility class system.

---

## Problem

The current `llms.txt` (at `https://rokkit.vercel.app/llms/index.txt`) has a single paragraph on theming:

```html
<html data-theme="rokkit" data-mode="dark">
```

This is **incorrect** (`data-theme` doesn't exist — it should be `data-style`) and severely incomplete. It gives no guidance on the UnoCSS utility class system, so LLMs authoring Rokkit-styled pages default to raw CSS variables in `<style>` blocks, which:

- Are not theme-aware (don't respond to `data-mode` switching)
- Are fragile (require knowing exact variable names)
- Contradict the intended utility-class authoring model

---

## What Needs to Be Added to llms.txt

### 1. Correct data attribute setup

```html
<body
  data-style="rokkit"       <!-- visual personality: rokkit | material | minimal -->
  data-mode="dark"          <!-- light | dark -->
  data-density="comfortable" <!-- compact | default | comfortable -->
>
```

Note: `data-palette` controls the color skin (e.g. `skin-vibrant-orange`, `skin-sea-green`). The `vibe` store and `themable` action from `@rokkit/actions` / `@rokkit/states` manage this reactively.

---

### 2. UnoCSS utility classes — the primary authoring model

When building pages alongside Rokkit components, use UnoCSS utility classes that map to the z-indexed token system. **Do not use CSS variables directly in `<style>` blocks.**

```svelte
<!-- ✅ Correct: utility classes, theme-aware, responds to data-mode switching -->
<div class="bg-surface-z1 border border-surface-z3 text-surface-z8 rounded-lg p-4">
  <h2 class="text-primary-z6 font-semibold">Title</h2>
  <p class="text-surface-z5 text-sm">Subtitle</p>
</div>

<!-- ❌ Wrong: CSS variables in style blocks, not theme-aware -->
<div style="background: var(--color-surface-z1)">...</div>
```

---

### 3. Z-index color scale

Each semantic color role (`surface`, `primary`, `secondary`, `accent`, `success`, `warning`, `error`, `info`) has 10 z-levels. The z-number maps to different concrete shades in light vs dark mode:

| Level | Light      | Dark       | Semantic use               |
|-------|-----------|-----------|----------------------------|
| `z1`  | shade-50  | shade-950 | Page background            |
| `z2`  | shade-100 | shade-900 | Card / panel background    |
| `z3`  | shade-200 | shade-800 | Subtle borders, dividers   |
| `z4`  | shade-300 | shade-700 | Input backgrounds          |
| `z5`  | shade-500 | shade-600 | Muted text, placeholders   |
| `z6`  | shade-600 | shade-500 | Interactive / link color   |
| `z7`  | shade-700 | shade-300 | Secondary text             |
| `z8`  | shade-800 | shade-200 | Body text                  |
| `z9`  | shade-900 | shade-100 | Primary text               |
| `z10` | shade-950 | shade-50  | Maximum contrast           |

Utility class pattern: `{prefix}-{role}-z{n}`

| Prefix    | Example                | Use                       |
|-----------|------------------------|---------------------------|
| `bg-`     | `bg-surface-z1`        | Background color          |
| `text-`   | `text-surface-z8`      | Text color                |
| `border-` | `border-surface-z3`    | Border color              |

---

### 4. Common patterns

```svelte
<!-- Page background -->
<div class="bg-surface-z1 text-surface-z8">

<!-- Card -->
<div class="bg-surface-z1 border border-surface-z3 rounded-lg p-4">

<!-- Section header -->
<h2 class="text-xs font-semibold text-surface-z5 uppercase tracking-wider">

<!-- Primary action / link -->
<a class="text-primary-z6 hover:text-primary-z7 transition-colors">

<!-- Muted / secondary text -->
<span class="text-surface-z5 text-sm">

<!-- Input field -->
<input class="bg-surface-z2 border border-surface-z3 text-surface-z8 focus:border-primary-z5 focus:outline-none rounded px-3 py-2">

<!-- Status: warning -->
<span class="text-warning-z6">Stale</span>

<!-- Status: success -->
<span class="text-success-z6">Fresh</span>

<!-- Status: error -->
<span class="text-error-z6">Missing</span>

<!-- Hover state on a card -->
<a class="... hover:border-primary-z5 hover:bg-surface-z2 transition-colors">

<!-- Table row separator -->
<tr class="border-b border-surface-z2 last:border-b-0">
  <td class="px-4 py-2.5 text-surface-z7">...</td>
</tr>
```

---

### 5. When inline styles are acceptable

Only use inline `style=` for values that are **dynamically computed in JavaScript** and cannot be expressed as static utility classes:

```svelte
<!-- ✅ OK: color is computed from a hash of lib.name, can't be a static class -->
<div class="w-10 h-10 rounded-lg flex items-center justify-center"
     style="background: {color}22; color: {color}">

<!-- ❌ Not OK: static value that should be a utility class -->
<div style="background: var(--color-surface-z1)">
```

---

## Fix Required in llms.txt Source

The `## Themes` section currently reads:

```html
<html data-theme="rokkit" data-mode="dark">

Available themes: `rokkit` | `minimal` | `material`
```

**`data-theme` does not exist.** The correct attribute is `data-style`. This should be fixed in the learn site source that generates the llms.txt file.

---

## Suggested llms.txt Section to Add

Add a new `## Theming & Utility Classes` section to `llms/index.txt` that covers points 1–4 above (~60 lines). This section would immediately resolve the CSS-variable fallback problem for any LLM using the Rokkit docs.
