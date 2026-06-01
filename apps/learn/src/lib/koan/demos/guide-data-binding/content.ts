export const guideContent = `# Data Binding

Rokkit is built around one principle: **your data should drive
your UI, not the other way around**. Every selection component —
\`List\`, \`Select\`, \`Tree\`, \`Tabs\`, \`Menu\`, \`Table\`, \`Grid\` —
works with your data as-is via a \`fields\` mapping, not by
forcing you to reshape it.

## The problem with rigid contracts

Most component libraries require your data to match a specific
shape. A \`Select\` needs \`{ label, value }\`, a \`Tree\` needs
\`{ name, children }\`. Every component has its own convention,
so you write adapter functions everywhere:

\`\`\`js
const selectOptions = users.map(u => ({ label: u.name, value: u.id }))
const treeNodes    = folders.map(f => ({ name: f.title, children: f.items }))
\`\`\`

That's noise. It's two transforms per component, plus a tax
every time a field rename happens upstream.

## The Rokkit approach

Every Rokkit component accepts a \`fields\` prop that maps **your
keys** to the **component's semantic fields**. Your
\`{ name, id, nested }\` data works directly — no transformation,
no adapter layer.

\`\`\`svelte
<List
  items={users}
  fields={{ label: 'name', value: 'id' }}
  bind:value
/>
\`\`\`

## Default field names

If you don't pass \`fields\`, every component falls back to a
sensible default set: \`label\`, \`value\`, \`icon\`, \`children\`,
\`disabled\`, \`description\`. Match those keys in your data and
\`fields\` becomes optional.

\`\`\`js
const items = [
  { label: 'Home', value: '/', icon: 'i-mdi:home' },
  { label: 'Docs', value: '/docs', icon: 'i-mdi:book' }
]
\`\`\`

## Primitives work too

For simple cases, an array of strings or numbers is a valid
\`items\` value. The component treats each entry as both label
and value:

\`\`\`svelte
<List items={['Small', 'Medium', 'Large']} bind:value />
\`\`\`

## Nested fields with dot notation

If your data has nested objects, point \`fields\` at them with
dot paths:

\`\`\`svelte
<List
  items={people}
  fields={{ label: 'profile.fullName', value: 'meta.uid' }}
/>
\`\`\`

## The semantic field vocabulary

| Field | Used by | What it does |
| --- | --- | --- |
| \`label\` | most | The text shown to the user |
| \`value\` | selection components | The bindable identifier |
| \`icon\` | most | CSS class for an inline icon |
| \`description\` | List / Menu | Secondary line under the label |
| \`children\` | Tree / Menu | Nested items recursion |
| \`disabled\` | most | Greys out + skips keyboard nav |
| \`badge\` | List / Tree | Right-aligned badge text |
| \`shortcut\` | Menu | Keyboard hint text on the right |
| \`href\` | BreadCrumbs / FloatingNav | Renders as a link |

## Bindable values

Selection components expose \`value\` as a \`$bindable()\` prop.
\`bind:value\` round-trips it without any \`onchange\` plumbing,
the same way \`<input bind:value>\` works in vanilla Svelte.

Multi-select components (\`MultiSelect\`, \`Swatch[multiple]\`)
bind an array of values instead of a single one — same prop
name, different shape.
`
