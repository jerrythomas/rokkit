export const pillDocs = `## Compact tag display

Pill is a small, optionally-removable token used to display tags,
filters, selected values, or any other compact label. Used by
MultiSelect for the trigger chips, by SearchFilter for active filter
chips, and anywhere "show this value compactly" is the right idiom.

## Basic example

\`\`\`svelte
<Pill value="svelte" />
<Pill value={{ label: 'TypeScript', icon: 'i-mdi:language-typescript' }} />
\`\`\`

Pill accepts either a primitive value (used as both label and value)
or an object with field-mapped attributes. \`fields\` lets you remap
to your data's own keys.

## Removable

Pass \`removable={true}\` to surface a remove button. \`onremove\` fires
with the underlying value on click OR when Delete/Backspace is
pressed while the pill is focused.

\`\`\`svelte
<Pill value="svelte" removable onremove={(v) => tags = tags.filter(t => t !== v)} />
\`\`\`

## Custom content

The \`content\` snippet receives a \`ProxyItem\` for full control over
the pill's body — useful when you need an icon, avatar, or rich
inline composition inside the pill.

## Styling hooks

\`[data-pill]\` is the root (carries \`data-removable\`, \`data-disabled\`,
focus state). \`[data-pill-remove]\` is the remove button.
`
