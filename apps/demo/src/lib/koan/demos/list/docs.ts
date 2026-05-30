export const listDocs = `## Flexible, keyboard-navigable lists

List is a vertical, selection-aware list with field mapping, nested
groups (1–2 levels), and snippet-based customisation. The right tool
when the items are the focus and groups are headings — for deeper
hierarchy, reach for Tree.

## Basic example

Pass an array of objects with \`label\` and optionally \`icon\` fields,
bind \`value\` to track the selection, use \`onselect\` for callbacks:

\`\`\`svelte
<List {items} bind:value={active} onselect={(v) => ...} />
\`\`\`

## Primitive arrays

Plain arrays of strings or numbers work too — each primitive becomes
both the display text and the selected value. No need to wrap in
objects unless you want richer attributes.

## Nested groups

Items with a \`children\` array render as collapsible groups. Add
\`collapsible={true}\` to enable toggling. Arrow keys move through
visible items; left/right collapse and expand groups.

\`\`\`svelte
<List
  items={[
    { label: 'Mail',     children: [{ label: 'Inbox', value: 'inbox' }] },
    { label: 'Settings', children: [{ label: 'Profile', value: 'profile' }] }
  ]}
  collapsible
/>
\`\`\`

## Field mapping

Remap your data's field names without transforming the data itself:

\`\`\`svelte
<List items={routes} fields={{ label: 'name', value: 'path', icon: 'symbol' }} />
\`\`\`

## Custom item rendering

Use the \`itemContent\` snippet to fully control what each row looks
like — the snippet receives a \`ProxyItem\`. For items that need
entirely different layouts (mixed content kinds), set
\`item.snippet = 'name'\` to route to a named snippet; items without
a \`snippet\` field fall back to \`itemContent\`.

## Interactive elements in snippets

Snippets support full Svelte reactivity — checkboxes, toggles,
inputs all work inline. Use \`proxy.value\` to access the raw item and
mutate it directly. Call \`e.stopPropagation()\` on a control's click
to prevent the parent List from also triggering item selection.

## ProxyItem API

\`proxy.label\`, \`proxy.icon\`, \`proxy.href\`, \`proxy.value\`,
\`proxy.disabled\`, \`proxy.expanded\`, \`proxy.get('field')\`.
`
