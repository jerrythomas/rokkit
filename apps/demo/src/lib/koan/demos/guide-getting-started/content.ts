export const guideContent = `# Getting Started

Rokkit is a **data-first** Svelte 5 component library. Every
component accepts your data's natural shape through a simple
\`fields\` mapping — no adapters, no transformations, no
boilerplate.

## The five principles

- **Data-first** — Components adapt to your data shape via
  field mapping. You don't reshape your API responses.
- **Composable** — Customize any component with Svelte
  snippets. Full control over rendering without forking.
- **Accessible** — Keyboard navigation and ARIA support built
  in via the navigator pattern. Zero config.
- **Themeable** — Data-attribute hooks with layout/theme CSS
  separation. Build or swap themes freely.
- **Consistent API** — Every component follows the same
  pattern: \`items\`, \`fields\`, \`value\`, \`onchange\`. Learn
  once, use everywhere.

## Install

\`\`\`bash
npm install @rokkit/ui @rokkit/themes
\`\`\`

Or with pnpm / bun:

\`\`\`bash
pnpm add @rokkit/ui @rokkit/themes
bun add @rokkit/ui @rokkit/themes
\`\`\`

## Theme setup

Import the Rokkit theme CSS in your app entry point. The base CSS
provides layout rules; the theme CSS adds visual styling via
\`data-*\` selectors.

\`\`\`css
@import '@rokkit/themes/base.css';
@import '@rokkit/themes/rokkit.css';
\`\`\`

Add a data attribute on \`<html>\` to pick the active style:

\`\`\`html
<html data-style="rokkit" data-mode="light"></html>
\`\`\`

## Your first component

Pass any data shape; tell the component which keys map to which
roles via the \`fields\` prop; bind the selected value.

\`\`\`svelte
<script>
  import { List } from '@rokkit/ui'

  const users = [
    { id: 1, name: 'Alice Chen', role: 'Admin' },
    { id: 2, name: 'Bob Smith', role: 'Developer' },
    { id: 3, name: 'Carol Lee', role: 'Designer' }
  ]

  const fields = { label: 'name', value: 'id' }
  let selected = $state(null)
</script>

<List items={users} {fields} bind:value={selected} />
\`\`\`

No data transformation, no adapter layer. \`fields\` maps your
\`name\` property to the display text and \`id\` to the selection
value.

## Same pattern, every component

Swap \`List\` for \`Select\`, \`Tree\`, \`Tabs\`, or \`Menu\` — the
\`items\` + \`fields\` shape is identical. Learn one pattern, apply
it everywhere.

## CLI (fastest path)

The Rokkit CLI sets up UnoCSS, imports theme CSS, and adds
\`data-style\` to \`<html>\` automatically:

\`\`\`bash
npx @rokkit/cli@latest init
\`\`\`

\`init\` is interactive — it asks for your color palette, icon
collection, theme style(s), and mode-switching strategy.

After setup, or when things look off:

\`\`\`bash
npx @rokkit/cli@latest doctor
\`\`\`

## Where to next

- **Data Binding** — how the \`fields\` prop adapts to any shape.
- **Composability** — using Svelte snippets to customize.
- **Theming & Design** — the skin / style / mode system.
- **Components** — flip to the catalog and pick a tile.
`
