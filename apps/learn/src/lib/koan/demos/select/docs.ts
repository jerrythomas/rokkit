export const selectDocs = `## Pick one value from a list

Select is a single-value dropdown — the flat counterpart to
MultiSelect. Supports field mapping, grouped options, optional
filterable search, and full snippet-driven rendering.

## Basic example

Array of objects with \`text\` and optionally \`icon\` fields, bound
\`value\`. Set \`disabled: true\` on any item to make it unselectable:

\`\`\`svelte
<Select {items} bind:value={mode} placeholder="Pick theme mode" />
\`\`\`

## Field mapping

Use \`fields\` to point Select at your data's own keys:

\`\`\`svelte
<Select
  items={countries}
  fields={{ text: 'name', value: 'code', icon: 'flag' }}
  bind:value={countryCode}
/>
\`\`\`

## Grouped options

Items with a \`children\` array render as labelled groups with a visual
divider. Only leaf items are selectable.

## Filterable — type to narrow

For long lists, enable \`filterable\` to surface a search input at the
top of the dropdown. The filter matches against the display text of
each option; customise the input's hint via \`filterPlaceholder\`.

\`\`\`svelte
<Select
  items={countries}
  filterable
  filterPlaceholder="Type a country..."
/>
\`\`\`

## Custom option rendering

Use the \`itemContent\` snippet to control what appears inside each
dropdown option. The snippet receives a \`ProxyItem\` — use
\`proxy.label\`, \`proxy.icon\`, and \`proxy.get('fieldName')\` to access
fields by their mapped or raw name.

## Snippets

- **\`itemContent(proxy)\`** — custom rendering for dropdown options
- **\`groupContent(proxy)\`** — custom rendering for group headers
- **\`[name](proxy)\`** — per-item snippet; set \`item.snippet = 'name'\`

## Events

- **\`onchange(value, item)\`** — fires when the selection changes,
  with both the extracted value and the raw item object
`
