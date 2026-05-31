export const toolbarDocs = `## Grouped action bar with arrow-key navigation

Toolbar follows the WAI-ARIA toolbar pattern — a single tabstop in
the tab order, then arrow keys move focus between items. Separators
and spacers are skipped by the navigator and re-render automatically
as items shift.

## Basic example

\`\`\`svelte
<script>
  import { Toolbar } from '@rokkit/ui'

  const items = [
    { label: 'Bold', icon: 'i-glyph:text-bold' },
    { label: 'Italic', icon: 'i-glyph:text-italic' },
    { label: 'Underline', icon: 'i-glyph:text-underline' },
    { itemType: 'separator' },
    { label: 'Align Left', icon: 'i-glyph:align-left' },
    { label: 'Align Center', icon: 'i-glyph:align-center' },
    { label: 'Align Right', icon: 'i-glyph:align-right' }
  ]
</script>

<Toolbar {items} onclick={(item) => console.log(item.label)} />
\`\`\`

## Separators & spacers

- \`itemType: 'separator'\` — a visual divider between groups.
- \`itemType: 'spacer'\` — a flex spacer that pushes following items
  to the opposite end of the bar.

Both are skipped during keyboard navigation, and the index-based
\`data-path\` only counts interactive items so focus order stays
intuitive even after inserts/removes.

## Position & orientation

\`position\` decides where the bar lives — \`top\` / \`bottom\` give a
horizontal bar, \`left\` / \`right\` give a vertical one. Combined with
\`sticky\`, it can anchor to a viewport edge.

\`\`\`svelte
<Toolbar items={tools} position="left" sticky />
\`\`\`

## Compact mode

\`compact={true}\` reduces padding inside each button — useful for
dense editor chrome where the toolbar shares space with a canvas.
`
