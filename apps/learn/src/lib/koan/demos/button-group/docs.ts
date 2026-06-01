export const buttonGroupDocs = `## Visually attached button cluster

ButtonGroup binds a row of Buttons together into a single visual
unit — shared border, no gaps between them, equal height. Useful
for split actions ("Save / Save as…"), segmented filters, or any
cluster of related buttons that read as one control.

## Basic example

\`\`\`svelte
<script>
  import { Button, ButtonGroup } from '@rokkit/ui'
</script>

<ButtonGroup>
  <Button>Save</Button>
  <Button>Save as…</Button>
  <Button icon="i-mdi:chevron-down" aria-label="More" />
</ButtonGroup>
\`\`\`

The component itself is intentionally minimal — just a flex wrapper
with \`role="group"\` and a \`data-size\` attribute. All the per-style
chrome (shared border, divider lines between buttons, end-cap radii)
lives in the active theme's \`button.css\`.

## Sizing

\`size\` (\`sm\` / \`md\` / \`lg\`) is propagated down to child buttons via
\`data-size\` so the cluster scales as one. You don't need to set
\`size\` on each Button — set it once on the group.

## When to use ButtonGroup vs Toolbar

- \`ButtonGroup\` — a small cluster of related actions that reads as
  one control. No keyboard nav semantics; the inner Buttons each
  carry their own tab order.
- \`Toolbar\` — a longer bar of independent actions with arrow-key
  navigation (single tabstop). Reach for it when there are 5+
  actions or when grouping/separator semantics matter.
`
