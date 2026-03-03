# References & Conventions

Consolidated coding guidelines, framework references, and styling conventions.

---

## Svelte 5

- **Svelte 5 ONLY** — do not use Svelte 4 patterns
- **Runes mode** — all components must use runes

### Anti-Patterns to Avoid

- `export let` syntax → use `$props()`
- `$:` reactive statements → use `$derived()` / `$derived.by()`
- `on:click` events → use `onclick`
- `createEventDispatcher` → use callback props
- `$$restProps` → use `{...restProps}` from `$props()`

---

## JavaScript

- **Module system:** ESM only (`import`/`export`)
- **Async:** Use `async`/`await` instead of Promise chains
- **Testing:** Vitest with `describe`, `it`, `expect`
- **Functional programming:** Ramda for data transformations (being phased out — see backlog)
- **Module organization:** Single-responsibility functions, camelCase naming, JSDoc types
- **Anti-patterns:** No CommonJS, avoid imperative loops, no large multi-purpose functions

---

## Styling: Theme/Layout Separation

### Theme Styles (per-theme folders: `rokkit/`, `minimal/`, `material/`, `glass/`)

Control colors, gradients, shadows, border colors — the "look and feel":
- Background and text colors
- Gradients, shadows
- Focus/active/hover color states
- Error, warning, success states
- Disabled state colors

### Layout Styles (`base/`)

Structural properties consistent across themes:
- Padding, margin, gap
- Flexbox/grid structure
- Border radius and width
- Element alignment and positioning
- Responsive breakpoints
- Min/max sizes

### Data-Attribute Selectors

- Pattern: `data-[component]-[element]` (e.g., `data-field-root`, `data-list-item`)
- Stateful: `data-[component]-[state]` (e.g., `data-field-disabled`, `data-field-state="fail"`)
- **Never** style by tag name or generic class
- **Never** mix theme and layout styles in the same file
- **All** new components must use data-attributes for styling hooks

### Theme Application

Applied via ancestor data attributes:
- `data-style="rokkit|material|minimal|glass"` — visual theme
- `data-mode="light|dark"` — color mode

### Reference Files

- `packages/themes/src/base/input.css` — canonical layout example
- `packages/themes/src/rokkit/input.css` — canonical theme example

---

## Story/Tutorial Conventions

### Structure

```
component/
├── +page.svelte          # Clean HTML + layout only
├── stories.js            # StoryBuilder with import.meta.glob
├── fragments/            # Code snippets (never inline in +page.svelte)
│   ├── 01-basic.svelte
│   └── 02-advanced.svelte
├── intro/
│   └── App.svelte        # Interactive example
└── meta.json             # Page metadata
```

### stories.js (canonical)

```js
import { StoryBuilder } from '$lib/builder.svelte.js'

const modules = import.meta.glob('./*/**/App.svelte', { import: 'default' })
const sources = import.meta.glob('./*/**/*', { query: '?raw', import: 'default' })

export const storyBuilder = new StoryBuilder(sources, modules)
```

### Rules

- Keep `+page.svelte` clean — only HTML structure and layout
- Use `<article data-article-root>` as the root wrapper
- All code in `fragments/` — never inline in `+page.svelte`
- Use `<Code {...storyBuilder.getFragment(n)} />` for code blocks
- Use `<StoryViewer {...storyBuilder.getExample('name')} />` for demos

---

## Color/Skin System

UnoCSS-based color system using CSS variables for runtime theme switching:

- `getVariableMap(colors.orange)` → generates `--color-primary-*` CSS variables
- `getColorMap('primary')` → generates `var(--color-primary-*)` object for UnoCSS
- Skin switching via `data-skin` attributes with `@apply skin-{name}`
- Semantic colors: `primary`, `secondary`, `accent`, `error`, `warning`, `success`
- Dark mode: always include `dark:` variants

---

## Architecture Principles

### Data-First Design

Components adapt to data structures — no data transformation required:
```svelte
<List items={users} fields={{ text: 'fullName', image: 'avatar' }} />
```

### Composable Flexibility

Every component extensible without modification via snippets:
```svelte
<List {items}>
  {#snippet item(proxy)}
    <MyCustomComponent data={proxy} />
  {/snippet}
</List>
```

### Consistent API Patterns

Standard props: `items`/`options`, `value` (bindable), `fields`, `onchange`/`onselect`

### Progressive Enhancement

1. Basic: `<List items={strings} />`
2. Mapped: `<List items={objects} fields={mapping} />`
3. Custom: snippets for full control

### Accessibility by Default

- ARIA attributes automatically applied
- Keyboard navigation built-in (via `use:navigator`)
- Focus management handled by controller + navigator

### Technical Constraints

- **Svelte:** ^5.0.0, runes only
- **Node.js:** >= 18.0.0, ESM
- **Browsers:** Chrome >=90, Firefox >=88, Safari >=14, Edge >=90
- **Bundle size:** @rokkit/core <15KB, @rokkit/ui <50KB, individual components <5KB
- **Performance:** Lists >1000 items need virtual scrolling

---

## Project Structure

| Package | Folder | Description |
|---------|--------|-------------|
| `@rokkit/actions` | `packages/actions/` | Svelte actions (keyboard, navigator, dismissable, reveal, etc.) |
| `@rokkit/chart` | `packages/chart/` | Chart/visualization components |
| `@rokkit/cli` | `packages/cli/` | CLI tools |
| `@rokkit/core` | `packages/core/` | Constants, utilities, field mapping, icon collections |
| `@rokkit/data` | `packages/data/` | Data structures (Dataset, hierarchy, parsing, filters) |
| `@rokkit/forms` | `packages/forms/` | Schema-driven form system |
| `@rokkit/helpers` | `packages/helpers/` | Helper functions |
| `@rokkit/icons` | `packages/icons/` | SVG icon sets |
| `@rokkit/states` | `packages/states/` | Reactive state (ListController, NestedController, Proxy) |
| `@rokkit/themes` | `packages/themes/` | CSS themes (base + rokkit/minimal/material/glass) |
| `@rokkit/tutorial` | `packages/tutorial/` | Tutorial utilities |
| `@rokkit/ui` | `packages/ui/` | UI components |
| `sites/learn` | Documentation site + interactive demos + e2e tests |
