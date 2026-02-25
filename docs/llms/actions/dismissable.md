# dismissable

> Closes an element on outside click or `Escape` key press.

**Package**: `@rokkit/actions`
**File**: `dismissable.svelte.js`

## Usage

```svelte
<div use:dismissable on:dismiss={() => open = false}>
  <!-- dropdown, modal, popover content -->
</div>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable the action |

## Events

| Event | Trigger | Description |
|-------|---------|-------------|
| `dismiss` | Outside click OR `Escape` | Element should close |

## Examples

### Dropdown

```svelte
<script>
  let open = $state(false)
</script>

<button onclick={() => open = true}>Open</button>

{#if open}
  <div use:dismissable on:dismiss={() => open = false}>
    <ul><!-- items --></ul>
  </div>
{/if}
```

### Modal

```svelte
<div use:themable={{ theme: vibe }} use:dismissable on:dismiss={() => showModal = false}>
  <div role="dialog" aria-modal="true">
    <!-- modal content -->
  </div>
</div>
```

### Conditionally enabled

```svelte
<div use:dismissable={{ enabled: isOpen }} on:dismiss={close}>
```

## Notes

- Outside click detection: click event target is checked against the element's `contains()`.
- `Escape` listener is document-level.
- Select/MultiSelect/Menu use this internally — no need to add it separately on those.
