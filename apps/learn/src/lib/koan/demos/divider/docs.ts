export const dividerDocs = `## Visual separator between sections

Divider draws a thin line — horizontal by default, vertical when
needed for split rows. Optionally wraps a centred label so the
separator doubles as a section heading.

## Basic example

\`\`\`svelte
<Divider />
<Divider label="OR" />
<Divider orientation="vertical" />
\`\`\`

## Horizontal vs vertical

Horizontal dividers stretch full-width along the parent's main axis.
Vertical dividers are a thin column — useful inside flex rows for
visually separating inline groups (button trios, toolbar segments,
breadcrumbs).

## Label

The optional \`label\` prop renders centred text with the line
breaking around it on either side. Useful for "OR" between login
methods or "Recently added" between sections of a list.
`
