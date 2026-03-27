---
description: Look up naming conventions for components, props, data attributes, CSS tokens, files, and events. Usage: /call what-you-want-to-name
---

Naming conventions for: **$ARGUMENTS**

## Data Attributes

```
Root element:       data-<component>              e.g. data-list, data-select, data-tabs
Child elements:     data-<component>-<element>    e.g. data-list-item, data-select-trigger
State attributes:   data-<state>=<value>          e.g. data-open="true", data-selected, data-disabled
Navigation hook:    data-path={key}               required on every keyboard-navigable element
Style context:      data-style="rokkit|minimal|material|glass"
Mode context:       data-mode="light|dark"
```

**State attribute pattern** — use `undefined` to omit (keeps HTML clean):

```svelte
data-open={isOpen || undefined} ← present when true, absent when false data-selected={selected ||
  undefined}
data-disabled={disabled || undefined}
data-variant="primary" ← enum, always present data-orientation="horizontal" ← enum, always present
```

## Component Props

```
items        — data array (unknown[])
value        — selected/current value ($bindable)
fields       — key remapping (Record<string, string>)
onchange     — value change callback
onselect     — item selection callback
class        — CSS class passthrough (use class: className = '' in $props)
icons        — icon override object
disabled     — boolean disable
```

**ProxyItem default field mappings** (what `fields` remaps from data):

```
fields.label   ?? 'label'        → display text (NOT 'text', NOT 'name')
fields.value   ?? 'value'        → semantic value
fields.icon    ?? 'icon'         → icon class
fields.disabled ?? 'disabled'    → disabled state
fields.subtext ?? 'description'  → secondary text
fields.badge   ?? 'badge'        → badge text
fields.avatar  ?? 'image'        → avatar/image URL
fields.shortcut ?? 'shortcut'    → keyboard shortcut display
fields.href    ?? 'href'         → link target
```

## Component Names (PascalCase)

```
Tier 1: Button, Card, Badge, Message, Pill, Icon, Spinner, Avatar
Tier 2: BreadCrumbs, PaletteManager, Timeline
Tier 3: List, Tree, Tabs, Toggle, Toolbar, Table, SearchFilter
Tier 4: Menu, Select, MultiSelect, Dropdown, LazyTree, ComboBox
Forms:  FormRenderer, FormBuilder, Input, TextArea, Checkbox, Radio, Switch
```

## File Naming

```
Component:    PascalCase.svelte          → MyComponent.svelte
Unit test:    PascalCase.spec.svelte.ts  → MyComponent.spec.svelte.ts
E2E test:     kebab-case.e2e.ts          → my-component.e2e.ts
Theme CSS:    kebab-case.css             → my-component.css
Playground:   site/src/routes/(play)/playground/components/kebab-case/+page.svelte
Docs:         site/src/routes/(learn)/docs/components/kebab-case/+page.svelte
LLMs txt:     site/static/llms/components/kebab-case.txt
```

## CSS Token Conventions

```
bg-surface-z0..z3        surface backgrounds (z0=darkest, z3=lightest in dark mode)
text-surface-z4..z10     text colors (z4=subtle, z10=high-contrast)
border-surface-z2..z5    border colors (z2=subtle, z5=visible)

bg-primary-z3..z6        primary accent backgrounds
text-primary-z6..z9      primary accent text
border-primary-z4..z5    primary accent borders

bg-secondary-z3..z6      secondary accent backgrounds
text-secondary-z6..z9    secondary accent text
border-secondary-z4      secondary accent borders (used for hover in minimal)

from-primary-z5 to-secondary-z5   rokkit gradient pair
bg-gradient-to-b/t/r/l            gradient direction utilities
bg-none                           background-image: none (prevents rokkit gradient bleed)
```

## Event / Callback Names

```
onchange     — value changed (e.g. selection changed, input changed)
onselect     — item explicitly selected (menu item, list item)
onexpand     — item or group expanded
oncollapse   — item or group collapsed
onopen       — dropdown/panel opened
onclose      — dropdown/panel closed
onsubmit     — form submitted
oninput      — input text changed (debounced)
```

## Icon Classes

```
Format:       i-<set>:<name>             e.g. i-solar:check-bold, i-glyph:list
State icons:  state-error, state-warning, state-success, state-info
Action icons: i-solar:close-circle-bold-duotone, i-solar:add-circle-bold
```

## ARIA Roles by Component Type

```
List/nav (persistent):   role="listbox" on root, role="option" on items
Toggle group:            role="radiogroup" on root, role="radio" + aria-checked on items
Tab list:                role="tablist" on container, role="tab" on triggers, role="tabpanel" on panels
Menu dropdown:           role="menu" on dropdown, role="menuitem" on items
Select dropdown:         role="listbox" on dropdown, role="option" on items
Trigger button:          aria-haspopup="listbox|menu", aria-expanded={isOpen}
Group header:            aria-expanded={proxy.expanded}
Current item:            aria-current="page" (nav), aria-selected (list/tab)
Decorative icons:        aria-hidden="true"
```

## Package Names

```
@rokkit/ui        — UI components (Svelte)
@rokkit/states    — ProxyTree, ProxyItem, Wrapper, ListController, NestedController
@rokkit/actions   — Navigator, use:navigator, use:dismissable, use:reveal
@rokkit/core      — DEFAULT_STATE_ICONS, field mapping utilities, constants
@rokkit/forms     — FormRenderer, FormBuilder, schema-driven forms
@rokkit/themes    — CSS themes (base + 4 visual themes)
@rokkit/data      — Dataset, hierarchy, filters, data structures
@rokkit/helpers   — utility functions and test mocks
```
