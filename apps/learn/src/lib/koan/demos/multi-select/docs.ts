export const multiSelectDocs = `## Pick many values from a list

MultiSelect is a dropdown input for choosing multiple values. Selected
items render as tags inside the trigger button — click a tag to
remove. Supports field mapping for any data shape, grouped options,
and fully customisable option rendering via snippets.

## Basic example

Pass an array of objects with \`text\` and optionally \`value\` fields,
then bind \`value\` to an array of the selected values:

\`\`\`svelte
<MultiSelect {items} bind:value={selectedIds} placeholder="Pick colours" />
\`\`\`

## Field mapping

When your data doesn't use \`text\` / \`value\` as field names, remap
without transforming:

\`\`\`svelte
<MultiSelect
  items={users}
  fields={{ text: 'name', value: 'id' }}
  bind:value
/>
\`\`\`

## Grouped options

Items with a \`children\` array render as labelled groups with a visual
divider. Only leaf items are selectable — group headers are
presentational.

\`\`\`svelte
<MultiSelect
  items={[
    { text: 'Fruits',     children: [{ text: 'Apple', value: 'a' }] },
    { text: 'Vegetables', children: [{ text: 'Carrot', value: 'c' }] }
  ]}
  bind:value
/>
\`\`\`

## Tags display + overflow

Selected items appear as tags in the trigger button. Use \`maxDisplay\`
to limit how many tags are visible — additional selections collapse
into a \`+N more\` badge. Keeps the trigger compact when many items
are selected.

## Snippets and ProxyItem API

- **\`itemContent\`** — custom rendering for dropdown options
- **\`groupContent\`** — custom rendering for group headers

Each snippet receives a \`ProxyItem\` exposing \`proxy.label\`,
\`proxy.icon\`, \`proxy.value\`, \`proxy.disabled\`, and \`proxy.get('field')\`.

## Events

- **\`onchange(values, items)\`** — fires on every change, with both
  the array of selected values and the matching raw item objects
`
