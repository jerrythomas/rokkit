# Switch

> iOS-style binary toggle for switching between two states.

**Export**: `Switch` from `@rokkit/ui`
**Navigation**: Single `<button role="switch">` — no controller needed

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SwitchItem[]` | `[false, true]` | Two options (off, on). Supports primitives, strings, or `{ icon, value }` objects |
| `fields` | `Partial<SwitchFields>` | — | Field mapping |
| `value` | `unknown` | `false` | Current value (bindable) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `disabled` | `boolean` | `false` | Disables interaction |
| `class` | `string` | `''` | Extra CSS classes |
| `onchange` | `(value, item) => void` | — | Called on toggle |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| `text` | `'text'` | Label text |
| `value` | `'value'` | Toggle value |
| `icon` | `'icon'` | Icon CSS class |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Space / Enter` | Toggle between options |
| `ArrowRight` | Move to "on" state |
| `ArrowLeft` | Move to "off" state |

## Examples

### Boolean toggle (default)

```svelte
<script>
  import { Switch } from '@rokkit/ui'
  let enabled = $state(false)
</script>

<Switch bind:value={enabled} onchange={(v) => console.log(v)} />
```

### String options

```svelte
<Switch options={['off', 'on']} bind:value={status} />
```

### Icon options

```svelte
<Switch
  options={[
    { value: 'light', icon: 'i-sun' },
    { value: 'dark', icon: 'i-moon' }
  ]}
  bind:value={theme}
/>
```

## State Attributes (CSS hooks)

| Attribute | Element | When |
|-----------|---------|------|
| `data-switch` | Root `<button>` | Always |
| `aria-checked` | Root `<button>` | `"true"` when "on" state active |
| `data-switch-track` | Track element | Always |
| `data-switch-thumb` | Sliding thumb | Always |

## Notes

- Exactly two options. The first is "off", the second is "on".
- CSS uses `--switch-travel` custom property to animate thumb position.
- Use `Switch` for binary choices; use `Toggle` for 3+ mutually exclusive options.
- In `@rokkit/forms`, `InputSwitch` wraps `Switch`.
