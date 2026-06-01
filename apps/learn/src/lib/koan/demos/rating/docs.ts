export const ratingDocs = `## Star (or heart) rating input

Rating is a row of clickable icons — typically stars — for picking a
discrete value out of N. The default icons are stars but any icon
classes work.

## Basic example

\`\`\`svelte
<Rating bind:value max={5} />
\`\`\`

Click the Nth icon to set value to N. Click the currently-selected
icon to clear (value → 0).

## Custom icons

Pass \`icons\` to override the filled and empty states. Hearts,
thumbs, fire, any glyph the theme has access to.

\`\`\`svelte
<Rating
  bind:value
  max={10}
  icons={{ filled: 'i-mdi:heart', empty: 'i-mdi:heart-outline' }}
/>
\`\`\`

## Disabled

\`disabled={true}\` renders the same UI but suppresses interaction —
useful for read-only displays of an existing rating.
`
