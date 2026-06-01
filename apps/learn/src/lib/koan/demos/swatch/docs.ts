export const swatchDocs = `## Visual single- or multi-select via colour swatches

Swatch is a compact selector where each option is rendered as a
filled colour tile. Useful for any visual pick — palette colours,
theme accents, mood-board tags, brand swatches.

## Basic example

\`\`\`svelte
<script>
  const colours = ['#0ea5e9', '#f97316', '#10b981', '#ef4444']
  let value = $state(null)
</script>

<Swatch options={colours} bind:value />
\`\`\`

Pass primitive colour strings or object items with field-mapped
\`value\` and \`label\` fields. Use \`fields\` to remap from your data's
own keys.

## Single vs multi

Default is single-select; \`multiple={true}\` binds the value as an
array. Keyboard arrows navigate; Enter / Space toggles selection;
Cmd/Ctrl-click toggles in multi mode.

## Shape and size

- \`shape\` — \`square\` (default) or \`circle\`. Circle reads softer;
  square reads more technical.
- \`size\` — \`sm\` / \`md\` (default) / \`lg\` — five-row, dense, or
  prominent.

## Custom item content

The \`item\` snippet receives a ProxyItem for full control over what
appears inside each swatch — useful when you need labels under
colours or pattern fills instead of solids.
`
