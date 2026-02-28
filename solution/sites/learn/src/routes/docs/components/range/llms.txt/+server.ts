import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# Rokkit Range Component

> Slider input for selecting numeric values within a range.

The Range component provides a slider for selecting a single value between minimum and maximum bounds, with optional tick marks and labels.

## Quick Start

\`\`\`svelte
<script>
  import { Range } from '@rokkit/ui'

  let volume = $state(50)
</script>

<Range bind:value={volume} min={0} max={100} />
<p>Volume: {volume}%</p>
\`\`\`

## Core Concepts

### Basic Range

Simple slider with min/max bounds:

\`\`\`svelte
<script>
  import { Range } from '@rokkit/ui'

  let value = $state(25)
</script>

<Range bind:value min={0} max={100} />
\`\`\`

### Step Values

Control the increment size:

\`\`\`svelte
<script>
  import { Range } from '@rokkit/ui'

  let quantity = $state(5)
</script>

<!-- Increments of 5 -->
<Range bind:value={quantity} min={0} max={50} step={5} />
\`\`\`

### Tick Marks

Display tick marks along the slider:

\`\`\`svelte
<script>
  import { Range } from '@rokkit/ui'

  let value = $state(50)
</script>

<!-- 10 tick marks -->
<Range bind:value min={0} max={100} ticks={10} />
\`\`\`

### Labeled Ticks

Show labels on tick marks:

\`\`\`svelte
<script>
  import { Range } from '@rokkit/ui'

  let value = $state(50)
</script>

<!-- Labels on every other tick -->
<Range bind:value min={0} max={100} ticks={10} labelSkip={1} />
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`number\` | \`min\` | Current value (use \`bind:value\`) |
| \`min\` | \`number\` | \`0\` | Minimum value |
| \`max\` | \`number\` | \`100\` | Maximum value |
| \`step\` | \`number\` | \`1\` | Value increment |
| \`ticks\` | \`number\` | \`10\` | Number of tick marks |
| \`labelSkip\` | \`number\` | \`0\` | Skip labels (0=all, 1=every other) |
| \`name\` | \`string\` | \`null\` | Form input name |
| \`class\` | \`string\` | \`''\` | CSS class names |

## Related Component: RangeMinMax

For selecting a range of values (min and max), use the RangeMinMax component:

\`\`\`svelte
<script>
  import { RangeMinMax } from '@rokkit/ui'

  let priceRange = $state([20, 80])
</script>

<RangeMinMax bind:value={priceRange} min={0} max={100} />
<p>Price: \${priceRange[0]} - \${priceRange[1]}</p>
\`\`\`

### RangeMinMax Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`[number, number]\` | \`[min, max]\` | Range bounds |
| \`min\` | \`number\` | \`0\` | Minimum value |
| \`max\` | \`number\` | \`100\` | Maximum value |
| \`step\` | \`number\` | \`1\` | Value increment |
| \`ticks\` | \`number\` | \`10\` | Number of tick marks |
| \`labelSkip\` | \`number\` | \`0\` | Skip labels |
| \`single\` | \`boolean\` | \`false\` | Single thumb mode (used by Range) |

## Component Structure

\`\`\`
[data-range]
├── [data-range-track]
│   ├── [data-range-bar]         // Background track
│   └── [data-range-selected]    // Filled portion
├── [data-range-thumb]           // Draggable handle
└── [data-range-ticks]           // Tick marks container
    └── [data-range-tick]        // Individual tick
        └── [data-tick-label]    // Optional label
\`\`\`

## Data Attributes for Styling

| Attribute | Element | Purpose |
|-----------|---------|---------|
| \`[data-range]\` | Root | Main container |
| \`[data-range][data-disabled]\` | Root | Disabled state |
| \`[data-range-track]\` | Track | Track wrapper |
| \`[data-range-bar]\` | Bar | Background bar |
| \`[data-range-selected]\` | Selected | Filled portion |
| \`[data-range-thumb]\` | Thumb | Draggable handle |
| \`[data-range-thumb][data-sliding]\` | Thumb | Active drag state |
| \`[data-range-ticks]\` | Ticks | Tick marks container |
| \`[data-range-tick]\` | Tick | Individual tick mark |
| \`[data-tick-label]\` | Label | Tick label text |

### Styling Example

\`\`\`css
[data-range] {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 0;
}

[data-range-track] {
  position: relative;
  height: 6px;
  background: var(--surface-200);
  border-radius: 3px;
  cursor: pointer;
}

[data-range-selected] {
  position: absolute;
  height: 100%;
  background: var(--primary-500);
  border-radius: 3px;
}

[data-range-thumb] {
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid var(--primary-500);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  top: 50%;
  cursor: grab;
  transition: transform 0.1s;
}

[data-range-thumb]:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

[data-range-thumb][data-sliding] {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.15);
}

[data-range-ticks] {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

[data-range-tick] {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.75rem;
  color: var(--text-muted);
}

[data-range-tick]::before {
  content: '';
  width: 1px;
  height: 6px;
  background: var(--surface-400);
  margin-bottom: 4px;
}
\`\`\`

## Import

\`\`\`javascript
// Named imports
import { Range, RangeMinMax } from '@rokkit/ui'

// Default import
import Range from '@rokkit/ui/range'
import RangeMinMax from '@rokkit/ui/range-min-max'
\`\`\`

## TypeScript Types

\`\`\`typescript
interface RangeProps {
  value?: number
  min?: number
  max?: number
  step?: number
  ticks?: number
  labelSkip?: number
  name?: string
  class?: string
}

interface RangeMinMaxProps {
  value?: [number, number]
  min?: number
  max?: number
  step?: number
  ticks?: number
  labelSkip?: number
  single?: boolean
  name?: string
  class?: string
}
\`\`\`

## Examples

### Volume Control

\`\`\`svelte
<script>
  import { Range } from '@rokkit/ui'

  let volume = $state(75)
</script>

<div class="volume-control">
  <label>Volume</label>
  <Range bind:value={volume} min={0} max={100} />
  <span>{volume}%</span>
</div>
\`\`\`

### Price Filter

\`\`\`svelte
<script>
  import { RangeMinMax } from '@rokkit/ui'

  let priceRange = $state([0, 500])
</script>

<div class="price-filter">
  <label>Price Range</label>
  <RangeMinMax
    bind:value={priceRange}
    min={0}
    max={1000}
    step={10}
    ticks={10}
    labelSkip={1}
  />
  <p>\${priceRange[0]} - \${priceRange[1]}</p>
</div>
\`\`\`

### Temperature Setting

\`\`\`svelte
<script>
  import { Range } from '@rokkit/ui'

  let temperature = $state(72)
</script>

<div class="thermostat">
  <Range
    bind:value={temperature}
    min={60}
    max={85}
    step={1}
    ticks={5}
    labelSkip={0}
  />
  <span class="temp-display">{temperature}°F</span>
</div>
\`\`\`

### Opacity Slider

\`\`\`svelte
<script>
  import { Range } from '@rokkit/ui'

  let opacity = $state(100)
</script>

<label>
  Opacity
  <Range bind:value={opacity} min={0} max={100} />
</label>

<div
  class="preview-box"
  style:opacity={opacity / 100}
>
  Preview
</div>
\`\`\`

### Date Range

\`\`\`svelte
<script>
  import { RangeMinMax } from '@rokkit/ui'

  // Year range
  let yearRange = $state([2020, 2024])
</script>

<label>Year Range</label>
<RangeMinMax
  bind:value={yearRange}
  min={2000}
  max={2030}
  step={1}
  ticks={6}
  labelSkip={0}
/>
<p>From {yearRange[0]} to {yearRange[1]}</p>
\`\`\`

### With Snap Points

\`\`\`svelte
<script>
  import { Range } from '@rokkit/ui'

  let size = $state(3)
  const sizes = ['XS', 'S', 'M', 'L', 'XL']
</script>

<label>Size</label>
<Range
  bind:value={size}
  min={1}
  max={5}
  step={1}
  ticks={5}
/>
<p>Selected: {sizes[size - 1]}</p>
\`\`\`

### Form Integration

\`\`\`svelte
<script>
  import { Range } from '@rokkit/ui'

  let settings = $state({
    brightness: 50,
    contrast: 50,
    saturation: 50
  })
</script>

<form>
  <div class="slider-field">
    <label>Brightness</label>
    <Range name="brightness" bind:value={settings.brightness} />
  </div>

  <div class="slider-field">
    <label>Contrast</label>
    <Range name="contrast" bind:value={settings.contrast} />
  </div>

  <div class="slider-field">
    <label>Saturation</label>
    <Range name="saturation" bind:value={settings.saturation} />
  </div>
</form>
\`\`\`

## Related Components

- **Rating** - Discrete star rating
- **ProgressBar** - Display-only progress
- **Toggle** - Cycle through discrete options
`

export const GET: RequestHandler = async () => {
	return text(content, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	})
}
