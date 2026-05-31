export const timelineDocs = `## View-only vertical steps

Timeline renders a list of steps as numbered circles connected by a
guide line. Items can flag themselves as \`completed\` (replaces the
number with a checkmark icon) or \`active\` (highlights the row).
For freeform content under each step, supply the \`content\` snippet.

## Basic example

\`\`\`svelte
<script>
  import { Timeline } from '@rokkit/ui'

  const steps = [
    { label: 'Requirements', subtext: 'Gather project requirements.', completed: true },
    { label: 'Design',       subtext: 'Create wireframes.',           completed: true },
    { label: 'Development',  subtext: 'Build the features.',          active: true },
    { label: 'Testing',      subtext: 'Run QA tests.' },
    { label: 'Deployment',   subtext: 'Deploy to production.' }
  ]
</script>

<Timeline items={steps} />
\`\`\`

## Item shape

Default fields:

- \`label\` — the step title (required).
- \`subtext\` — optional description shown beneath the title.
- \`icon\` — replace the numbered circle (e.g. \`i-glyph:check\`).
- \`completed\` / \`active\` — boolean flags driving \`data-completed\`
  and \`data-active\` on the row.

Use the \`fields\` prop to remap any of these to your data's keys.

## Custom content snippet

The \`content\` snippet receives \`(item, index)\` and is rendered
inside the step body — useful for action buttons, code blocks, or
arbitrary markup per step.

\`\`\`svelte
<Timeline items={steps}>
  {#snippet content(item, i)}
    {#if item.action}
      <button onclick={item.action.onclick}>{item.action.label}</button>
    {/if}
  {/snippet}
</Timeline>
\`\`\`

## Stepper vs Timeline

If you need interactive step navigation (Back / Next, validation per
step, current step bound to a value) use \`Stepper\`. Timeline is
view-only — for changelogs, instructions, and progress dashboards
where the user reads the history rather than walks the steps.
`
