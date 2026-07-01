## Flexible, keyboard-navigable lists

List is a vertical, selection-aware list with field mapping, nested
groups (1–2 levels), and snippet-based customisation. The right tool
when the items are the focus and groups are headings — for deeper
hierarchy, reach for Tree.

## Basic example

Pass an array of objects with `label` and optionally `icon` fields,
bind `value` to track the selection, use `onselect` for callbacks:

```svelte
<List {items} bind:value={active} onselect={(v) => ...} />
```

## Primitive arrays

Plain arrays of strings or numbers work too — each primitive becomes
both the display text and the selected value. No need to wrap in
objects unless you want richer attributes.

## Nested groups

Items with a `children` array render as collapsible groups. Add
`collapsible={true}` to enable toggling. Arrow keys move through
visible items; left/right collapse and expand groups.

```svelte
<List
  items={[
    { label: 'Mail',     children: [{ label: 'Inbox', value: 'inbox' }] },
    { label: 'Settings', children: [{ label: 'Profile', value: 'profile' }] }
  ]}
  collapsible
/>
```

## Field mapping

Remap your data's field names without transforming the data itself:

```svelte
<List items={routes} fields={{ label: 'name', value: 'path', icon: 'symbol' }} />
```

## Custom item rendering

Use the `itemContent` snippet to fully control what each row looks
like — the snippet receives a `ProxyItem`. For items that need
entirely different layouts (mixed content kinds), set
`item.snippet = 'name'` to route to a named snippet; items without
a `snippet` field fall back to `itemContent`.

## Config-style rows — `ItemSwitch` / `ItemToggle`

For the common "settings row with a switch or a toggle-group" pattern,
drop the paired renderers into `itemContent`. They render inert
markup (spans + `data-*` hooks), so nothing interactive nests inside
the row's own `<button>` — clicking anywhere on the row still fires
`onselect`, which is where you flip the underlying data.

```svelte
<script>
  import { List, ItemSwitch, ItemToggle } from '@rokkit/ui'

  const settings = $state([
    { label: 'Notifications', description: 'Alerts & sounds', checked: true },
    { label: 'Dark mode',     description: 'Theme',            checked: false },
    { label: 'Theme',    value: 'auto', options: ['light', 'dark', 'auto'] }
  ])
</script>

<List items={settings} onselect={(_, proxy) => {
  // Row-click flips the switch on binary rows.
  if ('checked' in proxy.value) proxy.value.checked = !proxy.value.checked
}}>
  {#snippet itemContent(proxy)}
    {#if proxy.get('options')}
      <ItemToggle {proxy} onchange={(v) => (proxy.value.value = v)} />
    {:else}
      <ItemSwitch {proxy} />
    {/if}
  {/snippet}
</List>
```

## Interactive elements in snippets — custom controls

Custom controls (Toggle, Switch, inputs, contenteditable) can be
nested inside item snippets too. Navigator detects nested interactive
descendants and defers to them, so a click on your inner control does
not trigger the row's `onselect`. Two caveats:

- Nested `<button>` inside `<button>` is invalid HTML — the parser
  hoists the inner one out during SSR. Use `<div role="button">` or
  the `ItemSwitch` / `ItemToggle` renderers above.
- Nested `[role="button"]`, `[role="switch"]`, `<input>` and
  `<span tabindex>` are all recognised by Navigator's guard.

## ProxyItem API

`proxy.label`, `proxy.icon`, `proxy.href`, `proxy.value`,
`proxy.disabled`, `proxy.expanded`, `proxy.get('field')`.
