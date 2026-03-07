# Learn Site

The learn site (`sites/learn`) is the primary documentation and interactive demo surface for Rokkit. It serves two audiences: developers learning the library and AI agents consuming component API references.

---

## 1. Site Architecture

The site is a SvelteKit application organized into two route groups that share a global layout and header but diverge in purpose and chrome.

```
sites/learn/src/routes/
  (learn)/                  ← documentation group
    docs/
      components/[slug]/    ← per-component doc pages
      color-system/
      ...
  (play)/                   ← playground group
    playground/
      components/[slug]/    ← per-component sandboxes
  +layout.svelte            ← root layout (shared head, vibe store)
  +page.svelte              ← home/landing page
```

```
Browser request
      │
      ▼
Root layout (+layout.svelte)
  │  Applies: theme CSS, vibe store, global font
  │
  ├── (learn) group layout
  │     │  Header with sidebar toggle, ThemeSwitcherToggle, GitHub link
  │     │  Left sidebar: collapsible section/group navigation
  │     │  Right aside: TableOfContents (xl screens)
  │     │  Floating action buttons: playground link, llms.txt link
  │     └── docs/[section]/[slug]/+page.svelte
  │
  └── (play) group layout
        │  Compact header: title, back link
        │  Left aside: List of all components (collapsible)
        │  Floating action buttons: docs link, llms.txt link
        └── playground/components/[slug]/+page.svelte
```

### Route group separation rationale

The two groups exist because the information architecture and navigation chrome are fundamentally different:

- `(learn)` pages are narrative, section-structured, and indexed by the sidebar. They carry breadcrumbs, a table of contents, and prose content alongside embedded story viewers.
- `(play)` pages are interactive sandboxes. They carry a component list sidebar and a live editing surface. No prose, no ToC.

Separating the groups into distinct layouts avoids conditional rendering complexity and keeps each layout's concerns focused.

---

## Documentation Pages

### Page anatomy

Each component documentation page is a `+page.svelte` at `docs/components/[slug]/`. It typically contains:

1. A prose intro paragraph
2. One or more `StoryViewer` instances, each wrapping a live `App.svelte` example
3. Code fragments (static code blocks using the `Code` component)
4. A props/API table

The layout injects the page title, description, icon, breadcrumbs, and floating action buttons automatically from the section metadata — the page itself does not repeat these.

### Story viewer

Each example is self-contained in a subfolder (`intro/App.svelte`, `nested/App.svelte`, etc.) and rendered inside a `StoryViewer` component. The viewer:

- Renders the live component instance
- Optionally displays the source code below it
- Marks its root with `data-story-viewer` for E2E test targeting

```
docs/components/list/
  +page.svelte          ← page assembles stories and prose
  meta.json             ← title, description, icon, llms flag
  stories.js            ← ordered list of story metadata
  intro/App.svelte      ← live example components
  nested/App.svelte
  snippets/App.svelte
  fragments/
    01-basic-items.js   ← static code snippets shown below stories
    02-field-mapping.js
```

### Sidebar navigation

The sidebar is a `Sidebar.svelte` component that renders the full section tree. It:

- Groups pages into sections (Getting Started, Components, Forms, etc.)
- Highlights the current page
- Supports Cmd+K / Ctrl+K to focus the search input
- Collapses to a slide-in drawer on mobile (below `lg` breakpoint)
- On large screens, renders inline as a fixed-width `18rem` column

```
Sidebar
  ├── Search input (Cmd+K focus)
  ├── Section: Getting Started
  │     ├── Introduction
  │     └── Color System
  ├── Section: Components
  │     ├── Button
  │     ├── List
  │     ├── Select
  │     └── ...
  └── Section: Forms
        └── Form Builder
```

Navigation data is loaded via the `+layout.server.js` and passed as `data.sections` to the layout. The `findSection()` and `findGroupForSection()` utilities resolve the active page and its group for breadcrumb generation.

### Breadcrumbs

Breadcrumbs are built dynamically from the section tree:

```
Learn  /  Components  /  List
```

The first crumb is always `Learn → /`. Subsequent crumbs come from the group title and the page title. Only the first crumb is a link; the current page is plain text.

### Table of contents

The `TableOfContents` component renders in the right aside on `xl` screens. It discovers headings in the main content area and generates anchor links. This panel is hidden on narrower viewports.

### Code examples

Static code fragments are displayed using the `Code` component (syntax-highlighted via Shiki). Fragments live in the `fragments/` subfolder and are imported by the page. Each fragment is a `.js` or `.svelte` file containing only the example code — the page controls the surrounding prose and sequencing.

---

## Playground Pages

### Purpose

The playground is an interactive sandbox for developers to explore component behavior without reading documentation. Each page presents a live component instance with real controls — theme switching, prop editing, and state inspection.

### Page anatomy

```
playground/components/[slug]/+page.svelte
```

Each playground page is deliberately minimal. It renders one or more live component instances directly, without prose or StoryViewer wrappers. Controls are embedded inline (theme buttons, prop inputs) or delegated to the layout sidebar.

### Layout structure

```
Playground layout
  ├── Header bar
  │     ├── "Component Playground" title + description
  │     └── Back link → /playground
  │
  ├── Left aside (64 = 16rem)
  │     └── List of all components (collapsible groups)
  │           ← navigated via Rokkit's own List component
  │
  └── Main content area  [data-playground-content]
        ├── Floating action buttons (top-right)
        │     ├── Docs link → /docs/components/[slug]
        │     └── llms.txt link → /llms/components/[slug].txt
        └── Component sandbox
```

### Component list sidebar

The playground sidebar uses Rokkit's own `List` component to render the component index, demonstrating the library eating its own cooking. The list is collapsible with components grouped by category. The `value` prop is bound to `page.url.pathname` so the active component is always highlighted.

### Theme integration

The playground layout does not embed a theme switcher directly — the global `ThemeSwitcherToggle` in the docs header applies to all pages site-wide, including playground pages. This ensures that:

1. The selected theme persists across docs ↔ playground navigation
2. Theme state is a single source of truth (the vibe store)
3. Components in the playground render under the real theme, not a preview

Individual playground pages may embed additional controls for variants, sizes, or modes specific to the component being demonstrated.

---

## AI Content (llms.txt)

### Purpose

Each component has a static plain-text file that provides a concise, machine-readable API reference for AI agents and LLMs. These files are authored by hand in `sites/learn/static/llms/`.

### File locations

```
static/llms/
  index.txt                     ← library overview + component index
  components/
    list.txt
    select.txt
    tree.txt
    ...
```

These are served as static assets at `/llms/components/[name].txt`.

### Content of each component file

A component llms.txt file contains:

1. **Component name and one-line description** — machine-readable summary
2. **Quick Start** — minimal working code example
3. **Props table** — all props, types, defaults, descriptions
4. **Field mapping table** — which fields the component reads from data, and defaults
5. **Named snippets** — each snippet the component exposes, with its signature and purpose
6. **ProxyItem API** — what properties and methods are available inside snippets
7. **Keyboard navigation table** — all key bindings
8. **Data attributes table** — all `data-*` attributes the component applies, for theming
9. **Import statement**
10. **Related components** — cross-links to other llms.txt files

### Content of index.txt

The `index.txt` file covers the library as a whole:

- Package overview (all `@rokkit/*` packages and their roles)
- Quick start example
- Standard API pattern shared by all selection components
- Field mapping system explanation
- Theme activation syntax
- Full component index with one-line descriptions and links to component files
- Keyboard navigation reference (the universal keybindings)
- Import patterns

### Authoring rules

- Write for a reader that has no visual context — describe behavior, not appearance
- Every prop must have a type and default
- Code examples must be copy-pasteable and self-contained
- Cross-links use relative `/llms/components/[name].txt` paths
- Avoid prose filler — use tables and code blocks

---

## Floating Action Buttons

Documentation pages and playground pages both show floating icon buttons in the top-right corner of the content area. These provide one-click navigation between related surfaces.

### Docs page buttons

```
┌──────────────────────────────────────────┐
│  [content]                  [🎮] [📄]   │
│                              │     │     │
│                              │     └─ llms.txt (opens new tab)
│                              └─ Playground page
└──────────────────────────────────────────┘
```

- The playground button only appears for pages that have a corresponding `/playground/components/[slug]` route (detected by the `canonicalPath` containing `/docs/components/`).
- The llms.txt button only appears when the section's `meta.json` sets `llms: true`.

### Playground page buttons

```
┌─────────────────────────────────────────┐
│  [sandbox]                  [📖] [📄]  │
│                              │     │    │
│                              │     └─ llms.txt (opens new tab)
│                              └─ Docs page
└─────────────────────────────────────────┘
```

- The docs button links to `/docs/components/[slug]`.
- The llms.txt button links to `/llms/components/[slug].txt`.
- Both are derived from the current URL slug.

### Button implementation

Each button is an `<a>` tag styled as a `32×32px` icon button using `flex`, `rounded-md`, and surface-z tokens. Icons use Solar icon classes (`i-solar:*-bold-duotone`). The container is `position: absolute; top: 1rem; right: 1rem` within the scrollable main content area, with `z-10` to float above content.

---

## 6. Navigation Design

### Sidebar sections

The sidebar groups documentation pages into sections. Each section has a title and an ordered list of pages. Sections are rendered as collapsible groups in the sidebar.

```
Getting Started
  Introduction
  Field Mapping
  Color System

Components
  Button
  BreadCrumbs
  Card
  List
  Menu
  Select
  MultiSelect
  Tree
  Table
  Tabs
  Toggle
  Toolbar
  ...

Forms
  Form Builder

Upload
  Upload Target
  Upload Progress
```

### Search (Cmd+K)

Pressing `Cmd+K` (or `Ctrl+K`) while on any docs page focuses the search input inside the sidebar. If the sidebar is closed on mobile, it opens first. The search input is part of the `Sidebar` component and is exposed via a `focusSearch()` method on the bound `sidebarRef`.

### Responsive behavior

```
Viewport      Sidebar behavior
──────────    ────────────────────────────────────────────
< lg (1024)   Slide-in drawer; closed by default;
              hamburger button in header to toggle;
              backdrop overlay when open
≥ lg (1024)   Inline column (18rem); open by default;
              sidebar toggle button still visible in header
```

After navigation, the sidebar auto-closes on mobile. On resize from large to small, it auto-closes.

### Active page highlighting

The sidebar uses `page.url.pathname` to determine the active item. The `canonicalPath` strips any trailing `/play` suffix so that the docs page and playground page for the same component share the same active state in the sidebar.

---

## Theme Integration

### ThemeSwitcherToggle

The `ThemeSwitcherToggle` component sits in the docs layout header (top-right). It cycles through available themes (rokkit, minimal, material, glass) and persists the selection via the vibe store. The store writes `data-theme` and `data-mode` attributes to `document.documentElement`, which is how Rokkit's CSS variable system activates the correct theme.

```
ThemeSwitcherToggle (header)
    │  user clicks
    ▼
vibe store (global $state)
    │  writes
    ▼
document.documentElement
  data-theme="rokkit"    ← activates CSS variable definitions
  data-mode="dark"       ← selects dark palette
    │  CSS cascade
    ▼
All components on page use theme variables
```

### Playground context

Components in the playground render in the real theme — there is no iframe isolation. This means the playground accurately reflects how a component will appear in a consumer's application using the same theme.

### Dark mode

The `data-mode` attribute on `<html>` flips the z-index color scale (z1 ↔ z10 inversion). Both docs and playground pages respond to dark mode because all colors use `bg-surface-z*` semantic tokens that invert automatically.

---

## Page Metadata (meta.json)

Each docs page has a `meta.json` file in its directory:

```json
{
  "title": "List",
  "description": "Data-driven list with keyboard navigation and collapsible groups",
  "icon": "i-component:list",
  "llms": true
}
```

| Field | Purpose |
|-------|---------|
| `title` | Page title in `<head>` and `<h1>` |
| `description` | Subtitle shown below the `<h1>` |
| `icon` | Icon class shown alongside the title |
| `llms` | Whether to show the llms.txt floating button |

The layout reads these via `data.sections` (loaded server-side) and uses `findSection()` to locate the metadata for the current route.

---

## Theme Builder

The Theme Builder is an interactive page in the learn site's playground at `/playground/theme-builder`. It gives developers a visual, real-time environment for creating and exporting custom Rokkit themes without touching a text editor.

### Route and layout

The page lives inside the `(play)` route group and uses the standard playground layout (compact header, back link, no ToC). Unlike per-component playground pages, it has no left-side component list — the full width is dedicated to the builder UI.

```
(play)/playground/theme-builder/
  +page.svelte        ← builder UI
  +page.ts            ← loads built-in skin definitions for initial state
```

### Visual Customization Panel

A controls column on the left side of the builder exposes four top-level settings that map directly to the `data-*` attributes Rokkit reads on `<html>`:

| Control | Attribute | Options |
|---------|-----------|---------|
| Palette / skin | `data-palette` | `rokkit`, `glass`, `minimal`, `material`, `custom` |
| Theme style | `data-style` | `rokkit`, `minimal`, `material` |
| Color mode | `data-mode` | `light`, `dark`, `system` |
| Density | `data-density` | `compact`, `default`, `comfortable` |

Selecting a built-in skin loads its token values into the editor. Selecting "Custom" starts with the `rokkit` defaults and allows full per-token editing. All four controls use Rokkit's own `Toggle` group or `Select` components — the builder eats its own cooking.

### State-Based Theme Authoring

Below the top-level controls, the builder exposes per-state visual property editing. The user selects a component from a list, then for each interaction state sets the token overrides that apply.

**States available:**

| State | `data-*` trigger |
|-------|-----------------|
| `default` | (no modifier) |
| `hover` | `:hover` |
| `focus` | `:focus-visible` |
| `active` | `data-active="true"` |
| `selected` | `data-selected="true"` |
| `selected + unfocused` | `data-selected="true"` without `:focus-within` on ancestor |
| `disabled` | `data-disabled="true"` |
| `error` | `data-error="true"` |

**Properties per state:**

- Background color (`--color-surface-*` or `--color-primary-*` token slot)
- Text color
- Border color
- Border radius (`rem` input)
- Box shadow (preset dropdown: none / sm / md / lg / custom)

Each property picker shows the raw CSS custom property name it will emit alongside the value input, so the user builds mental model of the token system while working.

**Live preview:** A preview panel on the right renders a representative set of components in their current state. As the user edits values the preview updates instantly — no save step.

### Component Preview Grid

The preview panel shows a grid of representative components rendered in the current theme configuration. It covers the full interactive state surface:

```
┌──────────────────────────────────────────────────────────┐
│  Preview — rokkit skin / material style / dark / default │
├──────────────────────────────────────────────────────────┤
│  Button row:  [Default]  [Hovered]  [Focused]  [Active]  │
│                                                          │
│  List:                                                   │
│    Item A        (default)                               │
│    Item B        (hover)                                 │
│  ● Item C        (selected + focused)                    │
│    Item D        (selected + unfocused)                  │
│    Item E ░░░░   (disabled)                              │
│                                                          │
│  Input:  [Value with error state      ]  ← error         │
│  Input:  [Focused value               ]  ← focus         │
│                                                          │
│  Badge [success]  Badge [warning]  Badge [error]         │
│  ProgressBar ████████░░  80%                             │
│                                                          │
│  Card  ┌─────────────────────────────┐                   │
│        │  Title             [Badge]  │                   │
│        │  Body text content…         │                   │
│        └─────────────────────────────┘                   │
└──────────────────────────────────────────────────────────┘
```

Below the component grid, five links open the sample application pages (Dashboard, Data Browser, Form Page, Article, Settings) in a new tab with the current theme state encoded in the URL. This lets users inspect a fully realistic application under their custom theme before downloading.

### Download

A "Download theme.css" button at the bottom of the controls panel exports the current custom property overrides as a ready-to-use CSS file.

**Output format:**

```css
/* Custom Rokkit theme — generated by Theme Builder */
/* Base: rokkit skin / material style / dark mode   */

:root,
[data-palette="custom"] {
  --color-primary-500: #6366f1;
  --color-primary-600: #4f46e5;
  /* ... only tokens that differ from the base skin ... */
}

[data-style="material"] [data-list] [data-list-item][data-active="true"] {
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
/* ... per-state component overrides ... */
```

The file is split into two logical sections:

1. **Skin overrides** — `:root` / `[data-palette]` custom property values (color tokens only)
2. **Theme overrides** — `[data-style]` scoped component-and-state rules for anything that diverges from the selected base theme style

Only tokens and rules that differ from the selected base are emitted. Unchanged values are omitted to keep the output minimal and maintainable.

### Implementation Notes

**Reactivity — no page reload:**
All visual changes are applied via `document.documentElement.style.setProperty()` as the user edits. The preview panel reflects every keystroke immediately. This approach is reliable across all browsers and requires no special build-time integration.

**URL serialization:**
The full builder state is encoded as a compact JSON blob in the URL's `?theme=` search parameter (base64url). This means any theme configuration can be shared as a link. On page load, the URL parameter is decoded and applied before first paint to avoid a flash of the default theme.

**State management:**
The builder maintains a `$state` object mirroring all token overrides and component state rules. The preview panel reads from this object directly. The download handler serializes it to CSS. This single source of truth eliminates the need to read back from the DOM.

**PaletteManager and ThemeSwitcherToggle in context:**
The builder uses `PaletteManager` for the skin swatch picker and `ThemeSwitcherToggle` for theme style and mode — the same components a consumer would embed in their own settings page. Their presence here is intentional: this page is a live demonstration of those components used in a real scenario, not a documentation example.

---

## 10. Preview App ("Nexus")

### Purpose

Nexus is a fictional workspace application hosted at `/preview/*` inside the `(preview)` route group. Its role is to demonstrate what a real Rokkit application looks and feels like — not a documentation example, but a plausible product UI built entirely from Rokkit components. It provides a realistic, multi-screen context for evaluating how theme/skin combinations behave across different component types and data densities.

### Route structure

```
sites/learn/src/routes/
  (preview)/
    preview/
      +layout.svelte          ← app shell: Nexus top bar, List sidebar nav, ThemePanel overlay
      +page.server.js         ← redirects / → /preview/dashboard
      dashboard/
        +page.svelte          ← KPI cards, activity List, chart placeholder
      projects/
        +page.svelte          ← Select filters, Tree task hierarchy, detail panel
      reports/
        +page.svelte          ← Toolbar/Select filters, chart placeholders, DataTable placeholder
      admin/
        +page.svelte          ← Tabs (profile / team / appearance), appearance settings
```

The layout renders the full Nexus chrome (top bar, sidebar) around every child page. The server redirect on `+page.server.js` ensures that landing on `/preview` always drops the user on the dashboard rather than a blank shell.

### Floating theme panel

A `ThemePanel` component floats in the bottom-right corner of the viewport, visible only while inside `/preview/*`. It exposes two controls:

| Control | Store field | Options |
|---------|-------------|---------|
| Skin | `vibe.style` | `rokkit`, `glass`, `minimal`, `material` |
| Mode | `vibe.mode` | `light`, `dark` |

Changes write directly to the vibe store, which applies `data-style` and `data-mode` to `document.documentElement`. Theme updates are instant — no page reload required. The panel is positioned with `position: fixed; bottom: 1rem; right: 1rem` and sits above the page content at a high `z-index`.

### Component coverage

Nexus is designed to exercise a broad cross-section of the Rokkit component library across its four screens:

| Screen | Components used |
|--------|----------------|
| Dashboard | `List` (activity feed), `Button`, card layout |
| Projects | `Select` (filters), `Tree` (task hierarchy), detail panel |
| Reports | `Toolbar`, `Select` (filters), chart placeholders, DataTable placeholder |
| Admin | `Tabs` (profile / team / appearance), `Button`, appearance settings |

Sections that require components not yet available (DataTable, density control) are marked "Coming soon" with a placeholder card so the layout remains coherent without empty screens.

### Access

Nexus is linked from two entry points in the learn site:

- **Header** — a "Live Preview" link in the global site header navigates to `/preview/dashboard`.
- **Home page** — the landing page "Live Preview" call-to-action button navigates to `/preview/dashboard`.
