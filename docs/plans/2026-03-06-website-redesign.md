# Website Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the learn site to feature-first navigation, add a real-world preview app (Nexus), and clean up dead sites.

**Architecture:** The learn site gains a `(preview)` route group alongside existing `(learn)` and `(play)`. The `(learn)` sidebar is rebuilt from a flat component list to feature pillar groups by moving existing guide pages into pillar subfolders and adding overview pages. The `(preview)` group renders a fictional project management app ("Nexus") with a floating theme panel.

**Tech Stack:** SvelteKit, Svelte 5 runes, `@rokkit/ui`, `@rokkit/forms`, `@rokkit/chart`, `@rokkit/states`, `@rokkit/actions`, UnoCSS

---

## Background: How the nav system works

The sidebar nav is driven entirely by `meta.json` files. The `+layout.js` uses `import.meta.glob('./**/meta.json')` then calls `getSections()` from `$lib/stories.js`.

- `category: "guide"` → flat top-level item in sidebar
- Any other category → collapsible group, named by that category
- `depth === 1` (file at `./section/meta.json`) → **group header** (title, icon, description)
- `depth === 2` (file at `./section/child/meta.json`) → **group child** (nav item)
- `order` → sort order within category

**To move a page into a group:** move its folder inside the group folder so depth becomes 2, and update its `category` to match the group.

**Key files:**
- Nav layout: `sites/learn/src/routes/(learn)/docs/+layout.js`
- Nav builder: `sites/learn/src/lib/stories.js`
- Sidebar component: `sites/learn/src/routes/(learn)/docs/Sidebar.svelte`
- Root layout: `sites/learn/src/routes/+layout.svelte`

All paths below are relative to `solution/` unless stated otherwise.

---

## Task 1: Cleanup — delete dead sites, rename design doc

**Files:**
- Delete: `sites/quick-start/` (entire directory)
- Delete: `sites/sample/` (entire directory)
- Rename: `docs/design/05-website.md` → `docs/design/09-website.md` (repo root)

**Step 1: Delete sites**
```bash
rm -rf sites/quick-start sites/sample
```

**Step 2: Rename design doc**
```bash
cd /Users/Jerry/Developer/rokkit
git mv docs/design/05-website.md docs/design/09-website.md
```

**Step 3: Verify no broken references to old path**
```bash
cd /Users/Jerry/Developer/rokkit
grep -r "05-website" docs/ agents/ --include="*.md" -l
# Update any hits to use 09-website
```

**Step 4: Run tests**
```bash
cd solution && bun run test:ci
```
Expected: all pass (no code changed, only docs/sites)

**Step 5: Commit**
```bash
git add -A
git commit -m "chore: delete quick-start and sample sites, rename website design doc to 09"
```

---

## Task 2: Getting Started pillar

Currently: `docs/introduction/` and `docs/getting-started/` are separate flat guide pages.
Goal: make "Getting Started" a collapsible group containing introduction, quick-start/installation sub-pages.

**Files (all under `sites/learn/src/routes/(learn)/docs/`):**
- Create: `getting-started/meta.json` ← **replaces** current `getting-started/` content (group header)
- Move: current `getting-started/` content → `getting-started/installation/`
- Move: `introduction/` → `getting-started/introduction/`
- Update: both moved meta.json files

**Step 1: Create group-level meta.json for getting-started**

The current `docs/getting-started/` has `meta.json` + `+page.svelte`. We need it to become the GROUP HEADER (no page, just a nav label).

First, move the existing page content to a child:
```bash
cd sites/learn/src/routes/\(learn\)/docs
mv getting-started/+page.svelte getting-started/_old_page.svelte
```

Then overwrite `getting-started/meta.json`:
```json
{
  "title": "Getting Started",
  "description": "Install Rokkit and build your first component",
  "icon": "i-solar:rocket-bold-duotone",
  "category": "getting-started",
  "order": 1
}
```

**Step 2: Create getting-started/installation/ from old getting-started page**
```bash
mkdir -p sites/learn/src/routes/\(learn\)/docs/getting-started/installation
mv sites/learn/src/routes/\(learn\)/docs/getting-started/_old_page.svelte \
   sites/learn/src/routes/\(learn\)/docs/getting-started/installation/+page.svelte
```

Create `getting-started/installation/meta.json`:
```json
{
  "title": "Installation",
  "description": "Install Rokkit and configure your SvelteKit project",
  "icon": "i-solar:box-bold-duotone",
  "category": "getting-started",
  "order": 2
}
```

**Step 3: Move introduction/ → getting-started/introduction/**
```bash
mv sites/learn/src/routes/\(learn\)/docs/introduction \
   sites/learn/src/routes/\(learn\)/docs/getting-started/introduction
```

Update `getting-started/introduction/meta.json`:
```json
{
  "title": "Introduction",
  "description": "What Rokkit is and why data-first component design matters",
  "icon": "i-solar:book-bold-duotone",
  "category": "getting-started",
  "order": 1,
  "tags": ["introduction", "overview", "data-first", "svelte"]
}
```

**Step 4: Create getting-started/quick-start/ (placeholder)**

Create `getting-started/quick-start/meta.json`:
```json
{
  "title": "Quick Start",
  "description": "Build a data-driven list, select, and form in under 5 minutes",
  "icon": "i-solar:play-circle-bold-duotone",
  "category": "getting-started",
  "order": 3
}
```

Create `getting-started/quick-start/+page.svelte`:
```svelte
<article data-article-root>
  <div data-card class="text-center py-12">
    <span class="i-solar:hourglass-bold-duotone text-4xl text-surface-z4 block mb-4"></span>
    <p class="text-surface-z5">Quick start guide coming soon.</p>
  </div>
</article>
```

**Step 5: Run tests**
```bash
cd solution && bun run test:ci
```

**Step 6: Commit**
```bash
git add sites/learn/src/routes/\(learn\)/docs/getting-started/
git commit -m "feat(docs): restructure getting-started as feature pillar group"
```

---

## Task 3: Data Binding pillar

**Files (under `sites/learn/src/routes/(learn)/docs/`):**
- Create: `data-binding/meta.json` (group header)
- Create: `data-binding/overview/+page.svelte` + `meta.json`
- Move: `field-mapping/` → `data-binding/field-mapping/` + update meta.json
- Create: `data-binding/data-sources/` (placeholder)

**Step 1: Create data-binding group**
```bash
mkdir -p sites/learn/src/routes/\(learn\)/docs/data-binding
```

Create `data-binding/meta.json`:
```json
{
  "title": "Data Binding",
  "description": "How Rokkit maps any data shape to components without transformation",
  "icon": "i-solar:database-bold-duotone",
  "category": "data-binding",
  "order": 2
}
```

**Step 2: Create overview page**

Create `data-binding/overview/meta.json`:
```json
{
  "title": "Overview",
  "description": "The data-first philosophy: components adapt to your data, not the other way around",
  "icon": "i-solar:database-bold-duotone",
  "category": "data-binding",
  "order": 1
}
```

Create `data-binding/overview/+page.svelte`:
```svelte
<article data-article-root>
  <p>
    Rokkit is built around one principle: your data should drive your UI, not the other way around.
    Every selection component — <code>List</code>, <code>Select</code>, <code>Tree</code> — works with
    your data as-is via field mapping, not by forcing you to reshape it.
  </p>
  <h2>The Problem</h2>
  <p>
    Most component libraries require your data to match a specific shape. A <code>Select</code>
    needs <code>&#123; label, value &#125;</code>, a <code>Tree</code> needs <code>&#123; name, children &#125;</code>.
    Every component has its own convention, so you write adapters everywhere.
  </p>
  <h2>The Rokkit Approach</h2>
  <p>
    Instead, every Rokkit component accepts a <code>fields</code> prop that maps your keys to the
    component's semantic fields. Your <code>&#123; name, id, nested &#125;</code> data works directly —
    no transformation, no adapter layer.
  </p>
  <p>See <a href="/docs/data-binding/field-mapping">Field Mapping</a> for full reference.</p>
</article>
```

**Step 3: Move field-mapping into data-binding**
```bash
mv sites/learn/src/routes/\(learn\)/docs/field-mapping \
   sites/learn/src/routes/\(learn\)/docs/data-binding/field-mapping
```

Update `data-binding/field-mapping/meta.json` (change category, add order):
```json
{
  "title": "Field Mapping",
  "description": "Map any data shape to components with the fields prop",
  "icon": "i-solar:map-arrow-right-bold-duotone",
  "category": "data-binding",
  "order": 2,
  "tags": ["fields", "mapping", "data", "props", "adapter"]
}
```

**Step 4: Create data-sources placeholder**

Create `data-binding/data-sources/meta.json`:
```json
{
  "title": "Data Sources",
  "description": "Connecting components to async data, paginated lists, and lazy-loaded trees",
  "icon": "i-solar:cloud-download-bold-duotone",
  "category": "data-binding",
  "order": 3
}
```

Create `data-binding/data-sources/+page.svelte`:
```svelte
<article data-article-root>
  <div data-card class="text-center py-12">
    <span class="i-solar:hourglass-bold-duotone text-4xl text-surface-z4 block mb-4"></span>
    <p class="text-surface-z5">Data sources documentation coming soon.</p>
  </div>
</article>
```

**Step 5: Commit**
```bash
git add sites/learn/src/routes/\(learn\)/docs/data-binding/ \
        sites/learn/src/routes/\(learn\)/docs/field-mapping  # removed
git commit -m "feat(docs): add data-binding feature pillar"
```

---

## Task 4: Composability pillar

**Files (under `sites/learn/src/routes/(learn)/docs/`):**
- Create: `composability/meta.json`
- Create: `composability/overview/`
- Move: `snippets/` → `composability/snippets/`

**Step 1: Create composability group**

Create `composability/meta.json`:
```json
{
  "title": "Composability",
  "description": "Extend and customize any component via Svelte snippets without forking",
  "icon": "i-solar:layers-bold-duotone",
  "category": "composability",
  "order": 3
}
```

**Step 2: Create overview page**

Create `composability/overview/meta.json`:
```json
{
  "title": "Overview",
  "description": "The snippet model: customize rendering without modifying components",
  "icon": "i-solar:layers-bold-duotone",
  "category": "composability",
  "order": 1
}
```

Create `composability/overview/+page.svelte`:
```svelte
<article data-article-root>
  <p>
    Every Rokkit component exposes named snippet slots. Pass a snippet to replace any part of the
    component's rendering — item content, group headers, empty states — without forking the component
    or fighting with CSS overrides.
  </p>
  <h2>Why Snippets</h2>
  <p>
    Svelte 5 snippets are the clean equivalent of render props or slot content. They keep your
    customization logic co-located with your usage, not inside the library.
  </p>
  <p>See <a href="/docs/composability/snippets">Snippets & Customization</a> for full reference and examples.</p>
</article>
```

**Step 3: Move snippets into composability**
```bash
mv sites/learn/src/routes/\(learn\)/docs/snippets \
   sites/learn/src/routes/\(learn\)/docs/composability/snippets
```

Update `composability/snippets/meta.json`:
```json
{
  "title": "Snippets & Customization",
  "description": "Customize component rendering with Svelte snippets",
  "icon": "i-solar:code-bold-duotone",
  "category": "composability",
  "order": 2,
  "tags": ["snippets", "customize", "render", "templates", "slots"]
}
```

**Step 4: Commit**
```bash
git add sites/learn/src/routes/\(learn\)/docs/composability/ \
        sites/learn/src/routes/\(learn\)/docs/snippets  # removed
git commit -m "feat(docs): add composability feature pillar"
```

---

## Task 5: Theming & Design pillar

**Files (under `sites/learn/src/routes/(learn)/docs/`):**
- Create: `theming/meta.json`
- Create: `theming/overview/`
- Move: `color-system/` → `theming/color-system/`
- Move: `styling/` → `theming/styling/`
- Create: `theming/density/` and `theming/whitelabeling/` (placeholders)

**Step 1: Create theming group**

Create `theming/meta.json`:
```json
{
  "title": "Theming & Design",
  "description": "Skins, color tokens, CSS architecture, and visual customization",
  "icon": "i-solar:palette-bold-duotone",
  "category": "theming",
  "order": 4
}
```

**Step 2: Create overview page**

Create `theming/overview/meta.json`:
```json
{
  "title": "Overview",
  "description": "Theme/layout CSS separation, data-attribute hooks, and the token system",
  "icon": "i-solar:palette-bold-duotone",
  "category": "theming",
  "order": 1
}
```

Create `theming/overview/+page.svelte`:
```svelte
<article data-article-root>
  <p>
    Rokkit separates layout CSS (structural) from theme CSS (visual). Components ship unstyled
    with <code>data-*</code> attribute hooks. Themes provide the visual layer — colors, radii,
    shadows — without touching structure.
  </p>
  <h2>Activating a theme</h2>
  <p>Add a data attribute to <code>&lt;html&gt;</code> and import the theme CSS:</p>
  <pre><code>&lt;html data-palette="rokkit" data-mode="dark"&gt;</code></pre>
  <p>
    See <a href="/docs/theming/color-system">Color System</a> and
    <a href="/docs/theming/styling">Styling</a> for full reference.
  </p>
</article>
```

**Step 3: Move color-system and styling**
```bash
mv sites/learn/src/routes/\(learn\)/docs/color-system \
   sites/learn/src/routes/\(learn\)/docs/theming/color-system
mv sites/learn/src/routes/\(learn\)/docs/styling \
   sites/learn/src/routes/\(learn\)/docs/theming/styling
```

Update `theming/color-system/meta.json` (change category, add order):
```json
{
  "title": "Color System",
  "description": "Semantic z-depth colors, surface palettes, and dark mode support",
  "icon": "i-solar:pallete-2-bold-duotone",
  "category": "theming",
  "order": 2,
  "tags": ["colors", "palette", "surface", "dark-mode", "semantic"]
}
```

Update `theming/styling/meta.json`:
```json
{
  "title": "Styling",
  "description": "Theme architecture, data-attribute hooks, and CSS customization",
  "icon": "i-solar:brush-bold-duotone",
  "category": "theming",
  "order": 3,
  "tags": ["styling", "themes", "css", "customization", "data-attributes"]
}
```

**Step 4: Create placeholder pages**

Create `theming/density/meta.json`:
```json
{
  "title": "Density Modes",
  "description": "Compact, default, and comfortable density modes with context inheritance",
  "icon": "i-solar:align-vertical-spacing-bold-duotone",
  "category": "theming",
  "order": 4
}
```

Create `theming/density/+page.svelte` and `theming/whitelabeling/+page.svelte`:
```svelte
<article data-article-root>
  <div data-card class="text-center py-12">
    <span class="i-solar:hourglass-bold-duotone text-4xl text-surface-z4 block mb-4"></span>
    <p class="text-surface-z5">Coming soon.</p>
  </div>
</article>
```

Create `theming/whitelabeling/meta.json`:
```json
{
  "title": "Whitelabeling",
  "description": "Full visual replacement via skin, typography, icon, and shape tokens",
  "icon": "i-solar:magic-stick-bold-duotone",
  "category": "theming",
  "order": 5
}
```

**Step 5: Commit**
```bash
git add sites/learn/src/routes/\(learn\)/docs/theming/ \
        sites/learn/src/routes/\(learn\)/docs/color-system \
        sites/learn/src/routes/\(learn\)/docs/styling
git commit -m "feat(docs): add theming feature pillar"
```

---

## Task 6: Accessibility & i18n pillar

**Files:**
- Create: `accessibility/meta.json`
- Create: `accessibility/overview/`
- Move: `keyboard-navigation/` → `accessibility/keyboard-navigation/`
- Create: `accessibility/tooltips/` and `accessibility/i18n/` (placeholders)

**Step 1: Create accessibility group**

Create `accessibility/meta.json`:
```json
{
  "title": "Accessibility & i18n",
  "description": "Keyboard navigation, ARIA, screen reader support, and internationalization",
  "icon": "i-solar:accessibility-bold-duotone",
  "category": "accessibility",
  "order": 5
}
```

**Step 2: Create overview page**

Create `accessibility/overview/meta.json`:
```json
{
  "title": "Overview",
  "description": "The controller + navigator pattern: how Rokkit delivers keyboard navigation and ARIA",
  "icon": "i-solar:accessibility-bold-duotone",
  "category": "accessibility",
  "order": 1
}
```

Create `accessibility/overview/+page.svelte`:
```svelte
<article data-article-root>
  <p>
    All interactive Rokkit components support full keyboard navigation and ARIA out of the box.
    This is implemented via two primitives — controllers (state machines) and the
    <code>navigator</code> action (DOM binding) — that you can also use to build your own accessible components.
  </p>
  <h2>What you get for free</h2>
  <ul>
    <li>Arrow key navigation in all lists, trees, menus, and selects</li>
    <li>Home / End to jump to first / last item</li>
    <li>Enter / Space to select</li>
    <li>Escape to close dropdowns and restore focus</li>
    <li>ARIA roles, states, and properties on all interactive elements</li>
    <li>Focus management: focus returns to trigger on close</li>
  </ul>
  <p>See <a href="/docs/accessibility/keyboard-navigation">Keyboard Navigation</a> for the full keybinding reference.</p>
</article>
```

**Step 3: Move keyboard-navigation**
```bash
mv sites/learn/src/routes/\(learn\)/docs/keyboard-navigation \
   sites/learn/src/routes/\(learn\)/docs/accessibility/keyboard-navigation
```

Update `accessibility/keyboard-navigation/meta.json`:
```json
{
  "title": "Keyboard Navigation",
  "description": "Built-in keyboard navigation, ARIA support, and the navigator pattern",
  "icon": "i-solar:keyboard-bold-duotone",
  "category": "accessibility",
  "order": 2,
  "tags": ["keyboard", "navigation", "accessibility", "aria", "navigator"]
}
```

**Step 4: Create placeholder pages**

Create `accessibility/tooltips/meta.json`:
```json
{
  "title": "Tooltips",
  "description": "Hover and focus triggered tooltips linked via aria-describedby",
  "icon": "i-solar:chat-round-bold-duotone",
  "category": "accessibility",
  "order": 3
}
```

Create `accessibility/i18n/meta.json`:
```json
{
  "title": "Internationalization",
  "description": "Translatable strings, locale-aware formatting, and RTL layout support",
  "icon": "i-solar:global-bold-duotone",
  "category": "accessibility",
  "order": 4
}
```

Both placeholders use the same `+page.svelte` as in Task 2 Step 4 (coming soon card).

**Step 5: Commit**
```bash
git add sites/learn/src/routes/\(learn\)/docs/accessibility/ \
        sites/learn/src/routes/\(learn\)/docs/keyboard-navigation
git commit -m "feat(docs): add accessibility & i18n feature pillar"
```

---

## Task 7: Update Forms pillar + move remaining orphan pages

**Part A — Forms**

`docs/forms/` is currently a single guide page. Convert it to a proper group.

**Step 1: Convert forms to a group**

Update `docs/forms/meta.json`:
```json
{
  "title": "Forms",
  "description": "Schema-driven forms with validation, lookups, and field dependencies",
  "icon": "i-solar:document-text-bold-duotone",
  "category": "forms",
  "order": 6
}
```

The existing `docs/forms/+page.svelte` becomes the group's overview page (reachable at `/docs/forms`). No move needed — it's already at the right depth.

**Step 2: Add form sub-pages**

The `docs/forms/snippets/` child likely already has a meta.json. Update its category to `forms`.

Create `docs/forms/conditional-fields/meta.json`:
```json
{
  "title": "Conditional Fields",
  "description": "Show, hide, and disable fields based on other field values",
  "icon": "i-solar:branch-bold-duotone",
  "category": "forms",
  "order": 5
}
```

Create `docs/forms/multi-step/meta.json`:
```json
{
  "title": "Multi-Step Forms",
  "description": "Sequential steps with per-step validation and a step indicator",
  "icon": "i-solar:list-check-bold-duotone",
  "category": "forms",
  "order": 6
}
```

Both get the "coming soon" `+page.svelte`.

**Part B — Move remaining orphan guide pages**

These flat guide pages still need homes:
- `state-management/` → `utilities/state-management/` (update category to `utilities`, order: 5)
- `icons/` → `utilities/icons/` (update category to `utilities`, order: 6)

```bash
mv sites/learn/src/routes/\(learn\)/docs/state-management \
   sites/learn/src/routes/\(learn\)/docs/utilities/state-management
mv sites/learn/src/routes/\(learn\)/docs/icons \
   sites/learn/src/routes/\(learn\)/docs/utilities/icons
```

Update each meta.json to change `category` from `guide` to `utilities` and set appropriate `order`.

**Step 3: Run tests and commit**
```bash
cd solution && bun run test:ci
git add sites/learn/src/routes/\(learn\)/docs/forms/ \
        sites/learn/src/routes/\(learn\)/docs/utilities/ \
        sites/learn/src/routes/\(learn\)/docs/state-management \
        sites/learn/src/routes/\(learn\)/docs/icons
git commit -m "feat(docs): update forms pillar, move orphan pages into utilities"
```

---

## Task 8: Components section — add placeholder pages

Add placeholder doc pages for unbuilt components so they show in the nav.

**Files (under `sites/learn/src/routes/(learn)/docs/components/`):**
- Create: `badge/`, `avatar/`, `data-table/`, `stack/`, `grid/`, `divider/`

Each needs a `meta.json` and `+page.svelte`. Pattern:

`badge/meta.json`:
```json
{
  "title": "Badge",
  "description": "Status and count indicator attached to other elements",
  "icon": "i-component:badge",
  "category": "components",
  "order": 2
}
```

`badge/+page.svelte`:
```svelte
<article data-article-root>
  <div data-card class="text-center py-12">
    <span class="i-solar:hourglass-bold-duotone text-4xl text-surface-z4 block mb-4"></span>
    <p class="text-surface-z5">Badge component documentation coming soon.</p>
  </div>
</article>
```

Repeat for `avatar/`, `data-table/`, `stack/`, `grid/`, `divider/` with appropriate titles, descriptions, and order values.

Also update `components/meta.json` description to reflect new sub-categories:
```json
{
  "title": "Components",
  "description": "UI components for actions, navigation, data display, and layout",
  "category": "components",
  "order": 7
}
```

**Commit:**
```bash
git add sites/learn/src/routes/\(learn\)/docs/components/
git commit -m "feat(docs): add placeholder pages for unbuilt components"
```

---

## Task 9: Charts pillar

**Files (under `sites/learn/src/routes/(learn)/docs/`):**
- Create: `charts/meta.json` through `charts/animation/`

**Step 1: Create charts group**

Create `charts/meta.json`:
```json
{
  "title": "Charts",
  "description": "SVG charts with animation, theming, interactivity, and accessibility",
  "icon": "i-solar:chart-bold-duotone",
  "category": "charts",
  "order": 8
}
```

**Step 2: Create overview page**

Create `charts/overview/meta.json`:
```json
{
  "title": "Overview",
  "description": "Chart architecture, theme color integration, and dark mode support",
  "icon": "i-solar:chart-bold-duotone",
  "category": "charts",
  "order": 1
}
```

Create `charts/overview/+page.svelte` with prose about chart architecture (SVG-based, theme token integration, dark mode via `data-mode`).

**Step 3: Create chart type pages**

For `bar-chart/`, `line-chart/`, `sparkline/` — these are BUILT components. Create full doc pages referencing the `StoryBuilder` pattern (like list's `+page.svelte`). If stories don't exist yet, create minimal pages with placeholder story sections.

`charts/bar-chart/meta.json`:
```json
{
  "title": "Bar Chart",
  "description": "Animated bar chart with data transitions and bar chart race support",
  "icon": "i-solar:chart-2-bold-duotone",
  "category": "charts",
  "order": 2,
  "llms": false
}
```

`charts/bar-chart/+page.svelte` — minimal working page:
```svelte
<script>
  // @ts-nocheck
</script>
<article data-article-root>
  <p>
    A bar chart built on SVG with animated entry, data transitions, and support for time-series
    "racing" animations where bars grow and reorder as data changes.
  </p>
  <h2>Basic Usage</h2>
  <p>Coming soon — stories in progress.</p>
</article>
```

Repeat for `line-chart/` (order: 3), `sparkline/` (order: 4).

**Step 4: Create placeholder chart pages**

Create meta.json + coming-soon page for:
- `charts/pie-donut/` (order: 5) — "Pie / Donut chart"
- `charts/scatter/` (order: 6) — "Scatter chart"

**Step 5: Create cross-cutting pages**

`charts/interactivity/meta.json`:
```json
{
  "title": "Interactivity",
  "description": "Tooltips on hover, click selection on data points, and zoom/pan",
  "icon": "i-solar:cursor-bold-duotone",
  "category": "charts",
  "order": 7
}
```

`charts/accessibility/meta.json`:
```json
{
  "title": "Accessibility",
  "description": "Data table fallback, keyboard navigation between data points, screen reader announcements",
  "icon": "i-solar:accessibility-bold-duotone",
  "category": "charts",
  "order": 8
}
```

`charts/animation/meta.json`:
```json
{
  "title": "Animation",
  "description": "Entry animations, timeline and racing patterns, Svelte transitions, and motion preferences",
  "icon": "i-solar:magic-stick-3-bold-duotone",
  "category": "charts",
  "order": 9
}
```

**Commit:**
```bash
git add sites/learn/src/routes/\(learn\)/docs/charts/
git commit -m "feat(docs): add charts feature pillar"
```

---

## Task 10: Update Utilities pillar + Toolchain pillar

**Part A — Utilities**

`docs/utilities/` already exists as a group (category: utilities). Add overview and new sub-pages; move effects/ into utilities/.

**Step 1:** Update `utilities/meta.json` (adjust order to 9, improve description):
```json
{
  "title": "Utilities",
  "description": "Controllers, navigator pattern, visual effects, and custom component primitives",
  "category": "utilities",
  "order": 9
}
```

**Step 2:** Create `utilities/overview/` page (controllers + navigator intro).

**Step 3:** Create `utilities/controllers/` and `utilities/navigator/` pages with content about the controller + navigator pattern (reference `agents/design-patterns.md`).

**Step 4:** Move `effects/` into `utilities/`:
```bash
mv sites/learn/src/routes/\(learn\)/docs/effects/reveal \
   sites/learn/src/routes/\(learn\)/docs/utilities/reveal
mv sites/learn/src/routes/\(learn\)/docs/effects/shine \
   sites/learn/src/routes/\(learn\)/docs/utilities/shine
mv sites/learn/src/routes/\(learn\)/docs/effects/tilt \
   sites/learn/src/routes/\(learn\)/docs/utilities/tilt
rm -rf sites/learn/src/routes/\(learn\)/docs/effects
```

Update each moved meta.json: change `category` from `effects` to `utilities`.

**Step 5:** Create `utilities/custom-primitives/` placeholder.

**Part B — Toolchain**

Create `toolchain/meta.json`:
```json
{
  "title": "Toolchain",
  "description": "CLI, icon sets, and project scaffolding tools",
  "icon": "i-solar:settings-bold-duotone",
  "category": "toolchain",
  "order": 10
}
```

Create placeholders for `toolchain/overview/`, `toolchain/cli/`, `toolchain/icon-sets/`.

**Commit:**
```bash
git add sites/learn/src/routes/\(learn\)/docs/utilities/ \
        sites/learn/src/routes/\(learn\)/docs/toolchain/ \
        sites/learn/src/routes/\(learn\)/docs/effects
git commit -m "feat(docs): update utilities pillar, add toolchain pillar"
```

---

## Task 11: Preview app — route group and app shell

Create the `(preview)` route group with the Nexus app shell layout and a floating theme panel.

**Files:**
- Create: `sites/learn/src/routes/(preview)/preview/+layout.svelte`
- Create: `sites/learn/src/routes/(preview)/preview/+page.server.js`
- Create: `sites/learn/src/routes/(preview)/preview/ThemePanel.svelte`

**Step 1: Create ThemePanel component**

`sites/learn/src/routes/(preview)/preview/ThemePanel.svelte`:
```svelte
<script>
  // @ts-nocheck
  import { vibe } from '@rokkit/states'

  const skins = ['rokkit', 'glass', 'minimal', 'material']
  const modes = ['light', 'dark']

  let open = $state(false)
</script>

<div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
  {#if open}
    <div data-card class="p-4 w-56 flex flex-col gap-4 shadow-lg">
      <div>
        <p class="text-xs font-semibold text-surface-z5 mb-2 uppercase tracking-wide">Skin</p>
        <div class="flex flex-wrap gap-1">
          {#each skins as skin}
            <button
              class="px-2 py-1 text-xs rounded capitalize border transition-colors
                {vibe.palette === skin ? 'bg-primary-z6 text-white border-transparent' : 'border-surface-z3 text-surface-z6 hover:bg-surface-z2'}"
              onclick={() => (vibe.palette = skin)}
            >{skin}</button>
          {/each}
        </div>
      </div>
      <div>
        <p class="text-xs font-semibold text-surface-z5 mb-2 uppercase tracking-wide">Mode</p>
        <div class="flex gap-1">
          {#each modes as mode}
            <button
              class="px-2 py-1 text-xs rounded capitalize border transition-colors flex-1
                {vibe.mode === mode ? 'bg-primary-z6 text-white border-transparent' : 'border-surface-z3 text-surface-z6 hover:bg-surface-z2'}"
              onclick={() => (vibe.mode = mode)}
            >{mode}</button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
  <button
    class="h-10 w-10 rounded-full bg-primary-z6 text-white shadow-lg flex items-center justify-center hover:bg-primary-z7 transition-colors"
    onclick={() => (open = !open)}
    aria-label="Toggle theme panel"
    aria-expanded={open}
  >
    <span class="i-solar:palette-bold-duotone text-lg" aria-hidden="true"></span>
  </button>
</div>
```

**Step 2: Create app shell layout**

`sites/learn/src/routes/(preview)/preview/+layout.svelte`:
```svelte
<script>
  // @ts-nocheck
  import { page } from '$app/state'
  import { List } from '@rokkit/ui'
  import ThemePanel from './ThemePanel.svelte'

  let { children } = $props()

  const navItems = [
    { label: 'Dashboard', href: '/preview/dashboard', icon: 'i-solar:chart-square-bold-duotone' },
    { label: 'Projects', href: '/preview/projects', icon: 'i-solar:folder-open-bold-duotone' },
    { label: 'Reports', href: '/preview/reports', icon: 'i-solar:chart-2-bold-duotone' },
    { label: 'Admin', href: '/preview/admin', icon: 'i-solar:settings-bold-duotone' }
  ]

  const fields = { label: 'label', href: 'href', icon: 'icon', value: 'href' }
</script>

<div class="flex flex-col min-h-screen">
  <!-- Top bar -->
  <header class="h-14 flex items-center justify-between px-4 border-b border-surface-z2 bg-surface-z1 flex-shrink-0">
    <div class="flex items-center gap-3">
      <span class="i-solar:atom-bold-duotone text-2xl text-primary-z6" aria-hidden="true"></span>
      <span class="font-bold text-surface-z8 text-lg">Nexus</span>
      <span class="text-xs text-surface-z4 hidden sm:inline">Project Workspace</span>
    </div>
    <div class="flex items-center gap-2">
      <a
        href="/"
        class="text-xs text-surface-z5 hover:text-surface-z8 no-underline flex items-center gap-1"
      >
        <span class="i-solar:arrow-left-bold-duotone text-sm" aria-hidden="true"></span>
        Back to Docs
      </a>
    </div>
  </header>

  <!-- Body -->
  <div class="flex flex-1 min-h-0 overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-52 flex-shrink-0 border-r border-surface-z2 bg-surface-z1 overflow-y-auto hidden md:flex flex-col">
      <div class="p-3 pt-4">
        <List items={navItems} {fields} value={page.url.pathname} />
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto bg-surface-z0">
      {@render children()}
    </main>
  </div>
</div>

<ThemePanel />
```

**Step 3: Create redirect from /preview to /preview/dashboard**

`sites/learn/src/routes/(preview)/preview/+page.server.js`:
```js
import { redirect } from '@sveltejs/kit'
export function load() {
  redirect(302, '/preview/dashboard')
}
```

**Step 4: Verify the route compiles**
```bash
cd solution && bun run lint
```
Expected: 0 errors

**Step 5: Commit**
```bash
git add sites/learn/src/routes/\(preview\)/
git commit -m "feat(preview): add Nexus app shell layout with floating theme panel"
```

---

## Task 12: Preview — Dashboard page

**File:** `sites/learn/src/routes/(preview)/preview/dashboard/+page.svelte`

```svelte
<script>
  // @ts-nocheck
  import { Card } from '@rokkit/ui'
  import { List } from '@rokkit/ui'
  import { Toolbar, Button } from '@rokkit/ui'

  const kpis = [
    { label: 'Active Projects', value: '12', change: '+2 this week', icon: 'i-solar:folder-open-bold-duotone' },
    { label: 'Open Tasks', value: '84', change: '-6 today', icon: 'i-solar:checklist-minimalistic-bold-duotone' },
    { label: 'Team Members', value: '9', change: '2 on leave', icon: 'i-solar:users-group-two-rounded-bold-duotone' },
    { label: 'Completed', value: '63%', change: '+4% vs last sprint', icon: 'i-solar:chart-2-bold-duotone' }
  ]

  const recentActivity = [
    { label: 'Alice merged PR #42 — Auth module', icon: 'i-solar:git-merge-bold-duotone', subtext: '10m ago' },
    { label: 'Bob created task: API rate limiting', icon: 'i-solar:add-circle-bold-duotone', subtext: '1h ago' },
    { label: 'Sprint 14 planning completed', icon: 'i-solar:calendar-bold-duotone', subtext: '2h ago' },
    { label: 'Carol closed 3 bugs in payments', icon: 'i-solar:bug-bold-duotone', subtext: '3h ago' },
    { label: 'New milestone: v2.0 scope locked', icon: 'i-solar:flag-bold-duotone', subtext: 'Yesterday' }
  ]

  const activityFields = { label: 'label', icon: 'icon', subtext: 'subtext', value: 'label' }
</script>

<div class="p-6 flex flex-col gap-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-surface-z8">Dashboard</h1>
      <p class="text-sm text-surface-z5">Good morning — here's what's happening today.</p>
    </div>
    <Toolbar>
      <Button icon="i-solar:add-circle-bold-duotone">New Task</Button>
    </Toolbar>
  </div>

  <!-- KPI Cards -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {#each kpis as kpi}
      <div data-card class="p-4">
        <div class="flex items-start justify-between mb-3">
          <p class="text-sm text-surface-z5">{kpi.label}</p>
          <span class="{kpi.icon} text-xl text-primary-z6" aria-hidden="true"></span>
        </div>
        <p class="text-3xl font-bold text-surface-z8">{kpi.value}</p>
        <p class="text-xs text-surface-z4 mt-1">{kpi.change}</p>
      </div>
    {/each}
  </div>

  <!-- Activity -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div data-card class="p-4">
      <h2 class="text-sm font-semibold text-surface-z7 mb-3">Recent Activity</h2>
      <List items={recentActivity} fields={activityFields} />
    </div>

    <div data-card class="p-4 flex flex-col items-center justify-center gap-2 text-center min-h-40">
      <span class="i-solar:chart-bold-duotone text-3xl text-surface-z3" aria-hidden="true"></span>
      <p class="text-sm text-surface-z5">Sprint velocity chart</p>
      <p class="text-xs text-surface-z4">Coming soon — charts in progress</p>
    </div>
  </div>
</div>
```

**Commit:**
```bash
git add sites/learn/src/routes/\(preview\)/preview/dashboard/
git commit -m "feat(preview): add dashboard page"
```

---

## Task 13: Preview — Projects page

**File:** `sites/learn/src/routes/(preview)/preview/projects/+page.svelte`

```svelte
<script>
  // @ts-nocheck
  import { Tree } from '@rokkit/ui'
  import { Select, Toolbar, Button } from '@rokkit/ui'

  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Blocked', value: 'blocked' },
    { label: 'Done', value: 'done' }
  ]

  const assigneeOptions = [
    { label: 'Anyone', value: '' },
    { label: 'Alice', value: 'alice' },
    { label: 'Bob', value: 'bob' },
    { label: 'Carol', value: 'carol' }
  ]

  let filterStatus = $state('')
  let filterAssignee = $state('')

  const projects = [
    {
      label: 'Auth Module',
      icon: 'i-solar:shield-bold-duotone',
      children: [
        { label: 'OAuth integration', icon: 'i-solar:check-circle-bold-duotone' },
        { label: 'Session management', icon: 'i-solar:clock-circle-bold-duotone' },
        { label: 'Rate limiting', icon: 'i-solar:add-circle-bold-duotone' }
      ]
    },
    {
      label: 'Payments',
      icon: 'i-solar:card-bold-duotone',
      children: [
        { label: 'Stripe integration', icon: 'i-solar:check-circle-bold-duotone' },
        { label: 'Invoice generation', icon: 'i-solar:clock-circle-bold-duotone' }
      ]
    },
    {
      label: 'Notifications',
      icon: 'i-solar:bell-bold-duotone',
      children: [
        { label: 'Email templates', icon: 'i-solar:clock-circle-bold-duotone' },
        { label: 'Push notifications', icon: 'i-solar:add-circle-bold-duotone' }
      ]
    }
  ]

  let selectedTask = $state(null)
  const treeFields = { label: 'label', icon: 'icon', value: 'label' }
</script>

<div class="p-6 flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-surface-z8">Projects</h1>
    <Toolbar>
      <Button icon="i-solar:add-circle-bold-duotone">New Task</Button>
    </Toolbar>
  </div>

  <!-- Filters -->
  <div class="flex gap-3 flex-wrap">
    <Select items={statusOptions} bind:value={filterStatus} fields={{ label: 'label', value: 'value' }} />
    <Select items={assigneeOptions} bind:value={filterAssignee} fields={{ label: 'label', value: 'value' }} />
  </div>

  <!-- Task tree + detail panel -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div data-card class="p-4">
      <h2 class="text-sm font-semibold text-surface-z7 mb-3">Tasks</h2>
      <Tree
        items={projects}
        fields={treeFields}
        collapsible
        bind:value={selectedTask}
      />
    </div>

    <div data-card class="p-4">
      {#if selectedTask}
        <h2 class="text-sm font-semibold text-surface-z7 mb-4">Task Detail</h2>
        <div class="flex flex-col gap-3">
          <p class="text-surface-z8 font-medium">{selectedTask}</p>
          <p class="text-sm text-surface-z5">Assignee, due date, and inline editing coming soon.</p>
        </div>
      {:else}
        <div class="h-full flex flex-col items-center justify-center gap-2 text-center min-h-40">
          <span class="i-solar:cursor-bold-duotone text-3xl text-surface-z3" aria-hidden="true"></span>
          <p class="text-sm text-surface-z5">Select a task to view details</p>
        </div>
      {/if}
    </div>
  </div>
</div>
```

**Commit:**
```bash
git add sites/learn/src/routes/\(preview\)/preview/projects/
git commit -m "feat(preview): add projects page with tree navigation"
```

---

## Task 14: Preview — Reports page

**File:** `sites/learn/src/routes/(preview)/preview/reports/+page.svelte`

```svelte
<script>
  // @ts-nocheck
  import { Select, Toolbar } from '@rokkit/ui'

  const periodOptions = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last quarter', value: '90d' }
  ]

  let period = $state('30d')
</script>

<div class="p-6 flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-surface-z8">Reports</h1>
    <Toolbar>
      <Select items={periodOptions} bind:value={period} fields={{ label: 'label', value: 'value' }} />
    </Toolbar>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div data-card class="p-4 flex flex-col gap-2 min-h-52 items-center justify-center text-center">
      <span class="i-solar:chart-2-bold-duotone text-3xl text-surface-z3" aria-hidden="true"></span>
      <p class="text-sm text-surface-z5">Task completion — Bar Chart</p>
      <p class="text-xs text-surface-z4">Chart integration in progress</p>
    </div>

    <div data-card class="p-4 flex flex-col gap-2 min-h-52 items-center justify-center text-center">
      <span class="i-solar:chart-bold-duotone text-3xl text-surface-z3" aria-hidden="true"></span>
      <p class="text-sm text-surface-z5">Velocity over time — Line Chart</p>
      <p class="text-xs text-surface-z4">Chart integration in progress</p>
    </div>
  </div>

  <div data-card class="p-4 flex flex-col gap-2 min-h-32 items-center justify-center text-center">
    <span class="i-solar:table-bold-duotone text-3xl text-surface-z3" aria-hidden="true"></span>
    <p class="text-sm text-surface-z5">Summary Data Table</p>
    <p class="text-xs text-surface-z4">DataTable component coming soon</p>
  </div>
</div>
```

Note: Charts and DataTable placeholders are intentional — shows the roadmap within the app itself.

**Commit:**
```bash
git add sites/learn/src/routes/\(preview\)/preview/reports/
git commit -m "feat(preview): add reports page"
```

---

## Task 15: Preview — Admin page

**File:** `sites/learn/src/routes/(preview)/preview/admin/+page.svelte`

```svelte
<script>
  // @ts-nocheck
  import { Tabs } from '@rokkit/ui'

  const tabs = [
    { label: 'Profile', value: 'profile', icon: 'i-solar:user-bold-duotone' },
    { label: 'Team', value: 'team', icon: 'i-solar:users-group-two-rounded-bold-duotone' },
    { label: 'Appearance', value: 'appearance', icon: 'i-solar:palette-bold-duotone' }
  ]

  let activeTab = $state('profile')

  const skins = ['rokkit', 'glass', 'minimal', 'material']
</script>

<div class="p-6 flex flex-col gap-6">
  <h1 class="text-2xl font-bold text-surface-z8">Admin</h1>

  <Tabs items={tabs} bind:value={activeTab} fields={{ label: 'label', value: 'value', icon: 'icon' }} />

  <div class="mt-2">
    {#if activeTab === 'profile'}
      <div data-card class="p-6 max-w-lg flex flex-col gap-4">
        <h2 class="text-base font-semibold text-surface-z7">Profile Settings</h2>
        <p class="text-sm text-surface-z5">
          Full form editing with FormRenderer, validation, and lookup fields will be demonstrated here.
        </p>
        <div class="flex flex-col gap-3 opacity-60">
          <div class="h-9 bg-surface-z2 rounded-md"></div>
          <div class="h-9 bg-surface-z2 rounded-md"></div>
          <div class="h-9 bg-surface-z2 rounded-md"></div>
        </div>
        <p class="text-xs text-surface-z4">FormRenderer integration coming soon</p>
      </div>
    {:else if activeTab === 'team'}
      <div data-card class="p-6 flex flex-col gap-2 min-h-40 items-center justify-center text-center">
        <span class="i-solar:table-bold-duotone text-3xl text-surface-z3" aria-hidden="true"></span>
        <p class="text-sm text-surface-z5">Team members DataTable</p>
        <p class="text-xs text-surface-z4">DataTable component coming soon</p>
      </div>
    {:else if activeTab === 'appearance'}
      <div data-card class="p-6 max-w-sm flex flex-col gap-4">
        <h2 class="text-base font-semibold text-surface-z7">Appearance</h2>
        <p class="text-sm text-surface-z5">Use the theme panel (bottom-right) to switch skin and mode live.</p>
        <div class="flex flex-col gap-2">
          <p class="text-xs font-semibold text-surface-z5 uppercase tracking-wide">Available Skins</p>
          <div class="flex flex-wrap gap-2">
            {#each skins as skin}
              <span class="px-2 py-1 text-xs rounded border border-surface-z3 text-surface-z6 capitalize">{skin}</span>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
```

**Commit:**
```bash
git add sites/learn/src/routes/\(preview\)/preview/admin/
git commit -m "feat(preview): add admin page with tabs"
```

---

## Task 16: Add Preview link to root navigation

Update the root `+layout.svelte` and/or the docs header so developers can navigate to the preview app.

**File:** `sites/learn/src/routes/(learn)/docs/+layout.svelte`

In the header section, add a "Preview" link alongside the GitHub link:
```svelte
<!-- Add after the ThemeSwitcherToggle -->
<a
  href="/preview"
  class="flex h-9 items-center gap-1.5 px-3 rounded-md text-sm text-surface-z5 hover:text-surface-z8 hover:bg-surface-z2 no-underline"
  title="Preview — Nexus App"
>
  <span class="i-solar:atom-bold-duotone inline-block text-base" aria-hidden="true"></span>
  <span class="hidden sm:inline">Preview</span>
</a>
```

Also add a "Preview" link to the home page (`+page.svelte`) in the features/navigation section.

**Commit:**
```bash
git add sites/learn/src/routes/\(learn\)/docs/+layout.svelte
git add sites/learn/src/routes/+page.svelte 2>/dev/null || true
git commit -m "feat(docs): add preview app link to docs header"
```

---

## Task 17: Update 09-website.md with preview app section

The `docs/design/09-website.md` still has the old `05-website.md` content. Append the preview app design as Section 10.

**File:** `docs/design/09-website.md` (repo root)

Add at the end:

```markdown
---

## 10. Preview App — Nexus

The Preview app is a fictional project management workspace ("Nexus") that demonstrates
Rokkit in a realistic production context. It lives at `/preview/*` inside the `(preview)`
route group in `sites/learn`.

### Purpose

- Show developers what a real Rokkit application looks and feels like
- Demonstrate live theme/skin/mode switching in a realistic context
- Cover every implemented component at least once in a meaningful use case
- Show roadmap items as "coming soon" placeholders within the app

### Route structure

See `docs/plans/2026-03-06-website-redesign-design.md` for full specification.

### Floating theme panel

A `ThemePanel.svelte` component is anchored to the bottom-right of the preview layout.
It mutates `vibe.palette` and `vibe.mode` directly, which the `themable` action on
`<svelte:body>` reflects to `data-palette` and `data-mode` on `<html>`.

### Nexus app sections

| Route | Primary components demonstrated |
|-------|--------------------------------|
| `/preview/dashboard` | Card, List, Toolbar, Button |
| `/preview/projects` | Tree, Select, FormRenderer (placeholder) |
| `/preview/reports` | Charts (placeholder until built), Select, Toolbar |
| `/preview/admin` | Tabs, FormRenderer (placeholder), DataTable (placeholder) |
```

**Commit:**
```bash
cd /Users/Jerry/Developer/rokkit
git add docs/design/09-website.md
git commit -m "docs: update 09-website.md with preview app section"
```

---

## Task 18: Final verification

**Step 1: Run all unit tests**
```bash
cd solution && bun run test:ci
```
Expected: all 2745+ pass

**Step 2: Run lint**
```bash
cd solution && bun run lint
```
Expected: 0 errors

**Step 3: Start the learn site and manually verify**
```bash
cd sites/learn && bun dev
```
Check:
- Sidebar shows all 10 feature pillars
- All moved pages load at new URLs
- Preview app opens at `/preview` and redirects to `/preview/dashboard`
- Theme panel switches skin and mode live
- Floating action buttons still work on component pages
- No 404s from internal links

**Step 4: Commit any fixes found during manual testing**
