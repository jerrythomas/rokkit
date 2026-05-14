# Koan — Chat-led Demo Shell

**Date:** 2026-05-14
**Status:** Design (Phase 1 + 1.5)
**Supersedes:** the `demo/` showcase app entry in `docs/design/12-priority.md` (business-analytics framing)
**Related:** future spec for `sites/learn` migration; future spec for transformers.js smart-match

---

## 1. Overview

Koan is the Rokkit demo and (eventually) documentation surface. It replaces the previously-planned business-analytics demo and the partially-built Sensei mockup app with a single chat-led showcase shell.

The user lands on a near-blank page. Typing engages a curated demo catalog. Matches surface as preview cards; picking a card mounts the full demo in a single-active canvas. A timeline of visited demos lives in the sidebar.

Phase 1 ships the shell plus three demos (Theme Builder wizard, Tabs, Toasts). Phase 1.5 promotes the seven new generalizable components to `@rokkit/ui`. Phase 2+ migrates `sites/learn` content segment by segment in separate specs.

### Brand

- **Name:** Koan
- **Glyph:** ○ (enso — single brush-stroke circle, drawn with sumi ink; pairs with the zen-sumi theme)
- **Annotation font:** Caveat, via `@fontsource/caveat`

## 2. Goals, Non-Goals, Success Criteria

### Goals

- Provide a chat-led entry to discover and try Rokkit components.
- Make the demo *itself* a stress test of `@rokkit/ui` — bugs surface in Koan before reaching consumers.
- Ship a useful Theme Builder wizard that persists user themes to localStorage and exports them.
- Build new shell components in `demo/` with generalizable APIs, then promote to `@rokkit/ui` once their shape is validated by Koan's real use.
- Lay the foundation for Koan to absorb the documentation role currently held by `sites/learn` in later phases.

### Non-Goals (Phase 1)

- Markdown prose alongside demos. Deferred — needs content model and authoring workflow.
- Transformers.js / semantic match. Deferred to its own showcase-moment spec.
- Migration of `sites/learn` content, llms.txt routes, story pages. Each segment is a future spec.
- Deep demos for forms, charts, tree, table, code viewer, carousel, animation, etc.
- Mobile responsive layout. Known follow-up.
- Per-mode palette overrides in the wizard. Phase 2 (advanced toggle).
- Custom color / per-role palette picker in the wizard. Phase 2.
- Side-by-side density / roundedness comparison. Phase 2.
- Promotion of `Shell`, `Welcome`, and Koan-`Canvas` to `@rokkit/ui` — these are Koan-specific compositions.

### Success Criteria

1. First-time visitor lands on welcome state, types "theme" or "style", presses Enter, sees the migration animation, picks the Theme Builder card, walks through the 3-step wizard, saves a theme, and watches the page restyle live.
2. Typing "tabs" surfaces the Tabs demo; typing "toast", "notification", or "alert" surfaces the Toasts demo.
3. Each of the 3 Phase 1 demos has at least 2 working synonyms in the match index.
4. Timeline in the sidebar shows visited demos with icon, title, timestamp; clicking restores the demo with a scroll-up animation.
5. Deep-link `?demo=theme-wizard` mounts the wizard directly with the sidebar visible (no welcome migration).
6. Zero new lint errors. Keyboard navigation works through input → chips → timeline → canvas with no traps.

## 3. Phasing

### Phase 1 — Koan shell + demos (this spec)

- Build the chat-led shell in `demo/`.
- Build seven generalizable components inside `demo/src/lib/koan/components/` with `@rokkit/ui`-shape APIs (no Koan-specific assumptions baked into the API).
- Ship three demos: Theme Builder wizard, Tabs, Toasts.
- Move existing Sensei pages under a `(legacy)/` route group; keep them buildable but off the main path.

### Phase 1.5 — Promote components to `@rokkit/ui` (this spec)

- Move each of the seven generalizable components from `demo/src/lib/koan/components/` to `packages/ui/src/<component>/`.
- Add unit tests, e2e tests (Koan flows already exercise them; extend as needed), llms.txt, theme CSS for zen-sumi.
- Update Koan imports.
- **Skip separate playground page on `sites/learn`** — Koan demos are the canonical showcase; component llms.txt links to the Koan deep-link.

### Phase 2+ — Future specs (NOT in this spec)

- Wizard color step (per-role palette picker)
- Wizard advanced: per-mode palette overrides, custom density numerics
- Side-by-side density / roundedness comparison
- Markdown prose docs alongside demos
- Transformers.js smart-match (with model-load progress as a showcase moment)
- `sites/learn` content migration — one segment at a time:
  - Component reference pages
  - llms.txt routes (continuity matters; downstream agents consume these)
  - Story pages
  - Forms documentation
  - Charts documentation
  - Tooling / CLI documentation
- Additional demos: forms, charts, tree, table, code viewer, carousel, animation, multi-step navigation patterns, dynamic forms, ProgressRail
- Mobile responsive layout

## 4. Information Architecture

### Routes

```
demo/src/routes/
  +layout.svelte                 KEEP (app-wide CSS imports)
  +page.svelte                   REWRITE → mounts the Koan shell
  (legacy)/                      NEW group; MOVE all current (app)/ and setup/ here
  mockup/                        SCRATCH area for visual exploration during design
```

Koan is single-route. State (current demo, query, timeline) lives in Svelte stores; the shell never unmounts between demos so the sidebar stays mounted and animated.

### URL conventions

- `/` — welcome state (or active state if `koan.history` is non-empty)
- `/?demo=<id>` — shell + active demo (skips the welcome migration)
- `/?q=<query>` — shell + pre-filled query showing gallery
- `/?demo=theme-wizard&theme=<themeId>` — wizard seeded with a saved theme for editing

### Code layout

```
demo/src/lib/koan/
  catalog.ts                     demo registry + minisearch index build
  match.svelte.ts                $derived match results from the query store
  store.svelte.ts                $state: query, suggestions, history, activeDemo
  persistence.ts                 localStorage adapter
  components/                    Koan-local component implementations (Phase 1)
    AnnotationArrow.svelte
    BrandMark.svelte
    EmptyState.svelte
    Gallery.svelte
    ChatPanel.svelte
    ShowcaseCanvas.svelte
    TimelineList.svelte
    Shell.svelte                 (composition, stays Koan-local)
    Welcome.svelte               (composition, stays Koan-local)
    Canvas.svelte                (composition, stays Koan-local)
  demos/
    theme-wizard/{index,preview,meta}
    tabs/{index,preview,meta}
    toasts/{index,preview,meta}
```

After Phase 1.5: `AnnotationArrow`, `BrandMark`, `EmptyState`, `Gallery`, `ChatPanel`, `ShowcaseCanvas`, `TimelineList` move to `packages/ui/src/`. `Shell`, `Welcome`, `Canvas` (Koan) stay in `demo/`.

## 5. Layout & Visual States

### Spatial layout

- **Sidebar** — fixed width 360px, `bg-surface-z0`, full height. Vertical stack: brand mark slot (top), chat input (mid), suggestion chips (just below input), timeline list (fills remaining, scrollable), mode toggle (above timeline), reset link (footer).
- **Canvas** — fluid, `bg-surface-z1`. Generous padding. Dot-grid background (`--canvas-grid-color` defaults to `surface-z2` at ~30% alpha; `background-size: 24px 24px`).

### Five states

1. **Welcome (no history)** — sidebar hidden entirely. Canvas centers: large enso ○ (~120px), Caveat-script tagline below, hand-drawn arrow curving to a centered chat input. Minimal, almost empty.
2. **Migrating (one-shot, ~600ms)** — triggered by first Enter on welcome. Sidebar slides in from left. Enso ○ animates from canvas-center to sidebar's top-left brand slot (24px). Chat input migrates from canvas-center to sidebar mid-position. Canvas swaps to gallery or demo view.
3. **Gallery active (query has matches > 1)** — canvas shows minisearch results as a grid of `PreviewCard`s. Caveat breadcrumb at top (e.g., *"matches for 'theme'"*). Chips below input are alternate matches.
4. **Demo active** — canvas fills with the mounted demo. Slim top strip (~40px) shows demo title + back-to-gallery affordance. Sidebar timeline shows this demo as the topmost card.
5. **No-match** — gallery view with a single Caveat-script line *"nothing found — try a category like 'theme' or 'tabs'"* + the full catalog rendered below as fallback. Never a dead-end.

### State transitions

```
[Welcome (full canvas, no sidebar)]
   │ user types + Enter
   ▼
[Migrating (one-shot 600ms)]
   │ animation completes
   ▼
[Active (sidebar visible, canvas = gallery | demo)]
   ├── pick suggestion chip → demo mounts
   ├── pick gallery card → demo mounts
   ├── type new query → sidebar gallery refreshes (no migration)
   └── click timeline card → scroll-up + demo remount
```

Migration is **one-shot per session**. Reload returns to welcome only if `koan.history` is empty; with history, the sidebar starts visible and welcome is skipped.

### Brand-mark transition

The enso ○ starts as a 120px centerpiece on welcome, then transitions to a 24px top-left mark on migration. One-way (does not return to center on clear-input). Wrapped in `prefers-reduced-motion: reduce` — falls back to instant state change.

### Hand-drawn arrows

`AnnotationArrow.svelte` renders an SVG path with `stroke="var(--color-accent-z5)"` (or primary), `stroke-linecap="round"`, slight wiggle. Optional Caveat-script label parameter. Used on welcome state, inside the theme wizard for callouts, and available to any future demo.

### Caveat font

Loaded via `@fontsource/caveat` (added to `demo/package.json`). Imported once in `app.css`. Used only inside `AnnotationArrow` and welcome copy — scoped, not site-wide. `font-display: swap` by default; switch to `optional` if welcome-state layout jank is observed.

## 6. Chat Interaction & Match Logic

### Input behavior

- Single textarea, autosize 1–4 rows.
- Enter submits; Shift+Enter inserts a newline.
- Placeholder rotates through Caveat-script hints every ~4s while idle: *"try 'theme'…"*, *"or 'tabs'…"*, *"or 'toast'…"*.
- On submit: query lands in the store, minisearch runs synchronously, results render.

### Match logic (`match.svelte.ts`)

- minisearch index built once at module load from `catalog.ts`.
- Indexed fields with boosts: `title^3`, `keywords^2`, `description^1`.
- Tokenizer: default + lowercase + diacritic strip.
- Fuzzy: `fuzzy: 0.2` (allows ~20% edit distance).
- Prefix: `prefix: true` (partial words match).
- `$derived` returns top 6 matches above threshold. Empty array → no-match state.
- Single best match with score > 0.9 → mount the demo directly (skips gallery). Multiple matches or lower scores → render gallery.

### Suggestion chips

- Always exactly 3 chips under the input.
- Priority: if `query.length > 0`, top 3 minisearch matches; else, 3 unvisited demos picked deterministically by category rotation.
- Clicking a chip = same as submitting that query and picking the top match. Chip animates fade-out + small trail toward the timeline.
- Visited demos leave the chip rotation for the session (`visitedThisSession: Set<string>` in store; resets next session).

### Timeline

- Each demo mount appends `{ demoId, mountedAt, query }` to `koan.history`.
- Re-mounting an already-visited demo moves its entry to the top instead of duplicating.
- Click a timeline card → scroll-up animation on canvas (fade-out + fade-in), demo remounts with its original `query` context preserved.

### Keyboard

- `Cmd/Ctrl+K` from anywhere — focus the input.
- `Esc` while input focused with empty query — blur input.
- `Esc` from active demo — return to gallery (sidebar stays visible).
- `Tab` / `Shift+Tab` cycle through chips and timeline cards via Rokkit's existing navigator pattern.

### Accessibility

- ARIA live region announces match count: *"3 matches for theme"*.
- Brand-mark transition respects `prefers-reduced-motion: reduce`.
- Caveat annotations marked `aria-hidden="true"` (decorative); the same intent is available as plain semantic text nearby for screen readers.

## 7. Demo Catalog

### Demo metadata schema

```ts
export type DemoMeta = {
  id: string                       // kebab slug, also URL param
  title: string                    // gallery card + timeline label
  description: string              // one-line, gallery card
  keywords: string[]               // minisearch synonyms
  category: 'theme' | 'navigation' | 'feedback' | 'forms' | 'data'
  icon: string                     // kanji for Phase 1 (icon swap in later phase)
  load: () => Promise<typeof SvelteComponent>           // dynamic import, the demo
  preview?: () => Promise<typeof SvelteComponent>       // optional richer preview tile
}
```

### Catalog

Static array of `DemoMeta` imports in `catalog.ts`. minisearch index built at module load. Adding a demo later = create a folder + add one import line.

### Lazy loading

`load()` is a dynamic import — demo bundles split off the shell. Welcome → first-paint stays minimal even as the catalog grows.

### Demo lifecycle

- Pick demo → await `meta.load()` → mount via Svelte 5 dynamic component pattern. Shell renders a thin loading placeholder if resolution takes >100ms.
- Demos are self-contained — they read the global `theme` store but do not share other state with the shell.
- Optional `seed` prop for deep-linking. Phase 1: only the theme wizard uses this (`?theme=<id>`).
- On unmount, demo state is discarded. Theme wizard exception: in-progress wizard state persists to localStorage so picking it again resumes where the user left off.

### Preview rendering

If no `preview()`, the gallery `PreviewCard` renders a default tile: kanji icon (large), title, description, "tap to open" hint in Caveat. If `preview()` exists, the card renders that miniature component. Phase 1 ships defaults only.

### Phase 1 entries

| id              | title          | icon | category | keywords (synonyms in index)                                                                       |
| --------------- | -------------- | ---- | -------- | -------------------------------------------------------------------------------------------------- |
| `theme-wizard`  | Theme Builder  | 染   | theme    | theme, themes, customize, style, skin, palette, color, colors, dark, light, density, mode, design  |
| `tabs`          | Tabs           | 章   | navigation | tabs, tab, tabbed, panels, sections, orientation, vertical, horizontal, switch                   |
| `toasts`        | Toasts         | 報   | feedback | toast, toasts, notification, notifications, alert, alerts, message, snackbar, banner               |

Descriptions:

- **Theme Builder** — *"Compose a Rokkit theme: skin, density, mode, and roundedness. Save & download."*
- **Tabs** — *"Tabbed panels — horizontal, vertical, pill, and underlined orientations."*
- **Toasts** — *"Trigger toast notifications — success, warning, error, and info variants."*

### Tabs and Toasts demo content

- **Tabs demo** — three side-by-side cards showing horizontal Tabs (top-aligned), vertical Tabs (left-aligned), and pill Tabs. Each has 3 panels with placeholder Caveat-script content. Reads from a small static dataset. Target < 100 LOC.
- **Toasts demo** — row of 4 `<Button>`s: "Show success", "Show warning", "Show error", "Show info". Click triggers `@rokkit/ui` Toast with the corresponding tone. Single `<ToastProvider>` mounted at the demo root. Brief Caveat note at the bottom: *"toasts auto-dismiss after 4s — click X to dismiss early"*. Target < 100 LOC.

Both demos exist to validate the shell, not to be exhaustive component docs. Comprehensive component pages arrive when `sites/learn` content migrates in later phases.

## 8. Theme Builder Wizard

The Phase 1 hero showcase. Built using `@rokkit/forms` FormBuilder + the existing StepIndicator component, so it doubles as a real exercise of those components.

### Three steps

1. **Start — pick a starting point.** Grid of ~6 preset cards (zen-sumi, minimal, ocean, violet, rose, emerald — from `rokkit.config.js` skins + style presets). Each card shows: skin name, 5-swatch color strip, "Aa" sample in the preset's font, mini button + chip preview. Picking a card seeds steps 2–3 with sensible defaults. Optional "Start blank" card for power users.
2. **Tune — three chip groups.** All on one screen with a live preview pane:
   - **Mode**: Light / Dark / Auto (sets the *default mode* applied with this theme; the user can also flip mode at runtime via the sidebar toggle).
   - **Density**: Compact / Normal / Comfortable.
   - **Roundedness**: Sharp / Soft / Rounded / Pill.
   - Each chip shows a small visual marker conveying its character (e.g., 3-bar glyph for density, corner-glyph for roundedness).
   - Live preview pane renders a small Rokkit component set (button row, input, card, list, toast trigger) that re-renders at the selected density/roundedness/mode. Single-value preview (no side-by-side comparison in Phase 1).
3. **Save — name & export.** Text input for theme name (required, default *"My Theme N"*). Three actions:
   - **Save** — persists to `koan.themes`, sets `koan.theme.active` to its id, applies live. Toast confirms.
   - **Download** — opens a `Modal` with a `Tabs` toggle: "rokkit.config.js snippet" and "CSS variables". Copy-to-clipboard button on each. File-download writes `<themeName>.rokkit.config.js` or `<themeName>.theme.css`.
   - **Back to edit** — returns to a prior step (StepIndicator allows clicking any prior step). All wizard state preserved.

### State model

```ts
type WizardState = {
  preset: string                       // 'zen-sumi' | 'ocean' | ... | 'blank'
  mode: 'light' | 'dark' | 'auto'
  density: 'compact' | 'normal' | 'comfortable'
  roundedness: 'sharp' | 'soft' | 'rounded' | 'pill'
  name: string
}

type SavedTheme = WizardState & {
  id: string
  createdAt: string
  updatedAt: string
}
```

### Live application

Each field change writes to a `$state` that updates CSS variables on `document.documentElement` immediately. The chat sidebar, timeline, and rest of Koan re-style as the user picks — reinforcing "this is real, not a mock." Save just persists; live application is already in effect.

### Deep-linking

- `?demo=theme-wizard` — loads from `koan.theme-wizard.draft` if present, otherwise from preset defaults.
- `?demo=theme-wizard&theme=<id>` — loads the saved theme for editing.

### Validation

Phase 1 keeps it minimal — only the `name` field is required at step 3. Preset, mode, density, roundedness all have valid defaults.

### Recovery from a broken saved theme

If the active theme references a palette that no longer exists in `rokkit.config.js`, the shell falls back to the default skin at boot and queues a one-time toast: *"Your saved theme couldn't be applied — opening Theme Builder."* Then it deep-links to the wizard with the broken theme loaded for repair.

## 9. New Components (built in `demo/` for Phase 1)

These seven components are built inside `demo/src/lib/koan/components/` with generalizable `@rokkit/ui`-shape APIs from the start. They get promoted to `@rokkit/ui` in Phase 1.5.

### `AnnotationArrow`

Hand-drawn SVG arrow with optional Caveat-script label, configurable curve and direction. Useful for callouts, onboarding hints, empty-state cues.

- Props: `direction` ('up' | 'down' | 'left' | 'right' | 'curve-tl' | …), `curve` (number, controls path arc), `label` (string), `labelFont` (default Caveat).
- Stroke colored via semantic token (`accent-z5` default).

### `BrandMark`

Animated brand glyph + label slot with a `compact` mode toggle. Useful for app shells, hero sections, splash screens.

- Props: `glyph` (string or snippet), `label` (string), `compact` (bool — drives transition between hero and inline modes).
- Animated transition between modes (uses Svelte motion).
- Reduced-motion aware.

### `EmptyState`

Generic empty / welcome pattern. Composes `AnnotationArrow` as a slot.

- Props: `icon` (string or snippet), `title`, `description`, `action` (slot), `annotation` (slot — for arrow + Caveat copy).

### `Gallery`

Searchable card grid. Wraps Rokkit's list/grid layout primitives with built-in card rendering via snippet.

- Props: `items: T[]`, `fields: { id, title, description, icon }`, `query?: string` (optional bind, applies a fuzzy filter), `card` (snippet for custom card render), `cols` (responsive cols).
- Built-in minisearch integration optional — accept either pre-filtered `items` or a `query` to filter internally.

### `ChatPanel`

Chat-sidebar pattern: input + suggestion chips + history/timeline list. Slot-driven content.

- Slots: `brandMark`, `input`, `suggestions`, `history`, `footer`.
- Bind: `query` (string).
- Events: `submit` (query string), `clear`.

### `ShowcaseCanvas`

Grid-background container for showcase/playground content. Optional dot-grid pattern, optional toolbar slot.

- Props: `grid` (bool, default true), `gridSize` (number, default 24), `gridColor` (CSS color, default `var(--canvas-grid-color)`), `toolbar` (slot), `padding` (token name).

### `TimelineList`

List of timeline entries with icon, title, timestamp. Wraps `<List>` with a default snippet.

- Props: `items`, `fields: { id, icon, title, timestamp }`, `onselect` callback, `relativeTime` (bool — formats "2m ago" vs absolute).

### Components that stay Koan-local

| Component | Rationale                                                          |
| --------- | ------------------------------------------------------------------ |
| `Shell`   | Koan-specific 2-pane layout composing `ChatPanel` + `ShowcaseCanvas` |
| `Welcome` | Koan-specific composition of `EmptyState` + `AnnotationArrow` with brand copy |
| `Canvas`  | Koan-specific state-aware switcher (gallery / active demo) wrapping `ShowcaseCanvas` |

## 10. Promotion Plan (Phase 1.5)

For each of the seven generalizable components:

1. Move source from `demo/src/lib/koan/components/<Name>.svelte` to `packages/ui/src/<name>/`.
2. Split into idiomatic `@rokkit/ui` structure: `<Name>.svelte`, `types.ts`, `index.js`.
3. Update Koan imports from `$lib/koan/components/<Name>` to `@rokkit/ui`.
4. **Unit tests** — vitest covering prop behavior, edge cases, accessibility roles.
5. **e2e tests** — extend or reuse the Koan demo flows in `demo/e2e/` that already exercise the component.
6. **llms.txt** — documentation in the standard package format. Link to the Koan demo as the canonical live example.
7. **Theme CSS** — zen-sumi style at minimum (`packages/themes/src/zen-sumi/<name>.css`). Other styles deferred to their own theme passes.
8. **Skip playground page** on `sites/learn` — Koan demos are the canonical showcase. The component's llms.txt links to the appropriate Koan deep-link.

Phase 1.5 ships as a single coordinated commit set after Phase 1 stabilizes in develop.

## 11. Persistence, State Stores & Boot Flow

### Stores (Svelte 5 runes-based)

```ts
// store.svelte.ts — runtime shell state (in-memory only)
export const koan = $state({
  query: '',
  matches: [] as DemoMeta[],          // $derived
  suggestions: [] as DemoMeta[],
  activeDemoId: null as string | null,
  history: [] as TimelineEntry[],
  visitedThisSession: new Set<string>(),
})

// theme.svelte.ts — extends existing theme store
export const theme = $state({
  active: null as SavedTheme | null,
  saved: [] as SavedTheme[],
  draft: null as WizardState | null,
  mode: 'auto' as 'light' | 'dark' | 'auto',
})
```

### Persisted keys (localStorage)

| Key                          | Shape                  | Written by                          |
| ---------------------------- | ---------------------- | ----------------------------------- |
| `koan.history`               | `TimelineEntry[]`      | shell, after each demo mount        |
| `koan.theme.active`          | `themeId` (string)     | wizard save, mode toggle            |
| `koan.themes`                | `SavedTheme[]`         | wizard save                         |
| `koan.theme-wizard.draft`    | `WizardState`          | wizard, on every field change (throttled) |
| `koan.mode`                  | `'light'` \| `'dark'` \| `'auto'` | sidebar mode toggle           |

`query` and `activeDemoId` are deliberately not persisted — URL deep-linking serves that purpose.

### Persistence adapter (`persistence.ts`)

Single module: `read<T>(key, schema)`, `write(key, value)`, `clear(key)`. Inline schema check (presence + type), returns `null` on mismatch — corruption-tolerant. Writes throttled to ~250ms for the wizard draft (avoids storage thrash on slider/picker drags). All localStorage access guarded for SSR.

### Boot sequence

```
1. Read koan.mode → apply to documentElement.dataset.mode
2. Read koan.theme.active → look up in koan.themes → apply CSS variables
   - If active theme references missing palette → fallback + recovery toast on mount
3. Read koan.history → populate timeline; if non-empty, skip welcome state
4. Read koan.theme-wizard.draft → keep in theme.draft (consumed by wizard on mount)
5. Parse URL params:
   - ?demo=<id> → mount that demo, mark visited
   - ?q=<query> → set query, show gallery
   - ?theme=<themeId> on theme-wizard → seed wizard
6. Build minisearch index from catalog (synchronous)
7. Render
```

### Flash prevention

Mode + active theme are applied via an inline script in `app.html` before SvelteKit hydrates — same pattern as the existing `feat(unocss): theme flash-prevention hook for SvelteKit` (commit `3cba1a04`). Extend that hook to read `koan.theme.active` and apply its CSS variables before first paint.

### Reset

A discreet "Reset Koan" footer link in the sidebar clears all `koan.*` keys and reloads. Useful for testing and clean-slate scenarios.

## 12. Testing

### Unit (vitest)

- `match.svelte.ts` — query → expected demo ids, synonym coverage, empty-query, no-match.
- `persistence.ts` — schema validation, round-trip, corruption recovery (returns null).
- Wizard state derivations — `WizardState` → CSS variable map.

### e2e (Playwright in `demo/e2e/`)

- First-visit flow: welcome → type "theme" → submit → migration → wizard mounts → walk through 3 steps → save → page restyles → toast.
- Tabs and Toasts demos render and respond to interaction.
- Timeline shows entries; clicking restores a demo.
- URL deep-link: `?demo=theme-wizard` mounts directly with sidebar visible.
- Reduced-motion: brand-mark transition is instant under `prefers-reduced-motion: reduce`.

### Visual regression

Reuse the existing baseline plan (`docs/superpowers/plans/2026-04-27-playwright-visual-baseline.md`). Capture baselines for: welcome state, gallery, each demo, both modes.

### Lint & accessibility

- Zero new lint errors.
- Axe scan via Playwright on each major state — fail build on serious violations.
- Keyboard-only walkthrough scripted in e2e: Cmd+K → type → Tab through chips → Enter → Tab through wizard → save.

## 13. Open Items (to be decided during implementation)

1. **Sidebar mode toggle visual style** — small `Switch` vs. icon-only button. Decide during build.
2. **Theme-wizard preview pane component set** — concrete picks for which components appear (button, input, card, list, toast trigger).
3. **Recovery toast wording** — Caveat-script vs. plain prose for the "broken theme" recovery.
4. **`(legacy)` Sensei pages** — move vs. delete. Spec says move; delete is also acceptable if any page fails build under the new structure.

## 14. Known Risks

- **minisearch bundle size** — verify tree-shaking. Fallback: smaller fuzzy-search lib (~2KB) or hand-rolled inverted index.
- **Caveat font flash** — verify no layout jank on welcome state. Switch to `font-display: optional` if needed.
- **Animation perf on lower-end machines** — 600ms migration is non-trivial. Apply/remove `will-change` correctly. Test with CPU throttle.

## 15. Future Phases (signposted, not designed here)

Each of the following will need its own spec:

- Phase 2 wizard expansion: color step, advanced per-mode overrides, density numeric tuning, side-by-side comparison.
- Markdown prose docs alongside demos.
- Transformers.js smart-match with model-load progress as a showcase.
- `sites/learn` migration: per-segment specs for component reference, llms.txt routes (continuity matters — downstream agents consume these), story pages, forms docs, charts docs, tooling docs.
- New demos (each likely its own mini-spec if non-trivial): forms (overview, schema, multi-step, validation, lookup, conditional), charts (each chart type), tree, table, tree-table, code viewer, carousel, animation/effects, ProgressRail, multi-step navigation.
- Mobile responsive layout for Koan.
- Icon system migration — kanji glyphs in `meta.icon` swap to icon-class strings once the icon mapping is finalized.
- Optional `apps/` restructure: `site/` → `apps/learn/`, `demo/` → `apps/demo/`.
