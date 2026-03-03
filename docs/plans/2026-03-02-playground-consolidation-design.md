# Playground → Learn Site Consolidation

**Goal:** Merge all playground functionality into the learn site and remove `sites/playground/`, eliminating dual-site maintenance.

**Architecture:** Enhance the learn site's `PlaySection` component with per-page theme switching (currently only in playground's `Playground.svelte`). Migrate all 31 playground component pages as play pages under learn's existing `(learn)/components/{name}/play/` route structure. Consolidate all e2e tests into learn's `e2e/` directory with 4-theme x 2-mode visual snapshot support.

## Current State

| Site | Component pages | E2E tests | Theme switching | Stories |
|------|----------------|-----------|-----------------|---------|
| Playground | 31 | 11 spec files | Per-page (4 themes) | None |
| Learn | 29 (articles) + 8 play pages | 8 spec files | Site-wide only | StoryBuilder |

**8 components exist only in playground** (no learn page): floating-action, floating-navigation, forms, palette-manager, reveal, shine, tilt, timeline.

**4 components overlap** (both learn play page and playground page): list, menu, select, tabs — playground versions are richer in all cases (TypeScript, multiselect support for list, better metadata).

## Design

### 1. Enhance PlaySection with Theme Selector

Add a theme selector to `PlaySection.svelte` matching `Playground.svelte`'s UI:
- 4 theme buttons (rokkit, minimal, material, glass) in a "Theme" section above "Properties"
- Uses learn's existing `ThemeManager` from `$lib/theme.svelte.js`
- `data-style` attribute on preview area reflects selected theme for visual snapshots
- E2e helper `setTheme()` clicks these buttons (same selector pattern as playground)

### 2. Migrate Playground Pages → Learn Play Pages

**For 8 playground-only components** — create minimal learn entries:
- `meta.json` — title, icon, category for sidebar discovery
- `+layout.svelte` — Learn/Play toggle
- `+page.svelte` — minimal learn page (description only, no stories yet)
- `play/+page.svelte` — migrated playground content, using `PlaySection` instead of `Playground`

**For 4 overlapping components** (list, menu, select, tabs) — replace existing learn play pages with playground versions (playground is richer).

**For 14 components with learn page but no play page** — create new play pages from playground content:
- accordion, breadcrumbs, button, card, carousel, code, lazy-tree, pill, progress, range, rating, stepper, switch, table

**For 5 learn-only components** (calendar, drop-down, icon, item, message) — no playground equivalent exists. Keep as-is; add play pages only if applicable.

### 3. Adapt Playground Content to PlaySection

Each playground page uses this pattern:
```svelte
<Playground title="X" description="Y">
  {#snippet preview()} ... {/snippet}
  {#snippet controls()} ... {/snippet}
</Playground>
```

Migration to learn play page:
```svelte
<PlaySection>
  {#snippet preview()} ... {/snippet}
  {#snippet controls()} ... {/snippet}
</PlaySection>
```

- Remove `title`/`description` props (learn layout provides these via meta.json)
- Replace `import Playground from '$lib/Playground.svelte'` with `import PlaySection from '$lib/components/PlaySection.svelte'`
- Keep all `FormRenderer` + `InfoField` controls
- Keep all component demos and state logic

### 4. E2E Test Consolidation

**Merge helpers:** Add `setTheme()`, `themes` array to learn's `e2e/helpers.ts`. Adapt selector to match PlaySection's theme buttons.

**Per-component test merge strategy:**
- Keep learn page tests (story viewer, Learn/Play toggle navigation)
- Port playground interaction tests (keyboard, mouse) — use `.preview-area` scoping
- Port 4-theme x 2-mode visual snapshot tests
- Deduplicate where learn and playground tests overlap (toggle, list, select, tabs, upload-*)
- Update all URLs: `/components/X` → `/components/X/play`

**Playground-only test** (sidebar-nav.spec.ts) — drop; learn site has its own sidebar.

**Snapshots:** Regenerate all from scratch (learn site chrome differs from playground).

### 5. Cleanup

- Delete `sites/playground/` entirely
- Workspace config (`sites/*` glob) automatically stops including it
- Update documentation references:
  - `CLAUDE.md` line 65: playground e2e command → learn e2e command
  - `agents/memory.md`: remove playground reference
  - `agents/references.md`: remove playground reference
- ESLint config (`eslint.config.mjs` lines 147-151): rule already uses `sites/*/src/routes/components/**` glob — still works

### 6. Gap Documentation

Create backlog item documenting remaining coverage gaps (separate from this migration):

| Component | Stories | llms.txt | Learn article | Play page | E2E |
|-----------|:-------:|:--------:|:-------------:|:---------:|:---:|
| Code | Y | - | Y | migrated | - |
| Carousel | Y | - | Y | migrated | - |
| Pill | Y | - | Y | migrated | - |
| FloatingAction | - | Y | new (minimal) | migrated | - |
| FloatingNavigation | - | - | new (minimal) | migrated | - |
| Timeline | - | - | new (minimal) | migrated | - |
| Reveal | - | - | new (minimal) | migrated | - |
| Shine | - | - | new (minimal) | migrated | - |
| Tilt | - | - | new (minimal) | migrated | - |
| PaletteManager | - | - | new (minimal) | migrated | - |
| FormRenderer | - | - | new (minimal) | migrated | - |
| Grid | - | - | - | - | - |
| SearchFilter | - | Y | - | - | - |
| Connector | - | - | - | - | - |

## File Impact

| Action | Count | Description |
|--------|-------|-------------|
| Modified | 3 | PlaySection.svelte, e2e/helpers.ts, docs references |
| New learn pages | ~32 | meta.json + layout + page + play for 8 new components |
| Migrated play pages | ~28 | Playground → learn play pages for all 28 remaining components |
| Merged e2e tests | ~11 | Playground e2e → learn e2e (consolidated) |
| Deleted | entire site | `sites/playground/` |
