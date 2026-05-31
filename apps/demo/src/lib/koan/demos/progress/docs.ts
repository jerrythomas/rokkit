export const progressDocs = `## Determinate + indeterminate progress bar

ProgressBar renders a thin horizontal bar that fills from 0 to a
maximum (default \`100\`). Pass a numeric \`value\` for determinate
mode, or \`null\` for an animated indeterminate state — useful while
you're still computing the total work.

## Basic example

\`\`\`svelte
<script>
  import { ProgressBar } from '@rokkit/ui'

  let progress = $state(40)
</script>

<ProgressBar value={progress} />        <!-- 40% filled -->
<ProgressBar value={progress} max={200} /> <!-- 20% filled -->
<ProgressBar value={null} />            <!-- indeterminate -->
\`\`\`

## API surface

Just two props:

- \`value\` — current progress (\`number | null\`). \`null\` /
  \`undefined\` triggers indeterminate mode.
- \`max\` — maximum value, default \`100\`.

## ARIA

The root carries \`role="progressbar"\` plus \`aria-valuenow\` /
\`aria-valuemin\` / \`aria-valuemax\`. \`aria-valuenow\` is omitted in
indeterminate mode so screen readers announce "loading" without a
specific percentage.

## When to use ProgressBar vs UploadProgress

- \`ProgressBar\` — a single bar showing one number's progress
  (downloads, jobs, batched imports). Always paired with caller
  state.
- \`UploadProgress\` — composes ProgressBar inside a list / grid
  of files, each with its own status and progress.
`
