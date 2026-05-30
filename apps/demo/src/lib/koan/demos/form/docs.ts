export const formDocs = `## Schema in, validated form out

FormRenderer reads a JSON-Schema-ish object and renders the right
input per type — text, number, boolean, enum, email, date — with
built-in validation, dirty tracking, and an optional layout tree
when you want more than a vertical stack.

This is the data-first approach extended to forms: declare the
shape of your data, and the UI follows.

## Basic example

\`\`\`svelte
<script>
  import { FormRenderer } from '@rokkit/forms'
  const schema = {
    type: 'object',
    properties: {
      name:    { type: 'string', minLength: 2 },
      email:   { type: 'string', format: 'email' },
      age:     { type: 'integer', minimum: 13 },
      consent: { type: 'boolean' }
    },
    required: ['name', 'email', 'consent']
  }
  let data = $state({ name: '', email: '', age: null, consent: false })
</script>

<FormRenderer bind:data {schema} onsubmit={(d) => console.log(d)} />
\`\`\`

## How types map to renderers

- **string** → text input. \`format: 'email'\`, \`'password'\`, \`'url'\`,
  \`'tel'\`, \`'date'\`, \`'time'\`, \`'date-time'\` each dispatch to a
  specialised input.
- **string + enum** → radio or select (picked by option count).
- **integer / number** → numeric input with \`minimum\` / \`maximum\` /
  \`multipleOf\` constraints.
- **boolean** → switch or checkbox depending on layout context.
- **object** → nested fieldset, recursing into \`properties\`.
- **array** → array editor with add/remove.

Override the dispatch by setting \`renderer: 'name'\` on a layout
element — \`'toggle'\` / \`'switch'\` / \`'segmented'\` are common
overrides for booleans and enums.

## Layouts beyond vertical stack

Default layout is a vertical stack of every field in
\`schema.properties\`. Pass \`layout\` to control ordering, groupings,
and rendering options:

\`\`\`svelte
const layout = {
  type: 'vertical',
  elements: [
    { type: 'horizontal', elements: [
      { scope: '#/firstName' },
      { scope: '#/lastName' }
    ]},
    { scope: '#/email' }
  ]
}

<FormRenderer bind:data {schema} {layout} />
\`\`\`

## Lookups — async or synchronous

\`FormRenderer\` accepts a \`lookups\` object keyed by JSON-Schema
property path. Each lookup defines either a URL template (string
interpolated against current data), an async \`fetch()\` hook, or a
\`source\` + \`filter\` pair for sync client-side filtering.

\`\`\`svelte
const lookups = {
  '#/countryCode': {
    url: '/api/countries?prefix={query}',
    label: 'name',
    value: 'code'
  },
  '#/city': {
    fetch: async ({ data }) => fetchCities(data.countryCode)
  }
}
\`\`\`

Dependent lookups (city depends on countryCode) get re-fetched
automatically when their dependencies change, and the dependent
field's value is cleared so stale selections don't persist.

## Validation

Validation runs based on the \`validateOn\` prop — \`'submit'\`
(default), \`'change'\`, or \`'blur'\`. Each field reports its state via
\`[data-field-state]\` (\`pass\` / \`fail\` / undefined) so themes can
style accordingly.

## Custom renderers

Pass a \`renderers\` object to inject custom Svelte components into
the dispatch registry. Each renderer receives standard input props
(\`value\` bindable, \`onchange\`, \`disabled\`, \`name\`) plus any
extras the layout element declares.
`
