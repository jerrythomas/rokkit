export const toggleDocs = `## Segmented control for N options

Toggle is the segmented control — a row of pill buttons where exactly
one is active. The right choice when you have 2-5 mutually exclusive
options and want them visible all at once (vs hidden behind a Select
dropdown).

The canvas's own \`Live | Code | API | Docs\` switcher is a Toggle.
The Tweaks slab uses Toggle for enum-typed props. Both surface the
same component.

## Basic example

\`\`\`svelte
<Toggle
  options={[
    { label: 'List', value: 'list' },
    { label: 'Grid', value: 'grid' },
    { label: 'Map',  value: 'map'  }
  ]}
  bind:value={view}
/>
\`\`\`

Pass string arrays for primitive cases — \`['list', 'grid', 'map']\`
work just like objects when label === value.

## Field mapping + icons

Items can carry icon classes (\`icon: 'i-mdi:home'\`) for richer
buttons. Use \`fields\` to remap from your data's own keys.

## Variants

\`group\` (default) — segmented row of pills.
\`button\` — single button that cycles through options on click. Use
when the options have a natural ordering and you want to advance
through them sequentially.

## Sizes

\`sm\` / \`md\` (default) / \`lg\` — matches the surrounding rhythm.
Smaller sizes work well in toolbars and headers; larger in settings
pages.
`
