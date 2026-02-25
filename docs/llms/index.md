# Rokkit LLM Reference

> Quick-reference documentation for AI agents and developers working across the Rokkit monorepo.

## Dependency Graph

```
@rokkit/core          ← Foundation: types, constants, FieldMapper, utilities
  ↑
@rokkit/states        ← State: Proxy, ListController, NestedController, Vibe
  ↑
@rokkit/actions       ← Interaction: navigator, keyboard, reveal, hover effects
  ↑
@rokkit/data          ← Data: DataSet, joins, filters, type detection
  ↑
@rokkit/ui            ← Components: 33 UI components (depends on core, states, actions)
@rokkit/forms         ← Forms: FormBuilder, FormRenderer, 18+ input types
@rokkit/chart         ← Charts: Plot system, ChartBrewer, D3-based

@rokkit/themes        ← CSS: 4 theme variants (rokkit, minimal, material, glass)
@rokkit/icons         ← Icons: JSON bundles, Iconify format, 7 collections
@rokkit/app           ← App: ThemeSwitcherToggle, ColorModeManager
@rokkit/cli           ← CLI: Icon bundling, SVG optimization
@rokkit/helpers       ← Testing: Vitest matchers, event simulators, mocks
```

---

## Sections

### UI Components → `components/`

One file per component. Start here when working with UI.

| Component | Category | File |
|-----------|----------|------|
| List | Interactive | [components/list.md](components/list.md) |
| Tree | Interactive | [components/tree.md](components/tree.md) |
| Select | Interactive | [components/select.md](components/select.md) |
| MultiSelect | Interactive | [components/multi-select.md](components/multi-select.md) |
| Menu | Interactive | [components/menu.md](components/menu.md) |
| Toggle | Interactive | [components/toggle.md](components/toggle.md) |
| Tabs | Interactive | [components/tabs.md](components/tabs.md) |
| Toolbar | Interactive | [components/toolbar.md](components/toolbar.md) |
| Switch | Interactive | [components/switch.md](components/switch.md) |
| Carousel | Interactive | [components/carousel.md](components/carousel.md) |
| Table | Interactive | [components/table.md](components/table.md) |
| Range | Interactive | [components/range.md](components/range.md) |
| SearchFilter | Interactive | [components/search-filter.md](components/search-filter.md) |
| Button / ButtonGroup | Presentational | [components/button.md](components/button.md) |
| BreadCrumbs | Presentational | [components/breadcrumbs.md](components/breadcrumbs.md) |
| Card | Presentational | [components/card.md](components/card.md) |
| Pill | Presentational | [components/pill.md](components/pill.md) |
| ProgressBar | Presentational | [components/progress-bar.md](components/progress-bar.md) |
| Rating | Presentational | [components/rating.md](components/rating.md) |
| Stepper | Presentational | [components/stepper.md](components/stepper.md) |
| Timeline | Presentational | [components/timeline.md](components/timeline.md) |
| Code | Presentational | [components/code.md](components/code.md) |
| FloatingAction | Overlay | [components/floating-action.md](components/floating-action.md) |
| FloatingNavigation | Overlay | [components/floating-navigation.md](components/floating-navigation.md) |
| Reveal | Effect wrapper | [components/reveal.md](components/reveal.md) |
| Tilt | Visual Effect | [components/tilt.md](components/tilt.md) |
| Shine | Visual Effect | [components/shine.md](components/shine.md) |

→ Overview of all components + patterns: [components/index.md](components/index.md)

### Actions → `actions/`

One file per Svelte action.

| Action | Purpose | File |
|--------|---------|------|
| navigator | Keyboard nav + click routing | [actions/navigator.md](actions/navigator.md) |
| keyboard | Key → custom event mapping | [actions/keyboard.md](actions/keyboard.md) |
| navigable | Simple directional events | [actions/navigable.md](actions/navigable.md) |
| dismissable | Click-outside / Escape close | [actions/dismissable.md](actions/dismissable.md) |
| swipeable | Touch/mouse swipe gestures | [actions/swipeable.md](actions/swipeable.md) |
| pannable | Drag/pan with coordinates | [actions/pannable.md](actions/pannable.md) |
| reveal | Scroll-triggered animations | [actions/reveal.md](actions/reveal.md) |
| hoverLift | Elevation effect on hover | [actions/hover-lift.md](actions/hover-lift.md) |
| magnetic | Cursor-tracking displacement | [actions/magnetic.md](actions/magnetic.md) |
| ripple | Material click ripple | [actions/ripple.md](actions/ripple.md) |
| themable | Apply theme attributes | [actions/themable.md](actions/themable.md) |
| skinnable | Apply CSS variables | [actions/skinnable.md](actions/skinnable.md) |

→ Overview + patterns: [actions/index.md](actions/index.md)

### State Management → `states/`

| Class / Store | Purpose | File |
|---------------|---------|------|
| ListController | Flat list nav, selection, focus | [states/list-controller.md](states/list-controller.md) |
| NestedController | Hierarchical nav + expand/collapse | [states/nested-controller.md](states/nested-controller.md) |
| Proxy | Reactive field-mapped item wrapper | [states/proxy.md](states/proxy.md) |
| Vibe | Global theme/appearance state | [states/vibe.md](states/vibe.md) |
| Messages | Global localization store | [states/messages.md](states/messages.md) |

→ Overview: [states/index.md](states/index.md)

### Forms → `forms/`

| Topic | File |
|-------|------|
| FormBuilder + FormRenderer | [forms/form-builder.md](forms/form-builder.md) |
| Input types (18+) | [forms/input-types.md](forms/input-types.md) |
| Schema + Layout | [forms/schema-layout.md](forms/schema-layout.md) |

→ Overview: [forms/index.md](forms/index.md)

### Packages → `packages/`

Smaller-scope packages each in a single file.

| Package | File |
|---------|------|
| @rokkit/core | [packages/core.md](packages/core.md) |
| @rokkit/data | [packages/data.md](packages/data.md) |
| @rokkit/chart | [packages/chart.md](packages/chart.md) |
| @rokkit/themes | [packages/themes.md](packages/themes.md) |
| @rokkit/icons | [packages/icons.md](packages/icons.md) |
| @rokkit/app | [packages/app.md](packages/app.md) |
| @rokkit/cli | [packages/cli.md](packages/cli.md) |
| @rokkit/helpers | [packages/helpers.md](packages/helpers.md) |

---

## Architectural Decisions

| ADR | Decision | Status |
|-----|----------|--------|
| [ADR-001](../decisions/001-component-architecture.md) | Focus on custom implementations, standardize `options` prop | Accepted |
| [ADR-002](../decisions/002-package-rename.md) | Rename @rokkit/bits-ui → @rokkit/composables | Accepted |
| [ADR-003](../decisions/003-mvc-separation.md) | Fold composables into ui, adopt states/actions in ui | Complete |

## Common Patterns

### Value Binding Contract

All selection components bind extracted primitives, not full objects:

```svelte
<!-- fields.value defaults to 'value' -->
<Select options={users} fields={{ text: 'name', value: 'id' }} bind:value={selectedId} />
<Toggle options={['day', 'week', 'month']} bind:value={period} />
```

`onchange(value, item)` — first arg is extracted primitive, second is full item.

### Field Mapping

```svelte
<List items={data} fields={{ text: 'label', value: 'id', icon: 'avatar', children: 'nodes' }} />
```

### MVC Pattern (ADR-003)

```svelte
<!-- Model -->
let controller = new ListController(items, value, fields)

<!-- View (Svelte) -->
<div use:navigator={{ wrapper: controller, direction: 'vertical' }}
     on:action={(e) => handle(e.detail.name, e.detail.data)}>
  {#each controller.data as row (row.key)}
    <div data-path={row.key}>{row.value.text}</div>
  {/each}
</div>
```

### Theme System

```svelte
import { vibe } from '@rokkit/states'
vibe.mode = 'dark'
vibe.style = 'minimal'
// Applied via: <div use:themable={{ theme: vibe }}>
// Or: <div data-style="minimal" data-mode="dark">
```
