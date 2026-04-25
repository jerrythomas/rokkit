# Execution Plan: Design System + Demo App + Theme Rebuild

> Step-by-step plan for building the demo app, zen-sumi theme, design token system,
> and rebuilding existing themes.

---

## Overview

```
Phase 1: Demo App Foundation (SvelteKit + mockup replication)
Phase 2: Internationalization (Paraglide + Spanish + Arabic/RTL)
Phase 3: Playwright Baseline (visual regression snapshots)
Phase 4: Design Token System (extend @rokkit/core + preset)
Phase 5: Zen-Sumi Theme (new theme in demo, then promote)
Phase 6: Component Migration (replace custom → rokkit, screen by screen)
Phase 7: Theme Rebuild (rokkit, minimal, frosted, material)
Phase 8: Settings Panel + Theme Switcher
Phase 9: Final Verification
```

---

## Phase 1: Demo App Foundation

**Goal**: Replicate the mockup design as a SvelteKit app using static CSS and mocked data.

### Step 1.1: Scaffold SvelteKit App

- Reset the `demo/` folder with a fresh SvelteKit scaffold
- Configure: UnoCSS, Svelte 5, TypeScript
- Add mockup fonts: Fraunces, Inter, JetBrains Mono (via Google Fonts or local)
- Port `tokens.css` from mockups as the initial stylesheet
- Set up basic app shell (app.html, app.css, root layout)

**Verify**: `bun run dev` serves a blank page with correct fonts loaded.

### Step 1.2: App Layout + Sidebar

- Implement the two-column layout: collapsible sidebar + main content
- Build the sidebar navigation component (Observatory-style):
  - Nav sections with kanji icons + labels + badges
  - Active/hover states matching mockup
  - Collapsible groups (Active projects, Recent projects)
  - Daemon status footer
- Route structure:
  ```
  /                    → redirect to /observatory
  /observatory         → daily dashboard
  /sessions            → session browser
  /setup               → setup wizard
  /settings            → theme settings (placeholder)
  ```

**Verify**: Sidebar renders, navigation works, responsive collapse.

### Step 1.3: Observatory Screen

- Greeting strip (date + hello)
- FTR hero section (arc gauge + sparkline + delta)
- Hero koan (kanji + title + explanation + impact)
- Insights section (max 3 cards)
- Recent sessions table
- All data from mocked load functions

**Data stubs** (`src/lib/data/observatory.ts`):
```typescript
export function loadObservatoryData() {
  return {
    greeting: { date: '...', name: 'Jerry' },
    ftr: { score: 72, trend: [...], delta: +4.2 },
    koan: { kanji: '聴', title: '...', explanation: '...' },
    insights: [...],
    sessions: [...],
  }
}
```

**Verify**: Observatory screen matches mockup layout and proportions.

### Step 1.4: Sessions Screen

- Digest view: retro cards (going well / not going well / insights)
- Session list with filters (project, language, outcome)
- Table with columns: FTR dot, project, title, corrections, duration, time
- Filter bar with tab-style toggles

**Verify**: Sessions screen renders with mock data, filters work.

### Step 1.5: Setup Wizard Screen

- Left rail stepper (completed chips, current expanded, pending dots)
- Bottom progress bar
- Implement 3 representative steps:
  - **Welcome** (text + pillars)
  - **Folders** (folder picker + scan button)
  - **Projects** (grouped cards with assign/confirm)
- Navigation: next/back/skip
- Step state management

**Verify**: Wizard navigates through steps, stepper updates state.

### Step 1.6: Data Layer

- Create `src/lib/data/` module with all mock data
- Use SvelteKit `+page.ts` load functions for each route
- Type all data interfaces in `src/lib/types.ts`
- Ensure mock data is realistic (names, numbers, dates)

**Verify**: All screens render with typed mock data via load functions.

---

## Phase 2: Internationalization

**Goal**: Extract all strings, add Paraglide, implement Spanish + Arabic (RTL).

### Step 2.1: Set Up Paraglide

- Install `@inlang/paraglide-sveltekit`
- Configure `project.inlang/settings.json`
- Set up language routing (URL-based: `/en/`, `/es/`, `/ar/`)
- Add language switcher component

**Verify**: Language route prefix works, switcher toggles locale.

### Step 2.2: Extract Messages

- Audit all screens for hardcoded strings
- Create message files:
  - `messages/en.json` (English — source of truth)
  - `messages/es.json` (Spanish)
  - `messages/ar.json` (Arabic)
- Replace all hardcoded text with `m.key()` calls
- Handle plurals, dates, numbers with Paraglide utilities

**Verify**: All text comes from message files, no hardcoded strings.

### Step 2.3: RTL Support

- Add `dir="rtl"` on `<html>` when locale is Arabic
- Audit all layouts for RTL compatibility:
  - Sidebar flips to right side
  - Text alignment flips
  - Flex/grid directions reverse via `logical` CSS properties
  - Icon mirroring where needed (arrows, chevrons)
- Use CSS logical properties (`margin-inline-start`, `padding-inline-end`)
- Add `[dir="rtl"]` overrides where logical properties aren't sufficient
- Test tree component indent lines in RTL

**Verify**: Arabic renders correctly with sidebar on right, all text aligned properly.

---

## Phase 3: Playwright Baseline

**Goal**: Capture visual snapshots of every screen as the reference baseline.

### Step 3.1: Set Up Playwright

- Install Playwright in demo app
- Configure projects for:
  - Chrome desktop (1440x900)
  - Firefox desktop (1440x900)
- Create test helpers for navigation, waiting for fonts

### Step 3.2: Capture Baseline Snapshots

Write tests for each screen + variant:

```
observatory.spec.ts
  ├─ light mode (en)
  ├─ dark mode (en)
  ├─ light mode (es)
  ├─ light mode (ar/rtl)
  └─ dark mode (ar/rtl)

sessions.spec.ts
  ├─ digest view (light/dark)
  └─ filtered view (light/dark)

setup-wizard.spec.ts
  ├─ step 1 welcome
  ├─ step 4 folders
  └─ step 6 projects
```

- Use `expect(page).toHaveScreenshot()` for visual regression
- Capture section-level snapshots (hero, sidebar, table) in addition to full-page
- Compare against mockup proportions manually for initial review

**Verify**: All snapshots captured, tests pass as baseline.

---

## Phase 4: Design Token System

**Goal**: Extend @rokkit/core and @rokkit/unocss to support the new token architecture.

### Step 4.1: Add Tertiary Color + Nullable Resolution

**Files**: `packages/core/src/constants.js`, `packages/core/src/theme.ts`

- Add `tertiary` to `DEFAULT_THEME_MAPPING`
- Implement `resolveColors()` with inheritance chain:
  ```
  tertiary  → primary
  secondary → primary (if null)
  accent    → primary (if null)
  error     → danger  (if null)
  ```
- Update `Theme` class to call `resolveColors()` on construction
- Update `semanticShortcuts()` to generate shortcuts for `tertiary`

**Verify**: Unit tests for nullable resolution, all existing tests pass.

### Step 4.2: Roundedness Axis

**Files**: `packages/themes/src/base/density.css` (or new `radius.css`)

- Add `data-radius` attribute support
- Define named presets: sharp, soft, rounded, pill
- Add CSS custom properties:
  ```css
  [data-radius='soft'] {
    --radius-sm: 0.125rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.625rem;
    --radius-xl: 0.75rem;
    --radius-full: 9999px;
  }
  ```
- Update base component CSS to use `--radius-*` variables
- Decouple `--density-radius-base` from density (keep density for spacing only)

**Verify**: Changing `data-radius` on a container alters all descendant component radii.

### Step 4.3: Layout Tokens

**Files**: `packages/themes/src/base/layout.css` (new)

- Define layout CSS custom properties:
  ```css
  :root {
    --layout-sidebar-width: 260px;
    --layout-sidebar-collapsed: 64px;
    --layout-header-height: 56px;
    --layout-content-max-width: 1280px;
    --layout-section-gap: 2rem;
    --layout-section-padding: 1.5rem;
    --layout-content-padding: 2rem;
    --layout-card-gap: 1rem;
  }
  ```
- Import from `base/index.css`

**Verify**: Variables available in dev tools, no regressions.

### Step 4.4: Gradient Border Wrapper

**Files**: `packages/themes/src/base/gradient-border.css` (new), possibly `@rokkit/ui` components

- Define `[data-gradient-border]` base structural CSS
- Define `[data-gradient-border-inner]` inner container
- Add to components that need it (input, card in some themes)
- Ensure themes that don't use gradients simply set `background: transparent; border: ...`

**Verify**: Gradient border renders correctly in rokkit theme, transparent in minimal.

### Step 4.5: Update UnoCSS Preset

**Files**: `packages/unocss/src/preset.ts`, `packages/unocss/src/config.js`

- Accept `colorSpace` in config (already partially supported)
- Accept `radius` preset name in config
- Accept `density` default in config
- Generate preflight CSS for radius presets
- Generate `tertiary` semantic shortcuts
- Update `loadConfig()` defaults

**Verify**: Demo app's `uno.config.js` uses new config options, utilities generate correctly.

### Step 4.6: Literal Icon Support

**Files**: `packages/ui/src/components/ItemContent.svelte`, all components with icon rendering

- Add `isIconClass()` utility to `@rokkit/core` — detects whether icon value is a CSS class (`i-*`) or literal text (kanji, emoji, etc.)
- Update `ItemContent.svelte` icon rendering: class-based icons as today, literal icons render text content inside span with `data-item-icon-literal` attribute
- Apply same pattern to all components that render icons: Button, Tabs, Menu, Select, Toggle, Toolbar, etc.
- Add base CSS for `[data-item-icon-literal]`: centered text, uses `--density-icon-size` for width
- Theme CSS can style literal icons differently (font family, size, weight)

**Verify**: Both `icon: 'i-lucide:home'` (CSS class) and `icon: '聴'` (literal kanji) render correctly in List component.

### Step 4.7: Stepper Component

**Files**: `packages/ui/src/Stepper.svelte` (new), associated files

- New `Stepper` component for wizard-style navigation
- Props: `steps` (array), `current` (index), `orientation` ('vertical' | 'horizontal')
- Field mapping: `{ label, description, icon, status }`
- Status per step: `completed`, `current`, `pending`, `error`
- Uses `ListController` internally
- Vertical layout for sidebar rail, horizontal for bottom bar
- Keyboard navigable via `navigator` action

**Verify**: Stepper renders, keyboard navigation works, themes can style it.

---

## Phase 5: Zen-Sumi Theme

**Goal**: Build the zen-sumi theme — first in demo app, then promote to @rokkit/themes.

### Step 5.1: Create Theme Structure in Demo

```
demo/src/themes/zen-sumi/
├── index.css
├── button.css
├── input.css
├── list.css
├── card.css
├── tabs.css
├── table.css
├── stepper.css
├── dropdown.css
├── toolbar.css
└── badge.css
```

- Create OKLCH palette files (kami, shu, hisui, kohaku)
- Register custom palettes in `rokkit.config.js`
- Configure zen-sumi skins (default, indigo, forest, night)

**Verify**: `data-style="zen-sumi"` activates on a test element.

### Step 5.2: Style Core Components

For each component, write CSS matching the mockup treatment:

1. **Button** — Sumi fill, shu CTA, outline with ink-line, ghost
2. **Input** — Hairline border, paper-2 bg, subtle focus darkening
3. **List** — Transparent items, paper-3 hover, paper active, kanji icons
4. **Card** — Paper-2 bg, hairline border, no shadows
5. **Tabs** — Pill-style, sumi active bg, sumi-3 inactive
6. **Table** — Minimal headers, hairline row borders, mono data
7. **Badge** — Shu/hisui/kohaku fills with paper text
8. **Stepper** — Vertical rail with completed chips, current expanded
9. **Dropdown** — Paper bg, hairline border, shu selected indicator

**Verify**: Each component matches the mockup when `data-style="zen-sumi"`.

### Step 5.3: Verify Against Mockups

- Run Playwright visual tests with zen-sumi active
- Compare screenshots against mockup reference images
- Adjust spacing, colors, typography to match
- Iterate until visual parity achieved

**Verify**: Playwright snapshots match mockup proportions and colors.

### Step 5.4: Promote to @rokkit/themes

- Copy `demo/src/themes/zen-sumi/` to `packages/themes/src/zen-sumi/`
- Add build entry in `build.mjs`
- Add exports in `package.json`
- Add to `src/index.css` bundle
- Run full theme build
- Update demo to import from `@rokkit/themes/zen-sumi`

**Verify**: `bun run build` succeeds, demo still renders correctly with package import.

---

## Phase 6: Component Migration

**Goal**: Replace custom demo components with @rokkit/ui components, one screen and one component at a time.

### General Process Per Component

1. Identify the custom component to replace
2. Map its data to rokkit's field mapping
3. Swap the implementation in the template
4. Add/update zen-sumi CSS for the rokkit component's data attributes
5. Run Playwright visual regression — screenshot diff should be minimal
6. Commit

### Step 6.1: Observatory Sidebar → List

- Replace custom sidebar nav with `<List>` component
- Field mapping: `{ label: 'name', icon: 'kanji', badge: 'count' }`
- Groups via `children` field (Active projects, Recent projects)
- Custom snippet for kanji icon if needed
- Update zen-sumi `list.css` for sidebar styling

**Verify**: Sidebar looks identical, keyboard navigation works.

### Step 6.2: Observatory Sessions Table → List (or Table)

- Replace the recent sessions table with rokkit `<List>` or a future `<Table>` component
- If List: use item snippet for columnar layout
- Field mapping for session rows

**Verify**: Table layout matches, data renders correctly.

### Step 6.3: Sessions Screen Filters → Tabs

- Replace filter tab bar with rokkit `<Tabs>` component
- Active/inactive states via zen-sumi `tabs.css`

**Verify**: Tab switching filters the list, visual match.

### Step 6.4: Sessions Screen Cards → Card

- Replace retro/insight cards with rokkit card patterns
- Zen-sumi card styling (no shadow, hairline border)

**Verify**: Cards render correctly with mock data.

### Step 6.5: Setup Wizard Stepper → Stepper (new component)

- Replace custom wizard rail with rokkit `<Stepper>`
- Vertical orientation, step status management
- Zen-sumi `stepper.css` for the rail styling

**Verify**: Stepper navigates, completed/current/pending states display correctly.

### Step 6.6: Setup Wizard Forms → FormRenderer

- Replace wizard step forms with rokkit `<FormRenderer>`
- Define form schemas for Folders step, Projects step
- Input styling via zen-sumi `input.css`

**Verify**: Forms render, validation works, zen-sumi styling applied.

### Step 6.7: All Buttons → Button

- Replace all custom `<button>` elements with rokkit `<Button>`
- Map variants: primary, outline, ghost, CTA
- Zen-sumi `button.css` handles all states

**Verify**: All buttons styled correctly across all screens.

### Step 6.8: Dropdown Menus → Menu/Select

- Replace any custom dropdowns with rokkit `<Menu>` or `<Select>`
- Field mapping for options
- Zen-sumi `dropdown.css`

**Verify**: Dropdowns open/close, keyboard navigation works.

### Step 6.9: Visual Regression Check

- Run full Playwright suite
- Compare all screenshots against Phase 3 baseline
- Diff should show minimal changes (rokkit components should look identical)
- Fix any visual regressions

**Verify**: All snapshots pass within acceptable tolerance.

---

## Phase 7: Theme Rebuild

**Goal**: Rebuild existing rokkit themes using the new design token system.

> This is a breaking change. Old theme CSS is replaced, not extended.

### Step 7.1: Rokkit Theme

**Identity**: Gradient-forward, vibrant, energetic.

Key changes:
- CTA/highlight: gradient from `primary-z5` to `secondary-z5` (left → right, adapts to orientation)
- Input focus: gradient border (using `[data-gradient-border]`)
- Buttons: gradient fill for default, gradient border for outline
- Active states: gradient background tint
- Keep existing gradient patterns but express through design tokens

**Verify**: All rokkit-themed components render, visual regression against current screenshots.

### Step 7.2: Minimal Theme

**Identity**: Clean, understated, professional.

Key changes:
- CTA/highlight: flat underline or border-left accent
- Input focus: underline thickens (bottom border)
- Input default: underline style (bottom border only)
- Buttons: flat solid fill, no gradient
- Active states: subtle background tint + accent border

**Verify**: Minimal theme renders correctly across all components.

### Step 7.3: Material Theme

**Identity**: Elevation, surfaces, tonal containers.

Key changes:
- CTA/highlight: tonal container (variant-z1 bg) + elevation shadow
- Input focus: border + filled background
- Input default: filled variant (tinted bg) or outlined
- Buttons: elevation shadow, no gradient
- Active states: tonal surface shift + shadow change
- Map to Material Design 3 color system concepts where applicable

**Verify**: Material theme renders with proper elevation and tonal surfaces.

### Step 7.4: Frosted Theme

**Identity**: Apple Liquid Glass — translucent, blurred, luminous.

Key changes:
- CTA/highlight: glass overlay with backdrop-blur
- Input focus: glass border with specular highlight
- Backgrounds: `color-mix()` for translucency + `backdrop-filter: blur()`
- Inset shine: `inset 0 1px 0 rgba(255,255,255,0.25)`
- Buttons: glass fill with blur
- Active states: increased opacity + blur

**Verify**: Frosted theme renders with glass effects, blur works.

### Step 7.5: Clean Up Legacy Themes

- Remove themes that are no longer maintained: shadcn, daisy-ui, bits-ui, carbon, ant-design, grada-ui
  (or keep as community-contributed if desired — but they should be updated to use design tokens)
- Update `build.mjs` for the final theme list
- Update `package.json` exports
- Update documentation

**Verify**: Build succeeds with only the maintained themes.

---

## Phase 8: Settings Panel + Theme Switcher

**Goal**: Dedicated /settings route with live theme switching.

### Step 8.1: Settings Route

- Create `/settings` route in demo app
- Sections:
  - **Theme**: Style selector (rokkit, zen-sumi, minimal, material, frosted)
  - **Mode**: Light / Dark / System toggle
  - **Density**: Compact / Comfortable / Cozy
  - **Palette/Skin**: Color scheme presets
  - **Roundedness**: Sharp / Soft / Rounded / Pill
  - **Language**: English / Spanish / Arabic

### Step 8.2: Live Preview

- All changes applied immediately via `data-*` attribute updates
- Use rokkit's `vibeStore` for state management
- Persist to localStorage via configured `storageKey`
- Restore on app load

### Step 8.3: Settings Panel Component

- Consider making this a reusable rokkit component (`<ThemePanel>`)
- Uses rokkit form components (Select, Toggle, RadioGroup)
- Styled with current theme (so it adapts to its own changes)

**Verify**: Switching any axis updates the entire app live, persists across refresh.

---

## Phase 9: Final Verification

### Step 9.1: Full Visual Regression

Run Playwright for the complete matrix:

```
5 themes × 2 modes × 3 densities × 4 radii × 3 languages = 360 combinations
```

Pragmatic subset (key combinations):
```
zen-sumi:  light + dark × comfortable × soft × en/ar = 4
rokkit:    light + dark × comfortable × rounded × en = 2
minimal:   light + dark × compact × soft × en = 2
material:  light + dark × comfortable × rounded × en = 2
frosted:   light + dark × cozy × rounded × en = 2
                                                Total: 12 snapshot sets
```

### Step 9.2: Cross-Theme Consistency Check

- Verify all 10 semantic colors render in each theme
- Verify density switching works in each theme
- Verify radius switching works in each theme
- Verify RTL works in each theme
- Verify skin switching works in each theme

### Step 9.3: Component Coverage Audit

- Every rokkit component used in the demo has zen-sumi CSS
- Every component has visual regression snapshots
- No custom (non-rokkit) interactive components remain

### Step 9.4: Documentation

- Update `docs/design-system/README.md` with any changes from implementation
- Update `agents/memory.md` with new decisions
- Update `agents/journal.md` with progress
- Update main project `README.md` if needed

### Step 9.5: Final Build + Publish Check

- `bun run build` succeeds for all packages
- `bun run test:ci` passes (all ~2536+ tests)
- `bun run lint` — 0 errors
- Demo app builds for production: `cd demo && bun run build`
- Theme package exports are correct

---

## Dependency Graph

```
Phase 1 ─────────────────┐
Phase 2 ─────────────────┤
                         ├──▶ Phase 3 (baseline snapshots)
Phase 4 (tokens) ────────┤
                         ├──▶ Phase 5 (zen-sumi) ──▶ Phase 6 (migration)
                         │                                    │
                         └──▶ Phase 7 (theme rebuild) ◀──────┘
                                       │
                                       ▼
                              Phase 8 (settings)
                                       │
                                       ▼
                              Phase 9 (verification)
```

Phases 1–2 and Phase 4 can proceed in parallel.
Phase 3 depends on Phases 1–2.
Phase 5 depends on Phase 4.
Phase 6 depends on Phases 3 + 5.
Phase 7 depends on Phase 4, can overlap with Phase 6.
Phase 8 depends on Phases 6 + 7.
Phase 9 depends on everything.

---

## Pattern

Identify and document pattern to be followed in the future if we need to implement other designs like shadcdn, grada-ui, bits-ui, daisyui, carbon, ant-design etc.

## Estimated Scope

| Phase | New files | Modified files | New tests |
|-------|-----------|----------------|-----------|
| 1 | ~25 | 3 (demo config) | 0 |
| 2 | ~8 (messages, config) | ~20 (string extraction) | 0 |
| 3 | ~5 (test files) | 1 (playwright config) | ~30 tests |
| 4 | ~6 (core/preset/CSS) | ~8 (existing tokens) | ~15 tests |
| 5 | ~12 (theme CSS files) | 2 (config, build) | ~5 tests |
| 6 | 0 | ~15 (swap components) | 0 (existing tests) |
| 7 | 0 | ~40 (rebuild 4 themes) | ~10 tests |
| 8 | ~4 (settings route) | 2 (layout, store) | ~5 tests |
| 9 | 0 | ~5 (docs) | ~12 tests (matrix) |
| **Total** | **~60** | **~96** | **~77** |
