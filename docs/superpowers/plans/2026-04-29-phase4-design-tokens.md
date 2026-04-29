# Phase 4: Design Token System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend @rokkit/core, @rokkit/themes, and @rokkit/unocss to support the new design token architecture (tertiary color, roundedness axis, layout tokens, gradient border, literal icons), then wire into the demo app to prove they work.

**Architecture:** Add `tertiary` to the semantic color system with nullable fallback resolution. Decouple border-radius from density into a standalone axis (`data-radius`). Add layout tokens for app-level spacing. Add literal icon rendering alongside CSS-class icons. Wire all tokens into the demo app by replacing hardcoded values.

**Tech Stack:** Svelte 5, UnoCSS, CSS custom properties, Vitest

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `packages/core/src/constants.js` | Modify | Add `tertiary` to `DEFAULT_THEME_MAPPING` and `defaultPalette` |
| `packages/core/src/colors/index.ts` | Modify | Add `tertiary` to `defaultPalette` array |
| `packages/core/src/theme.ts` | Modify | Add `resolveColors()`, update `Theme` constructor |
| `packages/core/spec/theme.spec.js` | Modify | Tests for nullable resolution and tertiary |
| `packages/themes/src/base/radius.css` | Create | Roundedness axis CSS (`data-radius` attribute) |
| `packages/themes/src/base/density.css` | Modify | Remove hardcoded radius fallbacks, reference `--radius-*` |
| `packages/themes/src/base/layout.css` | Create | Layout tokens (sidebar width, content max, gaps) |
| `packages/themes/src/base/gradient-border.css` | Create | Gradient border wrapper structural CSS |
| `packages/themes/src/base/index.css` | Modify | Import new CSS files |
| `packages/themes/src/base/item.css` | Modify | Add `[data-item-icon-literal]` styles |
| `packages/unocss/src/config.js` | Modify | Add `tertiary` to `DEFAULT_CONFIG.colors` |
| `packages/unocss/src/preset.ts` | Modify | Generate tertiary shortcuts, radius preflight via `data-radius` |
| `packages/core/src/utils.js` | Modify | Add `isIconClass()` utility |
| `packages/ui/src/components/ItemContent.svelte` | Modify | Literal icon rendering |
| `demo/src/app.css` | Modify | Replace hardcoded radius/spacing with layout tokens |
| `demo/src/routes/(app)/+layout.svelte` | Modify | Replace hardcoded 240px/64px with layout tokens |
| `demo/rokkit.config.js` | Modify | Add `tertiary` color, `shape.radius` preset |

---

### Task 1: Add `tertiary` to Semantic Color System

**Files:**
- Modify: `packages/core/src/constants.js:155-165`
- Modify: `packages/core/src/colors/index.ts:9-18`
- Modify: `packages/unocss/src/config.js:5-14`
- Test: `packages/core/spec/theme.spec.js`

- [ ] **Step 1: Write failing test — tertiary exists in DEFAULT_THEME_MAPPING**

Add to `packages/core/spec/theme.spec.js` at the top of the `Theme class` describe block:

```javascript
it('should include tertiary in default mapping', () => {
  const theme = new Theme()
  expect(theme.mapping).toHaveProperty('tertiary')
})

it('should generate tertiary palette rules', () => {
  const theme = new Theme()
  const palette = theme.getPalette()
  expect(palette).toHaveProperty('--color-tertiary')
  expect(palette).toHaveProperty('--color-tertiary-500')
})

it('should generate tertiary semantic shortcuts', () => {
  const theme = new Theme()
  const shortcuts = theme.getShortcuts('tertiary')
  expect(shortcuts.length).toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/core && bun run test -- --run spec/theme.spec.js`
Expected: FAIL — `tertiary` not in mapping

- [ ] **Step 3: Add `tertiary` to constants and color index**

In `packages/core/src/constants.js`, add `tertiary` to `DEFAULT_THEME_MAPPING`:

```javascript
export const DEFAULT_THEME_MAPPING = {
  surface: 'slate',
  primary: 'orange',
  secondary: 'pink',
  tertiary: 'violet',
  accent: 'sky',
  success: 'green',
  warning: 'yellow',
  danger: 'red',
  error: 'red',
  info: 'cyan'
}
```

In `packages/core/src/colors/index.ts`, add `tertiary` to `defaultPalette`:

```typescript
export const defaultPalette = [
  'surface',
  'primary',
  'secondary',
  'tertiary',
  'accent',
  'success',
  'warning',
  'danger',
  'info'
]
```

In `packages/unocss/src/config.js`, add `tertiary` to `DEFAULT_CONFIG.colors`:

```javascript
colors: {
  primary: DEFAULT_THEME_MAPPING.primary,
  secondary: DEFAULT_THEME_MAPPING.secondary,
  tertiary: DEFAULT_THEME_MAPPING.tertiary,
  accent: DEFAULT_THEME_MAPPING.accent,
  surface: DEFAULT_THEME_MAPPING.surface,
  success: DEFAULT_THEME_MAPPING.success,
  warning: DEFAULT_THEME_MAPPING.warning,
  danger: DEFAULT_THEME_MAPPING.danger,
  error: DEFAULT_THEME_MAPPING.error,
  info: DEFAULT_THEME_MAPPING.info
},
```

- [ ] **Step 4: Update `themeRules` test fixture**

The existing `themeRules` test in `packages/core/spec/theme.spec.js` uses a hardcoded `paletteRules` object. Adding `tertiary` to `DEFAULT_THEME_MAPPING` means the output now includes `--color-tertiary-*` keys. Add the violet (tertiary) entries to the `paletteRules` object:

```javascript
'--color-tertiary': '167,139,250',
'--color-tertiary-50': '245,243,255',
'--color-tertiary-100': '237,233,254',
'--color-tertiary-200': '221,214,254',
'--color-tertiary-300': '196,181,253',
'--color-tertiary-400': '167,139,250',
'--color-tertiary-500': '139,92,246',
'--color-tertiary-600': '124,58,237',
'--color-tertiary-700': '109,40,217',
'--color-tertiary-800': '91,33,182',
'--color-tertiary-900': '76,29,149',
'--color-tertiary-950': '46,16,101',
```

Insert these entries (alphabetically) into the `paletteRules` constant, after the `--color-surface-*` block and before `--color-warning-*`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/core && bun run test -- --run spec/theme.spec.js`
Expected: All PASS

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/constants.js packages/core/src/colors/index.ts packages/unocss/src/config.js packages/core/spec/theme.spec.js
git commit -m "feat(core): add tertiary to semantic color system"
```

---

### Task 2: Nullable Color Resolution

**Files:**
- Modify: `packages/core/src/theme.ts:164-177`
- Test: `packages/core/spec/theme.spec.js`

- [ ] **Step 1: Write failing tests — nullable resolution chain**

Add to `packages/core/spec/theme.spec.js`:

```javascript
describe('resolveColors — nullable fallback chain', () => {
  it('should resolve null tertiary to primary palette', () => {
    const theme = new Theme({ mapping: { tertiary: null } })
    const palette = theme.getPalette()
    // tertiary-500 should resolve to primary's palette (orange)
    expect(palette['--color-tertiary-500']).toBe(palette['--color-primary-500'])
  })

  it('should resolve null secondary to primary palette', () => {
    const theme = new Theme({ mapping: { secondary: null } })
    const palette = theme.getPalette()
    expect(palette['--color-secondary-500']).toBe(palette['--color-primary-500'])
  })

  it('should resolve null accent to primary palette', () => {
    const theme = new Theme({ mapping: { accent: null } })
    const palette = theme.getPalette()
    expect(palette['--color-accent-500']).toBe(palette['--color-primary-500'])
  })

  it('should resolve null error to danger palette', () => {
    const theme = new Theme({ mapping: { error: null } })
    const palette = theme.getPalette()
    expect(palette['--color-error-500']).toBe(palette['--color-danger-500'])
  })

  it('should not resolve explicitly set colors', () => {
    const theme = new Theme({ mapping: { tertiary: 'teal' } })
    const palette = theme.getPalette()
    expect(palette['--color-tertiary-500']).not.toBe(palette['--color-primary-500'])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/core && bun run test -- --run spec/theme.spec.js`
Expected: FAIL — null mapping causes `Cannot read properties of undefined`

- [ ] **Step 3: Implement `resolveColors()` in theme.ts**

Add the following function before the `Theme` class in `packages/core/src/theme.ts`, and update the constructor:

```typescript
/**
 * Fallback chain for nullable color mappings.
 * If a semantic color is null, it inherits from another semantic color.
 */
const COLOR_FALLBACKS = {
  tertiary: 'primary',
  secondary: 'primary',
  accent: 'primary',
  error: 'danger'
}

/**
 * Resolves null values in a color mapping by following the fallback chain.
 * @param {Record<string, string | null>} mapping
 * @returns {Record<string, string>}
 */
function resolveColors(mapping) {
  const resolved = { ...mapping }
  for (const [key, fallbackKey] of Object.entries(COLOR_FALLBACKS)) {
    if (resolved[key] === null || resolved[key] === undefined) {
      resolved[key] = resolved[fallbackKey] ?? DEFAULT_THEME_MAPPING[fallbackKey]
    }
  }
  return resolved
}
```

Update the `Theme` constructor to call `resolveColors`:

```typescript
constructor({ colors = defaultColors, mapping = DEFAULT_THEME_MAPPING, colorSpace = 'rgb' } = {}) {
  this.#colors = { ...defaultColors, ...colors }
  this.#mapping = resolveColors({ ...DEFAULT_THEME_MAPPING, ...mapping })
  this.#colorSpace = colorSpace
}
```

Also update the `mapping` setter:

```typescript
set mapping(mapping) {
  this.#mapping = resolveColors({ ...mapping })
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/core && bun run test -- --run spec/theme.spec.js`
Expected: All PASS

- [ ] **Step 5: Run full core test suite**

Run: `cd packages/core && bun run test -- --run`
Expected: All existing tests still pass

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/theme.ts packages/core/spec/theme.spec.js
git commit -m "feat(core): add nullable color resolution with fallback chain"
```

---

### Task 3: Roundedness Axis

**Files:**
- Create: `packages/themes/src/base/radius.css`
- Modify: `packages/themes/src/base/density.css`
- Modify: `packages/themes/src/base/index.css`

- [ ] **Step 1: Create `radius.css`**

Create `packages/themes/src/base/radius.css`:

```css
/**
 * Roundedness Axis — CSS Custom Property Scale
 *
 * Decoupled from density. Place data-radius on any container;
 * descendants inherit automatically.
 *
 * Presets: sharp → soft (default) → rounded → pill
 */

:root,
[data-radius='soft'] {
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.625rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
}

[data-radius='sharp'] {
  --radius-sm: 0;
  --radius-md: 0;
  --radius-lg: 0;
  --radius-xl: 0;
  --radius-full: 9999px;
}

[data-radius='rounded'] {
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
}

[data-radius='pill'] {
  --radius-sm: 9999px;
  --radius-md: 9999px;
  --radius-lg: 9999px;
  --radius-xl: 9999px;
  --radius-full: 9999px;
}
```

- [ ] **Step 2: Update `density.css` — remove hardcoded radius fallbacks**

In `packages/themes/src/base/density.css`, update all three density blocks to reference `--radius-*` without hardcoded fallbacks (radius.css now sets the defaults):

```css
:root,
[data-density='comfortable'] {
  /* ... spacing tokens unchanged ... */
  --density-radius-base: var(--radius-md);
}

[data-density='compact'] {
  /* ... spacing tokens unchanged ... */
  --density-radius-base: var(--radius-sm);
}

[data-density='cozy'] {
  /* ... spacing tokens unchanged ... */
  --density-radius-base: var(--radius-lg);
}
```

- [ ] **Step 3: Import `radius.css` in `index.css`**

In `packages/themes/src/base/index.css`, add the import after density:

```css
@import './typography.css';
@import './density.css';
@import './radius.css';
```

- [ ] **Step 4: Rebuild themes and verify**

Run: `cd packages/themes && bun run build`
Expected: Build succeeds, output includes radius.css content

- [ ] **Step 5: Commit**

```bash
git add packages/themes/src/base/radius.css packages/themes/src/base/density.css packages/themes/src/base/index.css
git commit -m "feat(themes): add roundedness axis — data-radius attribute with sharp/soft/rounded/pill presets"
```

---

### Task 4: Layout Tokens

**Files:**
- Create: `packages/themes/src/base/layout.css`
- Modify: `packages/themes/src/base/index.css`

- [ ] **Step 1: Create `layout.css`**

Create `packages/themes/src/base/layout.css`:

```css
/**
 * Layout Tokens — App-Level Spacing
 *
 * Structural layout dimensions for app shells.
 * Override per-app by redefining these custom properties.
 */

:root {
  --layout-sidebar-width: 240px;
  --layout-sidebar-collapsed: 64px;
  --layout-header-height: 56px;
  --layout-content-max-width: 1280px;
  --layout-section-gap: 2rem;
  --layout-section-padding: 1.5rem;
  --layout-content-padding: 2rem;
  --layout-card-gap: 1rem;
}
```

- [ ] **Step 2: Import in `index.css`**

In `packages/themes/src/base/index.css`, add after radius:

```css
@import './typography.css';
@import './density.css';
@import './radius.css';
@import './layout.css';
```

- [ ] **Step 3: Rebuild themes**

Run: `cd packages/themes && bun run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add packages/themes/src/base/layout.css packages/themes/src/base/index.css
git commit -m "feat(themes): add layout tokens — sidebar, content, section spacing"
```

---

### Task 5: Gradient Border Wrapper

**Files:**
- Create: `packages/themes/src/base/gradient-border.css`
- Modify: `packages/themes/src/base/index.css`

- [ ] **Step 1: Create `gradient-border.css`**

Create `packages/themes/src/base/gradient-border.css`:

```css
/**
 * Gradient Border Wrapper — Base Structural CSS
 *
 * Usage:
 *   <div data-gradient-border>
 *     <div data-gradient-border-inner>content</div>
 *   </div>
 *
 * Themes set the gradient on [data-gradient-border] background.
 * Non-gradient themes set background: transparent and use regular border.
 */

[data-gradient-border] {
  padding: var(--density-border-width, 1px);
  border-radius: var(--density-radius-base, var(--radius-md));
  background: var(--gradient-border-bg, transparent);
}

[data-gradient-border-inner] {
  border-radius: calc(var(--density-radius-base, var(--radius-md)) - var(--density-border-width, 1px));
  background: var(--gradient-border-inner-bg, inherit);
}

/* Fallback: when no gradient, use a standard border */
[data-gradient-border]:not([style*='--gradient-border-bg']) {
  padding: 0;
  border: var(--density-border-width, 1px) solid var(--gradient-border-color, currentColor);
}

[data-gradient-border]:not([style*='--gradient-border-bg']) [data-gradient-border-inner] {
  border-radius: var(--density-radius-base, var(--radius-md));
}
```

- [ ] **Step 2: Import in `index.css`**

In `packages/themes/src/base/index.css`, add after layout:

```css
@import './layout.css';
@import './gradient-border.css';
```

- [ ] **Step 3: Rebuild themes**

Run: `cd packages/themes && bun run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add packages/themes/src/base/gradient-border.css packages/themes/src/base/index.css
git commit -m "feat(themes): add gradient border wrapper structural CSS"
```

---

### Task 6: Literal Icon Support

**Files:**
- Modify: `packages/core/src/utils.js`
- Modify: `packages/ui/src/components/ItemContent.svelte`
- Modify: `packages/themes/src/base/item.css`
- Test: `packages/core/spec/utils.spec.js` (or existing test file)

- [ ] **Step 1: Write failing test for `isIconClass()`**

Find or create the utils test file. Add:

```javascript
import { isIconClass } from '../src/utils'

describe('isIconClass', () => {
  it('should return true for CSS icon class strings', () => {
    expect(isIconClass('i-lucide:home')).toBe(true)
    expect(isIconClass('i-semantic:check')).toBe(true)
    expect(isIconClass('i-glyph:settings')).toBe(true)
  })

  it('should return false for literal text (kanji, emoji, etc.)', () => {
    expect(isIconClass('聴')).toBe(false)
    expect(isIconClass('先')).toBe(false)
    expect(isIconClass('🏠')).toBe(false)
    expect(isIconClass('A')).toBe(false)
  })

  it('should return false for empty/null values', () => {
    expect(isIconClass('')).toBe(false)
    expect(isIconClass(null)).toBe(false)
    expect(isIconClass(undefined)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/core && bun run test -- --run spec/utils.spec.js`
Expected: FAIL — `isIconClass` not exported

- [ ] **Step 3: Implement `isIconClass()` in utils.js**

Add to `packages/core/src/utils.js`:

```javascript
/**
 * Detects whether an icon value is a CSS class (i-*) or literal text (kanji, emoji, etc.)
 * @param {string | null | undefined} icon
 * @returns {boolean} true if icon is a CSS class string
 */
export function isIconClass(icon) {
  if (!icon || typeof icon !== 'string') return false
  return icon.startsWith('i-')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/core && bun run test -- --run spec/utils.spec.js`
Expected: PASS

- [ ] **Step 5: Update ItemContent.svelte for literal icons**

Replace the icon rendering in `packages/ui/src/components/ItemContent.svelte`:

```svelte
<script>
  import { isIconClass } from '@rokkit/core'
  const { proxy, showIcon = true, showSubtext = true } = $props()
</script>

{#if showIcon}
  {#if proxy.get('avatar')}
    <img data-item-avatar src={proxy.get('avatar')} alt={proxy.get('tooltip') ?? proxy.label} />
  {:else if proxy.get('icon')}
    {#if isIconClass(proxy.get('icon'))}
      <span data-item-icon class={proxy.get('icon')} aria-hidden="true"></span>
    {:else}
      <span data-item-icon-literal aria-hidden="true">{proxy.get('icon')}</span>
    {/if}
  {/if}
{/if}
```

Keep the rest of the template unchanged.

- [ ] **Step 6: Add base CSS for `[data-item-icon-literal]`**

In `packages/themes/src/base/item.css`, add after the `[data-item-icon]` block:

```css
/* =============================================================================
   Item Icon — Literal (kanji, emoji, text)
   ============================================================================= */

[data-item-icon-literal] {
  flex-shrink: 0;
  width: var(--density-icon-size, 1.25rem);
  text-align: center;
  line-height: 1;
  font-size: var(--density-icon-size, 1.25rem);
}
```

- [ ] **Step 7: Rebuild themes**

Run: `cd packages/themes && bun run build`
Expected: Build succeeds

- [ ] **Step 8: Run full test suites**

Run: `cd packages/core && bun run test -- --run`
Run: `bun run test:ui`
Expected: All pass

- [ ] **Step 9: Commit**

```bash
git add packages/core/src/utils.js packages/core/spec/utils.spec.js packages/ui/src/components/ItemContent.svelte packages/themes/src/base/item.css
git commit -m "feat(ui): add literal icon support — kanji/emoji render as text, CSS classes as icons"
```

---

### Task 7: UnoCSS Preset Updates

**Files:**
- Modify: `packages/unocss/src/preset.ts:53-57,78-86`

- [ ] **Step 1: Add `soft` radius preset and update preflight generation**

In `packages/unocss/src/preset.ts`, add `soft` to `RADIUS_PRESETS`:

```typescript
const RADIUS_PRESETS = {
  sharp: { sm: '0', md: '0', lg: '0', xl: '0', full: '9999px' },
  soft: { sm: '0.125rem', md: '0.375rem', lg: '0.625rem', xl: '0.75rem', full: '9999px' },
  rounded: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
  pill: { sm: '9999px', md: '9999px', lg: '9999px', xl: '9999px', full: '9999px' }
}
```

- [ ] **Step 2: Verify tertiary shortcuts are generated automatically**

The `buildShortcuts` function iterates `Object.keys(config.colors)` — since we added `tertiary` to `DEFAULT_CONFIG.colors` in Task 1, it will automatically generate tertiary shortcuts. No code change needed here.

Verify by reading: `packages/unocss/src/preset.ts:96` — `for (const variant of variants)` iterates all config.colors keys.

- [ ] **Step 3: Run demo app build to verify preset compiles**

Run: `cd demo && bun run build`
Expected: Build succeeds without errors

- [ ] **Step 4: Commit**

```bash
git add packages/unocss/src/preset.ts
git commit -m "feat(unocss): add soft radius preset, tertiary shortcuts auto-generated"
```

---

### Task 8: Wire Tokens into Demo App

**Files:**
- Modify: `demo/src/routes/(app)/+layout.svelte:106-113,124-126`
- Modify: `demo/src/app.css:60-62`
- Modify: `demo/rokkit.config.js`

- [ ] **Step 1: Add `tertiary` and `shape.radius` to demo config**

In `demo/rokkit.config.js`:

```javascript
export default {
  colors: {
    surface: 'slate',
    primary: 'orange',
    secondary: 'pink',
    tertiary: 'violet'
  },
  shape: {
    radius: 'soft'
  },
  // ... rest unchanged
}
```

- [ ] **Step 2: Replace hardcoded sidebar widths with layout tokens**

In `demo/src/routes/(app)/+layout.svelte`, update the `<style>` block:

Replace:
```css
.app-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  transition: grid-template-columns 200ms ease;
}
.app-layout.collapsed {
  grid-template-columns: 64px 1fr;
}
```

With:
```css
.app-layout {
  display: grid;
  grid-template-columns: var(--layout-sidebar-width) 1fr;
  min-height: 100vh;
  transition: grid-template-columns 200ms ease;
}
.app-layout.collapsed {
  grid-template-columns: var(--layout-sidebar-collapsed) 1fr;
}
```

- [ ] **Step 3: Replace hardcoded radius in app.css**

In `demo/src/app.css`, replace the hardcoded radius values:

Replace:
```css
  /* ── Radii ──────────────────────────────────────────────── */
  --radius:    6px;
  --radius-lg: 10px;
```

With:
```css
  /* ── Radii (consumed from layout tokens, overridable) ──── */
  --radius: var(--radius-md);
  --radius-lg: var(--radius-lg);
```

Note: This aliases the zen-sumi `--radius` shorthand to the generic `--radius-md` token, so existing component styles that use `var(--radius)` will now respond to the `data-radius` axis.

- [ ] **Step 4: Add `data-radius` attribute to demo app root**

In `demo/src/routes/(app)/+layout.svelte`, add `data-radius` to the root div:

```svelte
<div class="app-layout" class:collapsed={sidebarCollapsed} data-radius="soft">
```

- [ ] **Step 5: Commit**

```bash
git add demo/rokkit.config.js demo/src/app.css demo/src/routes/(app)/+layout.svelte
git commit -m "feat(demo): wire design tokens — layout vars, radius axis, tertiary color"
```

---

### Task 9: Browser Verification

**Files:** None (read-only verification)

- [ ] **Step 1: Start demo dev server**

Run: `cd demo && bun run dev`
Expected: Server starts on localhost:5173

- [ ] **Step 2: Verify layout tokens in browser dev tools**

Open http://localhost:5173 in browser. Inspect `:root` in dev tools:
- `--layout-sidebar-width: 240px` exists
- `--layout-sidebar-collapsed: 64px` exists
- `--layout-content-max-width: 1280px` exists
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl` all exist
- `--color-tertiary-*` shade scale exists (50 through 950)

- [ ] **Step 3: Verify sidebar uses layout tokens**

Inspect the `.app-layout` grid — `grid-template-columns` should show `var(--layout-sidebar-width)` resolving to `240px`. Click collapse button — should switch to `var(--layout-sidebar-collapsed)` resolving to `64px`.

- [ ] **Step 4: Verify radius axis responds to changes**

In dev tools, change `data-radius` on the root from `soft` to `sharp`. All rounded corners should become square. Change to `pill` — all corners should become fully rounded. Change to `rounded` — moderate rounding.

- [ ] **Step 5: Verify tertiary color is available**

In dev tools, confirm `--color-tertiary-500` resolves to violet (124,58,237 in rgb). All shades 50-950 should exist.

- [ ] **Step 6: Navigate all screens**

- Observatory (/observatory) — renders correctly
- Sessions (/sessions) — renders correctly
- Setup wizard (/setup) — renders correctly
- Settings (/settings) — renders correctly

No visual regressions from the token wiring.

- [ ] **Step 7: Run existing tests to ensure no regressions**

Run: `bun run test:ci`
Expected: All ~2536+ tests pass

Run: `bun run lint`
Expected: 0 errors

- [ ] **Step 8: Run demo e2e tests**

Run: `cd demo && npx playwright test`
Expected: All visual regression tests pass (or produce expected diffs from token adoption)

---

### Task 10: Update Execution Plan and Journal

**Files:**
- Modify: `docs/design-system/execution-plan.md`
- Modify: `agents/journal.md`

- [ ] **Step 1: Mark Phase 4 complete in execution plan**

Update `docs/design-system/execution-plan.md`:

```markdown
Phase 4: Design Token System (extend @rokkit/core + preset)             ✅ DONE
```

Update the Phase 4 section header:

```markdown
## Phase 4: Design Token System ✅
```

Add status line:

```markdown
> **Status:** Complete. Commits `<first>`..`<last>` on develop.
```

- [ ] **Step 2: Update journal**

Add entry to `agents/journal.md` with date, summary of what was done, commit hashes, and final test count.

- [ ] **Step 3: Commit documentation updates**

```bash
git add docs/design-system/execution-plan.md agents/journal.md
git commit -m "docs: mark Phase 4 complete, update journal"
```
