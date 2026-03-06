# Website Redesign Design

**Date:** 2026-03-06
**Status:** Approved

## Goals

1. Restructure the learn site navigation to feature-first (matches the feature spec pillars)
2. Make documentation user-facing, compelling, and developer-appealing
3. Add a real-world preview app section (`/preview/*`) within the learn site
4. Add placeholders for all planned but unbuilt features
5. Delete `sites/quick-start` and `sites/sample`
6. Renumber design docs to a clean `01–09` sequence

---

## 1. Site Architecture

The learn site (`sites/learn`) gains a third route group alongside the existing two:

```
sites/learn/src/routes/
  (learn)/                      ← documentation (feature-first)
  (play)/                       ← component playgrounds
  (preview)/                    ← NEW: real-world app
  +layout.svelte                ← root layout (shared head, vibe store)
  +page.svelte                  ← home/landing page
```

### Route groups and URL namespaces

Each group uses a physical subfolder to anchor its URL namespace:

| Group | Physical path | URL prefix |
|-------|--------------|------------|
| `(learn)` | `(learn)/[section]/[slug]/` | `/[section]/[slug]` |
| `(play)` | `(play)/play/[component]/` | `/play/[component]` |
| `(preview)` | `(preview)/preview/[section]/` | `/preview/[section]` |

Route groups are logical — they share the URL namespace. The `play/` and `preview/` folder segments prevent clashes between groups.

### Deletions

- `sites/quick-start/` — removed entirely
- `sites/sample/` — removed entirely

---

## 2. Feature-First Navigation

The `(learn)` sidebar is reorganized from a flat component list to feature pillars. Each pillar has an overview page and sub-pages for components and concepts that belong to it.

```
Getting Started
  ├── Introduction
  ├── Installation
  └── Quick Start

Data Binding
  ├── Overview (field mapping, ProxyItem, data-first philosophy)
  ├── Field Mapping
  └── Data Sources 🔲

Composability
  ├── Overview (snippet model, customization without modification)
  └── Snippets & Customization

Theming & Design
  ├── Overview (CSS architecture, theme/layout separation)
  ├── Skins & Color Tokens
  ├── Density Modes 🔲
  └── Whitelabeling 🔲

Accessibility & i18n
  ├── Overview (keyboard nav, ARIA, controller pattern)
  ├── Keyboard Navigation
  ├── Tooltips 🔲
  └── Internationalization 🔲

Forms
  ├── Overview
  ├── Field Types
  ├── Validation
  ├── Lookups
  ├── Conditional Fields 🔲
  └── Multi-Step Forms 🔲

Components
  ├── Actions:     Button, ButtonGroup, Toolbar, Menu
  ├── Navigation:  List, Tree, Select, MultiSelect, Tabs, Breadcrumb 🔲
  ├── Display:     Card, Badge 🔲, Avatar 🔲
  ├── Data:        DataTable 🔲
  └── Layout:      Stack 🔲, Grid 🔲, Divider 🔲

Charts
  ├── Overview (architecture, theme color integration, dark mode)
  ├── Bar Chart (static, animated entry, data transitions, bar chart race)
  ├── Line / Area Chart (static, animated draw, smooth transitions)
  ├── Sparkline (inline, pattern fills)
  ├── Pie / Donut 🔲
  ├── Scatter 🔲
  ├── Interactivity (tooltips on hover, click selection, zoom/pan 🔲)
  ├── Accessibility (data table fallback, keyboard navigation 🔲, screen reader announcements 🔲)
  └── Animation (entry animations, timeline/racing patterns, Svelte transitions, motion preferences)

Utilities
  ├── Overview (controller + navigator pattern)
  ├── Controllers
  ├── Navigator
  └── Custom Component Primitives 🔲

Toolchain
  ├── Overview
  ├── CLI 🔲
  └── Icon Sets 🔲
```

`🔲` marks placeholder pages for unbuilt features. They exist in the nav with a clear "Coming soon" treatment — this makes the roadmap visible to developers without hiding what's already complete.

### Navigation URL pattern

The URL slug matches the pillar name:

```
/getting-started/introduction
/data-binding/field-mapping
/components/list
/charts/bar-chart
/utilities/controllers
```

### Sidebar changes

The sidebar retains its existing responsive behavior (drawer on mobile, fixed column on desktop). Section headings change from the current flat list to the feature pillar groups above. The `sections` data structure loaded by `+layout.server.js` is updated to match.

---

## 3. Preview App — "Nexus"

A fictional project workspace app built entirely with Rokkit components. Lives at `/preview/*` inside the `(preview)` route group. Its purpose is to demonstrate what a real-world Rokkit application looks and feels like — and to show theme/skin switching in a realistic context.

### Route structure

```
(preview)/preview/
  +layout.svelte         ← app shell (sidebar nav, top bar, floating theme panel)
  dashboard/             → /preview/dashboard
  projects/              → /preview/projects
  reports/               → /preview/reports
  admin/                 → /preview/admin
```

### App shell layout

```
┌──────────────────────────────────────────────────────────┐
│  Nexus  [logo]          [search]         [user avatar]   │  ← top bar
├─────────────┬────────────────────────────────────────────┤
│  Dashboard  │                                            │
│  Projects   │              page content                  │
│  Reports    │                                            │
│  Admin      │                                            │
│             │                              [theme panel] │  ← floating
└─────────────┴────────────────────────────────────────────┘
```

The left sidebar uses Rokkit's own `List` component (self-hosted). The top bar uses `Toolbar` and `Button`. The floating theme panel is a persistent overlay anchored to the bottom-right corner, only visible within the `/preview/*` routes.

### Floating theme panel

Controls applied live to `document.documentElement`:

| Control | Attribute | Options |
|---------|-----------|---------|
| Skin | `data-palette` | `rokkit`, `glass`, `minimal`, `material` |
| Mode | `data-mode` | `light`, `dark` |
| Density | `data-density` | `compact`, `default`, `comfortable` 🔲 |

State persists in the vibe store (not URL) — switching skin repaints the entire preview app instantly with no reload.

### Page content

**`/preview/dashboard`**
- KPI stat `Card` components (revenue, tasks, team members)
- Sparkline charts for trend data
- Recent activity `List`
- `Toolbar` with action `Button`s

**`/preview/projects`**
- Project filter bar (`Select`, `MultiSelect`, `Toolbar`)
- Task `Tree` with expand/collapse groups
- Inline task editing via `FormRenderer` (text, date, select fields)
- Add task panel with validation and lookup fields

**`/preview/reports`**
- Date range + dimension filter bar (`Toolbar`, `Select`)
- Animated `BarChart` with data transitions
- `LineChart` / area chart for time series
- Summary `DataTable` 🔲 (placeholder until built)

**`/preview/admin`**
- Team members `DataTable` 🔲 (placeholder)
- User settings `FormRenderer` with validation and lookups
- Appearance settings (skin, mode, density — wired to the floating panel)
- `Tabs` to separate profile / security / appearance sections

### Component coverage

The preview app exercises every implemented component at least once. Placeholder sections (DataTable, density) are clearly marked in the UI with a "Coming soon" badge, not hidden — this reinforces the roadmap.

---

## 4. Design Docs Renumbering

Current files are inconsistently numbered. New sequence:

| New name | Old name | Status |
|----------|----------|--------|
| `01-patterns.md` | `01-patterns.md` | Exists |
| `02-components.md` | `02-components.md` | Exists |
| `03-forms.md` | `03-forms.md` | Exists |
| `04-actions.md` | `04-actions.md` | Exists |
| `05-effects.md` | _(planned)_ | 🔲 To write |
| `06-themes.md` | _(planned)_ | 🔲 To write |
| `07-charts.md` | _(planned)_ | 🔲 To write |
| `08-tools.md` | _(planned)_ | 🔲 To write |
| `09-website.md` | `05-website.md` | Rename + expand |
| `README.md` | `000-component-gaps.md` | Repurpose as index |

`08-tools.md` covers CLI, icon sets, plugin system.
`09-website.md` covers the learn site, playground, and preview app (this design becomes its content).

The rename of `05-website.md → 09-website.md` is a git mv to preserve history.

---

## 5. LLMs Docs Completeness

Every implemented component should have a corresponding `static/llms/components/[name].txt`. Current coverage is partial. A backlog item tracks adding missing files — this is a content task, not a structural change.

---

## 6. Implementation Sequence

1. Delete `sites/quick-start` and `sites/sample`
2. Rename `docs/design/05-website.md` → `docs/design/09-website.md`; update all cross-references
3. Restructure learn site nav data (`sections` in `+layout.server.js`) to feature-first pillars
4. Migrate existing component doc pages to new URL paths (update links and meta)
5. Add placeholder pages for unbuilt features within each pillar
6. Create `(preview)` route group with app shell layout and four page shells
7. Build Nexus app content page by page
8. Add floating theme panel to preview layout
9. Update `docs/design/09-website.md` with preview app section
10. Add missing LLMs txt files for implemented components
