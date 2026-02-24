# Rokkit Package Reference

> Quick-reference documentation for AI agents and developers working across the Rokkit monorepo.

## Dependency Graph

```
@rokkit/core          ← Foundation: types, constants, FieldMapper, utilities
  ↑
@rokkit/states        ← State: Proxy, ListController, NestedController, Vibe
  ↑
@rokkit/actions       ← Interaction: navigator, keyboard, dismissable, swipeable
  ↑
@rokkit/data          ← Data: DataSet, joins, filters, type detection
  ↑
@rokkit/ui            ← Components: 22 UI components (depends on core, states, actions)
@rokkit/forms         ← Forms: FormBuilder, FormRenderer, 19 input types
@rokkit/chart         ← Charts: Plot system, ChartBrewer, D3-based

@rokkit/themes        ← CSS: 4 theme variants (rokkit, minimal, material, glass)
@rokkit/icons         ← Icons: JSON bundles, Iconify format, 7 collections
@rokkit/app           ← App: ThemeSwitcherToggle, ColorModeManager
@rokkit/cli           ← CLI: Icon bundling, SVG optimization
@rokkit/helpers       ← Testing: Vitest matchers, event simulators, mocks
```

## Package Matrix

| Package | Type | Exports | Dependencies | Doc |
|---------|------|---------|-------------|-----|
| [@rokkit/core](core.md) | Foundation | ~50 functions, FieldMapper, Theme | date-fns, ramda | [core.md](core.md) |
| [@rokkit/states](states.md) | State | Proxy, ListController, NestedController, Vibe, Messages | core, d3-array, ramda | [states.md](states.md) |
| [@rokkit/actions](actions.md) | Interaction | 10 Svelte actions | core, ramda | [actions.md](actions.md) |
| [@rokkit/data](data.md) | Data | DataSet, joins, typeOf, model, renamer | core, d3-array, ramda | [data.md](data.md) |
| [@rokkit/ui](ui.md) | Components | 24 components, types, utilities | core, states, actions, shiki (peer) | [ui.md](ui.md) |
| [@rokkit/forms](forms.md) | Forms | FormBuilder, FormRenderer, 19 inputs | core, states, ui, valibot | [forms.md](forms.md) |
| [@rokkit/chart](chart.md) | Charts | Plot.Root/Axis/Bar/Grid/Legend, ChartBrewer | core, data, states, d3-*, ramda | [chart.md](chart.md) |
| [@rokkit/themes](themes.md) | CSS | 4 theme variants, base styles | (CSS only) | [themes.md](themes.md) |
| [@rokkit/icons](icons.md) | Icons | 7 JSON bundles, 250+ icons | (JSON only) | [icons.md](icons.md) |
| [@rokkit/app](app.md) | App | ThemeSwitcherToggle, ColorModeManager | core, states, ui | [app.md](app.md) |
| [@rokkit/cli](cli.md) | CLI | rokkit bundle/build commands | iconify/tools, sade | [cli.md](cli.md) |
| [@rokkit/helpers](helpers.md) | Testing | Matchers, simulators, mocks | vitest | [helpers.md](helpers.md) |

## Common Patterns

### Field Mapping (used by ui, forms)
```javascript
// Map custom field names to component expectations
<List options={data} fields={{ text: 'name', value: 'id', icon: 'avatar' }} />
```

### MVC Separation (core → states → actions → component)
```javascript
// Model: states manages data + selection
let controller = new ListController(items, value, fields)

// Controller: actions handles interaction
<div use:navigator={{ wrapper: controller, orientation: 'vertical' }}>

// View: component renders
{#each controller.data as item}
  <div data-path={item.key}>{item.value.text}</div>
{/each}
```

### Theme System (themes + states.Vibe + actions.themable)
```javascript
import { vibe } from '@rokkit/states'
vibe.mode = 'dark'
vibe.style = 'minimal'
// Applied via: <div use:themable={{ theme: vibe }}>
```

## Architectural Decisions

| ADR | Decision | Status |
|-----|----------|--------|
| [ADR-001](../decisions/001-component-architecture.md) | Focus on custom implementations, standardize `options` prop | Accepted |
| [ADR-002](../decisions/002-package-rename.md) | Rename @rokkit/bits-ui → @rokkit/composables | Accepted |
| [ADR-003](../decisions/003-mvc-separation.md) | Fold composables into ui, adopt states/actions in ui | Complete |
