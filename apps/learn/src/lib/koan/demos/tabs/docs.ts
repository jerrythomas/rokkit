/**
 * Long-form prose for `/app/tabs` → Docs canvas mode.
 * Migrated from `apps/archive/src/routes/(learn)/docs/components/tabs/+page.svelte`,
 * with `<StoryViewer>`/`<Code>` references converted to references to the
 * other canvas modes (Live / Code) so the prose reads as guidance for
 * what the user is already looking at.
 */
export const tabsDocs = `## What Tabs are good for

The Tabs component is a highly extensible navigation primitive that
splits content into labelled views. Like every component in Rokkit it
follows the **data-first** design principle — pass an array of items
plus an optional field mapping and the rendering, selection, and
keyboard navigation are handled for you.

It supports both horizontal and vertical orientations, editable tab
sets, and custom content rendering via snippets. ARIA wiring and
keyboard navigation (arrow keys, Home, End, Enter) come built in.

## Getting started

The simplest invocation is a plain string array:

\`\`\`svelte
<Tabs items={['Overview', 'Details', 'Settings']} bind:value />
\`\`\`

The description text is stored as a regular attribute on each item, so
there's no conditional logic in the markup — the component reads the
field, the user writes data.

## Object items and snippets

Once you need richer items, switch to an array of objects with a
custom snippet for the tab content. The \`child\` snippet customises
the tab headers; the snippet between the tags renders the tab body.

\`\`\`svelte
<Tabs {items} bind:value>
  {#snippet child(proxy)}
    <span class={proxy.icon}></span> {proxy.label}
  {/snippet}
  ...
</Tabs>
\`\`\`

## Layout — orientation, position, align

Three independent layout knobs change how Tabs sits inside its
container. Flip the canvas-view to **Live** and use the Tweaks slab
to toggle each one in place — or type \`change orientation to vertical\`
in the composer to drive it from chat.

- **\`orientation\`** — \`horizontal\` (default) or \`vertical\`. Controls
  the axis the strip stretches along.
- **\`position\`** — \`before\` (default) or \`after\`. Whether the strip
  sits before or after the panel along the orientation axis (so
  horizontal+before = top, vertical+after = right).
- **\`align\`** — \`start\` / \`center\` / \`end\`. Distribution of the tabs
  WITHIN the strip's main axis.

## Editable tabs

Pass \`editable={true}\` to enable add/remove buttons on the strip. The
\`onadd\` and \`onremove\` callbacks let you mutate the bound \`items\`
array however your app needs:

\`\`\`svelte
<Tabs
  bind:items
  bind:value
  editable
  onadd={() => items = [...items, { label: 'New tab' }]}
  onremove={(t) => items = items.filter((i) => i !== t)}
/>
\`\`\`

## Styling with data-attributes

Tabs writes a small set of data-attributes you can target from your
own CSS — no class overrides, no \`!important\` ladders. The most
useful are \`[data-tab-root]\` (carries orientation/position/align as
attributes) and \`[data-tab-item]\` (carries active state). See the
**API** canvas mode for the complete list.
`
