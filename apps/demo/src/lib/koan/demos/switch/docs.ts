export const switchDocs = `## Binary on/off pill switch

Switch is an iOS-style toggle for binary preferences — notifications
on/off, dark mode light/dark, sync enabled/disabled. Use it when the
two states are equal opposites and the user is flipping between them.

For 3+ option selection use Toggle (segmented control). For a check
that's part of a form with validation use the FormRenderer
\`checkbox\` renderer.

## Basic example

\`\`\`svelte
<Switch bind:value />
\`\`\`

Default options are \`false\` / \`true\` — clicking flips between them.
Pass custom \`options\` for non-boolean state values:

\`\`\`svelte
<Switch
  bind:value
  options={[
    { label: 'Off', value: 'off' },
    { label: 'On',  value: 'on'  }
  ]}
/>
\`\`\`

## Sizes

\`sm\` / \`md\` (default) / \`lg\`. Match the rhythm of the surrounding
UI — \`sm\` in dense forms, \`lg\` in settings pages.

## Label visibility

\`showLabels={true}\` renders the option labels next to the track,
making the active state legible from a distance. Off by default
because the thumb position usually tells the story.
`
