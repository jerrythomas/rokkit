import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Stepper Component

> Multi-step progress indicator with stages and optional sub-steps.

The Stepper component displays a visual progress indicator for multi-step processes, showing completed, active, and pending stages with optional sub-step dots.

## Quick Start

\`\`\`svelte
<script>
  import { Stepper } from '@rokkit/ui'

  let stages = [
    { text: '1', label: 'Account', completed: true },
    { text: '2', label: 'Profile', active: true },
    { text: '3', label: 'Review', completed: false }
  ]

  let currentStage = 1
</script>

<Stepper data={stages} {currentStage} />
\`\`\`

## Core Concepts

### Stage Structure

Each stage has visual and state properties:

\`\`\`javascript
const stages = [
  {
    text: '1',           // Stage indicator (number/icon)
    label: 'Step Name',  // Label below
    completed: true,     // Is this stage done?
    active: false,       // Is this the current stage?
    steps: {             // Optional sub-steps
      count: 3,
      value: 2,
      current: 1
    }
  }
]
\`\`\`

### With Sub-Steps

Add granular progress within stages:

\`\`\`svelte
<script>
  import { Stepper } from '@rokkit/ui'

  let stages = [
    {
      text: '1',
      label: 'Account Setup',
      completed: true
    },
    {
      text: '2',
      label: 'Profile',
      active: true,
      steps: {
        count: 4,     // Total sub-steps
        value: 2,     // Completed sub-steps
        current: 2    // Current sub-step
      }
    },
    {
      text: '3',
      label: 'Review'
    }
  ]
</script>

<Stepper data={stages} currentStage={1} />
\`\`\`

### Stage States

Stages can be in different visual states:

- **Completed**: Stage is done (checkmark or filled)
- **Active**: Currently in progress
- **Pending**: Not yet reached (grayed out)

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`data\` | \`array\` | Required | Stage definitions |
| \`currentStage\` | \`number\` | \`0\` | Index of active stage |

### Stage Object Properties

| Property | Type | Description |
|----------|------|-------------|
| \`text\` | \`string\` | Stage indicator (number, icon, text) |
| \`label\` | \`string\` | Stage name displayed below |
| \`completed\` | \`boolean\` | Whether stage is complete |
| \`active\` | \`boolean\` | Whether stage is current |
| \`steps\` | \`object\` | Optional sub-steps configuration |

### Steps Object Properties

| Property | Type | Description |
|----------|------|-------------|
| \`count\` | \`number\` | Total number of sub-steps |
| \`value\` | \`number\` | Number of completed sub-steps |
| \`current\` | \`number\` | Index of current sub-step |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| \`click\` | \`{ stage, step?, data }\` | Stage or step clicked |

## Component Structure

\`\`\`
<div class="stepper">
├── <row>                          // Stages row
│   ├── <div>                      // Stage container
│   │   └── <Stage>                // Stage circle
│   ├── <div>                      // Steps container (if steps)
│   │   └── <ProgressDots>         // Sub-step dots
│   └── ...                        // More stages
└── <row>                          // Labels row
    └── <p>                        // Stage label
</div>
\`\`\`

## Styling

The Stepper uses CSS custom properties and Tailwind classes:

\`\`\`css
.stepper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.stepper row {
  display: grid;
  width: 100%;
  /* Dynamic columns based on --count */
  grid-template-columns: repeat(var(--count), 2fr 6fr 2fr);
}

.stepper .pending {
  color: var(--surface-500);
  font-weight: 300;
}
\`\`\`

### Stage Styling

The Stage component displays the circular indicator:

\`\`\`css
/* Stage circle */
[data-stage] {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

[data-stage].completed {
  background: var(--success-500);
  color: white;
}

[data-stage].active {
  background: var(--primary-500);
  color: white;
}

[data-stage].pending {
  background: var(--surface-200);
  color: var(--surface-500);
}
\`\`\`

## Import

\`\`\`javascript
// Named import
import { Stepper } from '@rokkit/ui'

// Default import
import Stepper from '@rokkit/ui/stepper'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface StepperProps {
  data: StageData[]
  currentStage: number
}

interface StageData {
  text: string
  label?: string
  completed?: boolean
  active?: boolean
  steps?: {
    count: number
    value: number
    current: number
  }
}
\`\`\`

## Examples

### Basic Checkout Flow

\`\`\`svelte
<script>
  import { Stepper } from '@rokkit/ui'

  let stages = [
    { text: '1', label: 'Cart', completed: true },
    { text: '2', label: 'Shipping', completed: true },
    { text: '3', label: 'Payment', active: true },
    { text: '4', label: 'Confirmation' }
  ]
</script>

<Stepper data={stages} currentStage={2} />
\`\`\`

### With Icons

\`\`\`svelte
<script>
  import { Stepper } from '@rokkit/ui'

  let stages = [
    { text: '🛒', label: 'Cart', completed: true },
    { text: '📦', label: 'Shipping', active: true },
    { text: '💳', label: 'Payment' },
    { text: '✅', label: 'Done' }
  ]
</script>

<Stepper data={stages} currentStage={1} />
\`\`\`

### Form Wizard with Sub-Steps

\`\`\`svelte
<script>
  import { Stepper } from '@rokkit/ui'

  let stages = [
    {
      text: '1',
      label: 'Personal Info',
      completed: true
    },
    {
      text: '2',
      label: 'Contact Details',
      active: true,
      steps: {
        count: 3,
        value: 1,
        current: 1
      }
    },
    {
      text: '3',
      label: 'Preferences',
      steps: {
        count: 2,
        value: 0,
        current: 0
      }
    },
    {
      text: '4',
      label: 'Review'
    }
  ]

  let currentStage = 1
</script>

<Stepper data={stages} {currentStage} />
\`\`\`

### Interactive Stepper

\`\`\`svelte
<script>
  import { Stepper } from '@rokkit/ui'

  let currentStage = $state(0)

  let stages = $derived([
    { text: '1', label: 'Step 1', completed: currentStage > 0, active: currentStage === 0 },
    { text: '2', label: 'Step 2', completed: currentStage > 1, active: currentStage === 1 },
    { text: '3', label: 'Step 3', completed: currentStage > 2, active: currentStage === 2 }
  ])

  function handleClick(event) {
    const { stage } = event.detail
    currentStage = stage
  }

  function next() {
    if (currentStage < stages.length - 1) currentStage++
  }

  function prev() {
    if (currentStage > 0) currentStage--
  }
</script>

<Stepper data={stages} {currentStage} on:click={handleClick} />

<div class="controls">
  <button onclick={prev} disabled={currentStage === 0}>Previous</button>
  <button onclick={next} disabled={currentStage === stages.length - 1}>Next</button>
</div>
\`\`\`

### Onboarding Flow

\`\`\`svelte
<script>
  import { Stepper } from '@rokkit/ui'

  let onboarding = [
    { text: '👤', label: 'Create Account', completed: true },
    { text: '✉️', label: 'Verify Email', completed: true },
    { text: '🔧', label: 'Setup Profile', active: true, steps: { count: 4, value: 2, current: 2 } },
    { text: '🎉', label: 'Get Started' }
  ]
</script>

<Stepper data={onboarding} currentStage={2} />
\`\`\`

### Order Tracking

\`\`\`svelte
<script>
  import { Stepper } from '@rokkit/ui'

  let orderStatus = [
    { text: '✓', label: 'Order Placed', completed: true },
    { text: '✓', label: 'Processing', completed: true },
    { text: '📦', label: 'Shipped', active: true },
    { text: '🚚', label: 'Out for Delivery' },
    { text: '🏠', label: 'Delivered' }
  ]
</script>

<Stepper data={orderStatus} currentStage={2} />
\`\`\`

### Vertical Layout (Custom)

\`\`\`svelte
<script>
  import { Stepper } from '@rokkit/ui'

  let stages = [...]
</script>

<div class="vertical-stepper">
  <Stepper data={stages} currentStage={1} />
</div>

<style>
  .vertical-stepper :global(.stepper) {
    flex-direction: row;
  }
  .vertical-stepper :global(.stepper row) {
    flex-direction: column;
  }
</style>
\`\`\`

## Related Components

- **ProgressBar** - Simple progress indicator
- **ProgressDots** - Dot-based progress (used for sub-steps)
- **BreadCrumbs** - Navigation path
- **Tabs** - Tab-based navigation
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
