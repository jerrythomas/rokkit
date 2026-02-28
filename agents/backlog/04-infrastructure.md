# Backlog: Infrastructure & Technical Debt

Priority 4 — Code quality, dependency cleanup, migration.

---

## ~~65. Remove rk-* Custom Element Tags~~ ✅ DONE

**Problem:** Early design used `<rk-item>`, `<rk-icon>`, `<rk-accordion>`, etc. as custom HTML elements. Project convention is `data-*` attributes on standard HTML elements — no custom tags.

**Fixed (2026-02-25):**
- Deleted `sites/learn/src/routes/DropDown.svelte` (unreferenced stale component using `<rk-item>`)
- `packages/actions/spec/navigator.spec.svelte.js` — replaced `<rk-icon>` fixtures with `<span data-icon>`
- `sites/learn/src/routes/docs/components/*/llms.txt/+server.ts` — updated 5 files: accordion, range, checkbox, progress-bar, rating; replaced `<rk-*>` structure descriptions with `[data-*]` attribute notation
- Documented `data-*` attribute convention in `agents/design-patterns.md`

---

## 23. Project-Wide Ramda Removal

**Affected packages:** core, states, actions, data, forms, chart, helpers

**What's needed:**

- [ ] Replace `isNil(v)` → `v == null`
- [ ] Replace `pick`/`omit` → native `Object.fromEntries` + `Object.entries` with filter
- [ ] Replace `pipe`, `map`, `filter` with native equivalents
- [ ] Remove ramda from all package.json files
Q: In order to remove ramda dependency, wouldn't it be easier to just create a replacement function under core/utils. code remains same but uses native equivaluents. 

**Priority:** Low — no functional impact, reduces bundle size.

---

## 24. @rokkit/helpers — Under-Exported Utilities

**Source:** docs/llms/ analysis

**What's needed:**
- [ ] Audit exports vs internal utilities
- [ ] Export useful utilities that are currently internal-only

---

## ~~25. @rokkit/chart — Dead bits-ui Dependency~~ ✅ DONE

bits-ui already removed from chart during ADR-003 archive cleanup. No bits-ui imports in any @rokkit package.

---

## ~~58. Svelte 4 → 5 Migration — Remaining Files~~ ✅ DONE

All Svelte 4 patterns (`export let`, `$:`, `createEventDispatcher`, `$$restProps`) removed from codebase. Archive deleted. Forms legacy components deleted (#8). No `export let` in any `.svelte` file.

## 60. Palette Switching System (`data-palette`)

**What:** Replace the current `@apply skin-default` at `:root` in `palette.css` with a `data-palette` attribute-driven skin system, consistent with `data-mode` and `data-style` patterns.

**Design:** See `docs/design/030-theme.md` — Skin System section.

**Changes required:**

- [ ] `@rokkit/core/src/skins.js` — new file: export `predefinedSkins` map + `defaultSkin = 'skin-vibrant-orange'`
- [ ] `@rokkit/core/src/index.js` — export `predefinedSkins`, `defaultSkin`
- [ ] `@rokkit/themes/src/palette.css` — replace `:root { @apply skin-default }` with `[data-palette="skin-*"]` scoped rules + `:root:not([data-palette])` fallback
- [ ] `sites/playground/uno.config.ts` — generate shortcuts from `predefinedSkins` (replace manual skin-default/vibrant/seaweed)
- [ ] `sites/learn/uno.config.js` — same
- [ ] `sites/playground/src/lib/palette.svelte.ts` — new: mirrors `mode.svelte.ts`, sets `data-palette` on `<html>`
- [ ] `sites/playground/src/routes/+layout.svelte` — add `initPalette()` to `onMount`, remove `class="skin-default"` from wrapper, add palette picker to header

**Priority:** Medium — unblocks playground palette switching demo, also fixes consumer-facing skin architecture.

---

## 66. @rokkit/themes — CSS Variables Migration (Remove @apply dependency)

**Problem:** All theme CSS files use UnoCSS `@apply` directives (e.g. `@apply border-surface-z3 rounded-lg border`). This means:
1. Consumers MUST set up UnoCSS with Rokkit presets to get any visual styles
2. If a consumer imports only a theme variant (e.g. `@rokkit/themes/rokkit`) without the base, structural styles are missing
3. Pre-processing in the package itself is impossible without a build step

**Short-term fix (consumer workaround):**
Import both base and theme variant in the consumer app:
```css
@import '@rokkit/themes/base';   /* structural layout */
@import '@rokkit/themes/rokkit'; /* visual styles */
/* or simply: @import '@rokkit/themes'; */
```

**Long-term solution — rewrite to CSS custom properties:**

Replace all `@apply` directives with native CSS using Rokkit's CSS custom property tokens (already defined by `skin-*` palette). Example:

```css
/* Before (requires UnoCSS) */
[data-style='rokkit'] [data-toggle] {
  @apply from-surface-z3 to-surface-z2 border-surface-z4 rounded-lg border bg-gradient-to-b;
}

/* After (plain CSS, works anywhere) */
[data-style='rokkit'] [data-toggle] {
  background: linear-gradient(to bottom, var(--surface-z3), var(--surface-z2));
  border: 1px solid var(--surface-z4);
  border-radius: 0.5rem;
}
```

**Scope:** All CSS files under `packages/themes/src/` (base + rokkit + minimal + material + glass variants). ~30 files.

**Benefits:**
- Zero UnoCSS dependency for theme consumption
- Can ship pre-compiled CSS that works in any project
- Themes can be loaded via a plain `<link>` tag

**Priority:** Medium — eliminates the biggest consumer onboarding friction.

---

## Release.

We need a pre release script that copies LICENCE from root and post release script that removes it for each package.
