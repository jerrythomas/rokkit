export const menuDocs = `## Trigger + dropdown action list

Menu is a click-to-open dropdown of actions. It uses the same data
shape and snippet system as List, plus a trigger button, an open
direction, and alignment options. Keyboard nav moves through leaf
items only — groups are visual organization.

## Basic example

\`\`\`svelte
<script>
  import { Menu } from '@rokkit/ui'

  const actions = [
    { label: 'Copy', icon: 'i-glyph:copy' },
    { label: 'Cut', icon: 'i-glyph:scissors' },
    { label: 'Paste', icon: 'i-glyph:clipboard' },
    { label: 'Delete', icon: 'i-glyph:trash-bin' }
  ]
</script>

<Menu items={actions} label="Actions" onselect={(v) => console.log(v)} />
\`\`\`

## Grouped items

Pass items with \`children\` to render group headers. The keyboard
navigator walks leaves, not groups, so Up/Down moves through all
actions sequentially.

\`\`\`svelte
<Menu
  items={[
    { label: 'File', children: [
      { label: 'New', icon: 'i-glyph:add-circle' },
      { label: 'Open', icon: 'i-glyph:folder-open' }
    ] },
    { label: 'Edit', children: [
      { label: 'Undo', icon: 'i-glyph:restart' },
      { label: 'Copy', icon: 'i-glyph:copy' }
    ] }
  ]}
  label="Menu"
/>
\`\`\`

## Alignment & direction

- \`align\` — \`start\` (default) or \`end\` — which trigger edge the
  dropdown aligns to.
- \`direction\` — \`down\` (default) or \`up\` — direction of expansion.
  Useful for menus near the bottom of the viewport.

## Snippets

- \`itemContent(proxy)\` — override the content inside a leaf button.
- \`groupContent(proxy)\` — override the content inside a group header.
- \`[name](proxy)\` — register a named per-item snippet by setting
  \`item.snippet = 'name'\` on the data; falls back to \`itemContent\`.
`
