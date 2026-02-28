# Toggle & Selection Primitives Requirements

> Requirements for Toggle, Switch, CheckBox, and RadioGroup components.

## 1. Overview

This group covers components for selecting from a set of options or toggling boolean state:

| Component | Type | Package | Status |
|-----------|------|---------|--------|
| Toggle | Option-set toggle group | `@rokkit/ui` | Active |
| Switch | Boolean toggle | `@rokkit/composables` | Active (bits-ui based) |
| CheckBox | Boolean checkbox | `archive/ui/` | Archived |
| RadioGroup | Radio button group | `archive/ui/` | Archived |

## 2. Toggle

### 2.1 Props

| Prop | Type | Default | Bindable | Description |
|------|------|---------|----------|-------------|
| `options` | `ToggleItem[]` | `[]` | No | Toggle options |
| `fields` | `ToggleFields` | defaults | No | Field mapping (text, value, icon, disabled, description) |
| `value` | `unknown` | — | Yes | Selected value |
| `showLabels` | `boolean` | — | No | Show text alongside icons |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | No | Size variant |
| `disabled` | `boolean` | `false` | No | Disable all options |
| `onchange` | callback | — | No | `(value, item) => void` |
| `item` | `Snippet` | — | No | Custom option rendering |

### 2.2 Rendering

- Horizontal button group where one option is selected
- Selected option highlighted with active state
- Icon-only or icon+text modes
- `description` field used for tooltip on icon-only buttons

### 2.3 Keyboard

| Key | Action |
|-----|--------|
| `ArrowLeft` / `ArrowRight` | Move selection |
| `Home` | Select first |
| `End` | Select last |

### 2.4 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-toggle` | root | Toggle container |
| `data-toggle-item` | button | Individual option |
| `data-selected` | button | Selected option |
| `data-disabled` | button/root | Disabled state |
| `data-size` | root | Size variant |

### 2.5 ARIA

- Root: `role="radiogroup"`, `aria-label`
- Each item: `role="radio"`, `aria-checked`

## 3. Switch (Boolean Toggle)

### 3.1 Current State

The Switch in `@rokkit/composables` wraps bits-ui and provides a boolean on/off toggle. The archived `Switch.svelte` was an option-list switch (different API).

### 3.2 Requirements

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | `false` | Bindable — toggle state |
| `disabled` | `boolean` | `false` | Disabled |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `onchange` | callback | — | `(checked: boolean) => void` |

### 3.3 Rendering

- Track with sliding thumb
- Visual state change on toggle

### 3.4 ARIA

- `role="switch"`, `aria-checked`

### 3.5 Decision Needed

The `InputSwitch` in `@rokkit/forms` expects an option-list API (backlog #1). Need to decide:
- Boolean toggle (current composables Switch) → for forms boolean fields
- Option-set switch (old archive pattern) → essentially a Toggle with different styling

**Recommendation**: Keep Switch as boolean-only, use Toggle for option sets.

## 4. CheckBox (Archived)

### 4.1 Source

`archive/ui/src/CheckBox.svelte` — uses `defaultStateIcons.checkbox` for checked/unchecked/indeterminate icons.

### 4.2 Requirements

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | `false` | Bindable |
| `indeterminate` | `boolean` | `false` | Indeterminate state (for tree selection) |
| `disabled` | `boolean` | `false` | Disabled |
| `label` | `string` | — | Label text |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `onchange` | callback | — | `(checked: boolean) => void` |

### 4.3 Rendering

- Icon-based checkbox (not native HTML checkbox)
- Three visual states: unchecked, checked, indeterminate
- Uses `@rokkit/core` `defaultStateIcons.checkbox`

### 4.4 Notes

`InputCheckbox` in `@rokkit/forms` already exists and is functional. The UI-level CheckBox is for use outside forms (e.g., in tables, trees).

## 5. RadioGroup (Archived)

### 5.1 Source

`archive/ui/src/RadioGroup.svelte` — radio button group with field mapping.

### 5.2 Requirements

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `any[]` | `[]` | Options array |
| `fields` | `object` | defaults | Field mapping (text, value, icon, disabled) |
| `value` | `unknown` | — | Bindable — selected value |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout direction |
| `disabled` | `boolean` | `false` | Disable all |
| `onchange` | callback | — | `(value, item) => void` |

### 5.3 ARIA

- Root: `role="radiogroup"`
- Each option: `role="radio"`, `aria-checked`

## 6. Dependencies

| Package | What | Purpose |
|---------|------|---------|
| `@rokkit/core` | `defaultStateIcons` | Checkbox icons |
| `@rokkit/ui` | `ItemProxy` | Field mapping for Toggle/RadioGroup |
| `@rokkit/composables` | `bits-ui` | Switch primitive |

## 7. Gaps

1. Switch not in `@rokkit/ui` yet (in composables, should move per inventory)
2. CheckBox not recreated from archive
3. RadioGroup not recreated from archive
4. `InputSwitch` in forms broken (backlog #1) — API mismatch with composables Switch
5. No toggle group with multi-select (checkbox group pattern)
