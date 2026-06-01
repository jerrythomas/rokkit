export const rangeDocs = `## Slider for numeric input

Range is a slider input for picking a number between two endpoints —
single-value or dual-thumb for a range. Useful for volume, opacity,
budget filters, age brackets, and anywhere a number-line UX reads
better than a text input.

## Basic example

\`\`\`svelte
<Range bind:value min={0} max={100} step={1} />
\`\`\`

## Ticks and labels

Pass \`ticks={N}\` to draw N evenly-spaced tick marks. \`labelSkip\` controls
how many ticks to skip between labels (\`labelSkip={2}\` labels every
other tick). Useful when you want users to see the major points
without crowding.

## Range mode (lower + upper)

\`range={true}\` switches to dual-thumb mode. Bind \`lower\` and \`upper\`
separately:

\`\`\`svelte
<Range range bind:lower bind:upper min={0} max={100} />
\`\`\`

Useful for "filter products between $20 and $80" or "show events
between 9 AM and 5 PM."
`
