## Single-value picker whose trigger reflects the selection

Dropdown is shaped like Menu — same items, same panel, same
alignment + direction — but the trigger label shows the currently
selected value instead of a static button caption. Reach for it
when the user is picking a value (not invoking an action).

## Basic example

```svelte
<script>
  import { Dropdown } from '@rokkit/ui'

  const fonts = [
    { label: 'System UI', value: 'system' },
    { label: 'Serif',     value: 'serif' },
    { label: 'Mono',      value: 'mono' }
  ]

  let font = $state('system')
</script>

<Dropdown items={fonts} bind:value={font} />
```

## Dropdown vs Select vs Menu

- `Dropdown` — single-value picker, trigger shows the selection,
  no built-in filter. Good for short lists where the picker is the
  whole UI.
- `Select` — single-value picker with optional filter, virtualisation,
  and a custom popover for longer lists.
- `Menu` — action menu, trigger is a static label, no notion of
  "current value".

## Alignment & direction

- `align` — `start` (default) / `end` — which trigger edge the
  panel aligns to.
- `direction` — `down` (default) / `up` — direction of expansion.

## Placeholder

When `value` is unset, the trigger renders the `placeholder`
string (default messages.select).
