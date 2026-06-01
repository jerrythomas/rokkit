export const guideContent = `# Forms

\`@rokkit/forms\` builds complex forms from a JSON-Schema-shaped
spec. Define fields, validation rules, and dependencies
declaratively — the form builder handles rendering, validation,
dirty tracking, dynamic lookups, and submit.

## Schema-driven

\`\`\`svelte
<script>
  import { FormRenderer } from '@rokkit/forms'

  const schema = {
    type: 'object',
    properties: {
      name:  { type: 'string', required: true },
      email: { type: 'string', format: 'email', required: true },
      role:  { type: 'string', enum: ['admin', 'editor', 'viewer'] },
      active: { type: 'boolean' }
    }
  }

  let data = $state({ name: '', email: '', role: 'viewer', active: true })
</script>

<FormRenderer {schema} bind:data />
\`\`\`

The renderer picks the right input per type: string → text,
boolean → toggle, enum → radio / segmented, number → number,
date → date picker.

## Auto-derived schema

Skip the schema and Rokkit infers one from the data:

\`\`\`svelte
<FormRenderer bind:data={record} />
\`\`\`

Useful for editable-record scenarios where the shape comes from
an API response and you just want a quick edit form.

## Validation modes

The \`validateOn\` prop controls when validation runs:

- \`'submit'\` — only on form submit (default).
- \`'change'\` — after every field change.
- \`'blur'\` — when a field loses focus.

Errors render under each field; the submit button stays
disabled while errors exist (override via \`onsubmit\`).

## Lookups — async + dependent fields

\`createLookup\` wires a field to a remote (or computed) option
list, with support for cascading dependencies:

\`\`\`js
import { createLookup } from '@rokkit/forms'

const cities = createLookup({
  url: '/api/cities?country={country}',  // {country} = form value
  enableOn: ['country']                  // disabled until country set
})
\`\`\`

Mount via the \`lookups\` prop on FormRenderer. When the parent
field (\`country\`) changes, dependent fields (\`city\`) clear and
refetch.

## Field dependencies

Fields can declare \`show: { field, equals }\` or
\`enabled: { field, equals }\` rules — the renderer recomputes
visibility / enablement on every value change without you
plumbing \`$derived\` flows by hand.

\`\`\`js
const layout = {
  type: 'vertical',
  elements: [
    { scope: '#/role' },
    { scope: '#/admin_only_field', show: { field: 'role', equals: 'admin' } }
  ]
}
\`\`\`

## FormBuilder — programmatic construction

For dynamic forms where the schema is built at runtime,
\`FormBuilder\` exposes an imperative API: \`addField\`,
\`removeField\`, \`updateField\`, \`isFieldDisabled\`,
\`refreshLookup\`. Mounts the same FormRenderer under the hood.

## Custom field renderers

Register custom renderers per type or per scope:

\`\`\`svelte
<FormRenderer
  {schema}
  bind:data
  renderers={{ string: CustomTextField, '#/avatar': AvatarField }}
/>
\`\`\`

Renderers receive the field's name, value, schema, error, and
an \`onchange\` callback — full control over how a field draws.

## Submit + actions

The default action bar carries Reset + Submit; both are themable
or can be hidden via \`hideActions\`. \`onsubmit\` fires with the
current data when validation passes; \`onreset\` clears to
defaults.
`
