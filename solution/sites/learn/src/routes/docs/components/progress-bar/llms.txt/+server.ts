import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit ProgressBar Component

> Simple progress indicator with determinate and indeterminate states.

The ProgressBar component displays progress visually, supporting both known progress values and indeterminate loading states.

## Quick Start

\`\`\`svelte
<script>
  import { ProgressBar } from '@rokkit/ui'

  let progress = $state(45)
</script>

<ProgressBar value={progress} max={100} />
\`\`\`

## Core Concepts

### Determinate Progress

Show progress toward a known goal:

\`\`\`svelte
<script>
  import { ProgressBar } from '@rokkit/ui'

  let uploaded = $state(3)
  let total = 10
</script>

<ProgressBar value={uploaded} max={total} />
<p>{uploaded} of {total} files uploaded</p>
\`\`\`

### Indeterminate Progress

For unknown duration tasks, omit value or set to null:

\`\`\`svelte
<script>
  import { ProgressBar } from '@rokkit/ui'
</script>

<!-- Indeterminate - shows animated loading state -->
<ProgressBar />
<ProgressBar value={null} />
\`\`\`

### Custom Height

Adjust the bar thickness:

\`\`\`svelte
<ProgressBar value={50} height="4px" />
<ProgressBar value={50} height="8px" />
<ProgressBar value={50} height="2mm" />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`number \\| null\` | \`null\` | Current progress value |
| \`max\` | \`number\` | \`100\` | Maximum value |
| \`height\` | \`string\` | \`'1.5mm'\` | Bar height (CSS value) |
| \`class\` | \`string\` | \`''\` | CSS class names |

## Component Structure

\`\`\`
[data-progress]
└── [data-progress-bar]    // Filled portion
\`\`\`

## Data Attributes for Styling

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`[data-progress]\` | Root | Main container |
| \`[data-progress][data-indeterminate]\` | Root | Indeterminate/loading state |
| \`[data-progress-bar]\` | Inner | Filled progress portion |

### Styling Example

\`\`\`css
[data-progress] {
  display: block;
  width: 100%;
  background: var(--surface-200);
  border-radius: 9999px;
  overflow: hidden;
}

[data-progress-bar] {
  display: block;
  background: var(--primary-500);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

/* Indeterminate animation */
[data-progress][data-indeterminate] [data-progress-bar] {
  animation: indeterminate 1.5s infinite ease-in-out;
}

@keyframes indeterminate {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Color variants via CSS variables */
rk-progress.success value-bar {
  background: var(--success-500);
}

rk-progress.warning value-bar {
  background: var(--warning-500);
}

rk-progress.error value-bar {
  background: var(--error-500);
}
\`\`\`

## Import

\`\`\`javascript
// Named import
import { ProgressBar } from '@rokkit/ui'

// Default import
import ProgressBar from '@rokkit/ui/progress-bar'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface ProgressBarProps {
  value?: number | null
  max?: number
  height?: string
  class?: string
}
\`\`\`

## Examples

### Basic Progress

\`\`\`svelte
<script>
  import { ProgressBar } from '@rokkit/ui'
</script>

<ProgressBar value={25} />
<ProgressBar value={50} />
<ProgressBar value={75} />
<ProgressBar value={100} />
\`\`\`

### File Upload Progress

\`\`\`svelte
<script>
  import { ProgressBar } from '@rokkit/ui'

  let uploadProgress = $state(0)
  let isUploading = $state(false)

  async function uploadFile(file) {
    isUploading = true
    uploadProgress = 0

    // Simulated upload
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 200))
      uploadProgress = i
    }

    isUploading = false
  }
</script>

{#if isUploading}
  <div class="upload-status">
    <ProgressBar value={uploadProgress} />
    <span>{uploadProgress}%</span>
  </div>
{/if}
\`\`\`

### Loading State

\`\`\`svelte
<script>
  import { ProgressBar } from '@rokkit/ui'

  let isLoading = $state(true)
</script>

{#if isLoading}
  <ProgressBar />
  <p>Loading data...</p>
{/if}
\`\`\`

### Task Progress

\`\`\`svelte
<script>
  import { ProgressBar } from '@rokkit/ui'

  let tasks = $state([
    { name: 'Download', done: true },
    { name: 'Process', done: true },
    { name: 'Upload', done: false },
    { name: 'Verify', done: false }
  ])

  let completed = $derived(tasks.filter(t => t.done).length)
</script>

<div class="task-progress">
  <ProgressBar value={completed} max={tasks.length} />
  <span>{completed} of {tasks.length} tasks complete</span>
</div>
\`\`\`

### Different Heights

\`\`\`svelte
<script>
  import { ProgressBar } from '@rokkit/ui'
</script>

<div class="progress-examples">
  <label>Thin</label>
  <ProgressBar value={60} height="2px" />

  <label>Default</label>
  <ProgressBar value={60} />

  <label>Thick</label>
  <ProgressBar value={60} height="8px" />
</div>
\`\`\`

### Colored Progress

\`\`\`svelte
<script>
  import { ProgressBar } from '@rokkit/ui'

  let diskUsage = $state(85)
</script>

<ProgressBar
  value={diskUsage}
  class={diskUsage > 90 ? 'error' : diskUsage > 75 ? 'warning' : 'success'}
/>
<p>Disk usage: {diskUsage}%</p>
\`\`\`

### Multi-Step Progress

\`\`\`svelte
<script>
  import { ProgressBar } from '@rokkit/ui'

  let currentStep = $state(2)
  let totalSteps = 5
</script>

<div class="multi-step">
  <ProgressBar value={currentStep} max={totalSteps} />
  <p>Step {currentStep} of {totalSteps}</p>
</div>
\`\`\`

### Download Progress

\`\`\`svelte
<script>
  import { ProgressBar } from '@rokkit/ui'

  let downloaded = $state(256)
  let totalSize = 1024

  let percentage = $derived(Math.round((downloaded / totalSize) * 100))
</script>

<div class="download-progress">
  <ProgressBar value={downloaded} max={totalSize} />
  <div class="download-info">
    <span>{percentage}%</span>
    <span>{downloaded}MB / {totalSize}MB</span>
  </div>
</div>
\`\`\`

### Progress with Animation

\`\`\`svelte
<script>
  import { ProgressBar } from '@rokkit/ui'

  let progress = $state(0)

  // Animate progress
  $effect(() => {
    const interval = setInterval(() => {
      progress = (progress + 1) % 101
    }, 50)
    return () => clearInterval(interval)
  })
</script>

<ProgressBar value={progress} />
\`\`\`

### Stacked Progress

\`\`\`svelte
<script>
  import { ProgressBar } from '@rokkit/ui'

  // Show multiple progress bars for different categories
  let storage = {
    photos: 30,
    videos: 45,
    documents: 15,
    other: 5,
    total: 100
  }
</script>

<div class="storage-breakdown">
  <div class="storage-item">
    <span>Photos</span>
    <ProgressBar value={storage.photos} max={storage.total} class="photos" />
  </div>
  <div class="storage-item">
    <span>Videos</span>
    <ProgressBar value={storage.videos} max={storage.total} class="videos" />
  </div>
  <div class="storage-item">
    <span>Documents</span>
    <ProgressBar value={storage.documents} max={storage.total} class="documents" />
  </div>
</div>
\`\`\`

## Related Components

- **ProgressDots** - Dot-based progress indicator
- **Stepper** - Step-based progress with labels
- **Range** - Interactive slider input
- **Rating** - Star-based rating display
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
