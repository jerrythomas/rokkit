# Modular Demo System

This directory contains the modular demo system for the Rokkit Learn site. The system is designed to make it easy to create, display, and manage interactive code demos throughout the tutorial sections.

## Components

### DemoRoot
The main orchestrator component that handles loading demos from slugs and managing state.

**Props:**
- `slug` (string, required) - The demo slug to load (e.g., "introduction")
- `title` (string, optional) - Optional title for the demo
- `description` (string, optional) - Optional description for the demo
- `showCode` (boolean, optional) - Whether to show code by default
- `class` (string, optional) - Additional CSS classes
- `ontoggle` (function, optional) - Callback when code visibility is toggled
- `oncopy` (function, optional) - Callback when code is copied

**Usage:**
```svelte
<script>
  import { DemoRoot } from '../demo'
</script>

<DemoRoot
  slug="introduction"
  title="Interactive List Demo"
  description="A data-driven List component with field mapping and custom rendering"
  oncopy={(event) => console.log('Code copied:', event.code.length + ' characters')}
  ontoggle={(event) => console.log('Code visibility toggled:', event.showCode)}
/>
```

### DemoComponent
Renders an interactive Svelte component.

**Props:**
- `component` (any, required) - The Svelte component to render
- `class` (string, optional) - Additional CSS classes

**Usage:**
```svelte
<script>
  import { DemoComponent } from '../demo'
  import { List } from '@rokkit/ui'
</script>

<DemoComponent component={List} />
```

### DemoCode
Displays syntax-highlighted code with copy functionality.

**Props:**
- `code` (string, required) - The source code to display
- `showCopyButton` (boolean, optional) - Whether to show just the copy button (for inline usage)
- `filename` (string, optional) - The filename to display (default: "App.svelte")
- `class` (string, optional) - Additional CSS classes
- `oncopy` (function, optional) - Callback when code is copied

**Usage:**
```svelte
<script>
  import { DemoCode } from '../demo'
</script>

<!-- Full code display -->
<DemoCode
  code={sourceCode}
  filename="Example.svelte"
  oncopy={(event) => console.log('Code copied:', event.code.length + ' characters')}
/>

<!-- Just copy button -->
<DemoCode code={sourceCode} showCopyButton oncopy={handleCopy} />
```

### DemoError
Displays error messages with consistent styling.

**Props:**
- `error` (string, required) - The error message to display
- `class` (string, optional) - Additional CSS classes

**Usage:**
```svelte
<script>
  import { DemoError } from '../demo'
</script>

<DemoError error="Failed to load demo component" />
```

### DemoLoading
Displays a loading state with spinner and message.

**Props:**
- `message` (string, optional) - Custom loading message (default: "Loading demo...")
- `class` (string, optional) - Additional CSS classes

**Usage:**
```svelte
<script>
  import { DemoLoading } from '../demo'
</script>

<DemoLoading message="Loading your awesome demo..." />
```

## Demo Structure

Demos are organized by tutorial section and should follow this structure:

```
tutorial/
├── introduction/
│   └── src/
│       └── App.svelte
├── elements/
│   ├── list/
│   │   └── src/
│   │       └── App.svelte
│   └── tabs/
│       └── src/
│           └── App.svelte
└── forms/
    └── inputs/
        └── src/
            └── App.svelte
```

Each demo's `App.svelte` file should be a complete, self-contained example that demonstrates the feature being taught.

## Creating New Demos

1. Create a new directory under the appropriate tutorial section
2. Create a `src/App.svelte` file with your demo component
3. Use the demo in your tutorial page with `<DemoRoot slug="section/demo-name" />`

**Example demo structure:**
```
tutorial/elements/button/src/App.svelte
```

**Example demo component:**
```svelte
<script>
  import { Button } from '@rokkit/ui'
  
  let clickCount = $state(0)
  
  function handleClick() {
    clickCount++
  }
</script>

<div class="space-y-4">
  <Button onclick={handleClick}>
    Click me! ({clickCount})
  </Button>
  
  <p class="text-sm text-neutral-floating">
    You've clicked the button {clickCount} times.
  </p>
</div>
```

## Best Practices

1. **Keep demos focused** - Each demo should demonstrate one specific feature or concept
2. **Use semantic colors** - Use the semantic color shortcuts (e.g., `text-neutral-overlay`, `bg-neutral-subtle`)
3. **Make demos interactive** - Include state changes, user interactions, or data transformations
4. **Provide context** - Include explanatory text within the demo when helpful
5. **Handle edge cases** - Show both empty states and populated states where relevant

## Styling Guidelines

The demo system uses semantic color shortcuts for consistent theming:

- `text-neutral-overlay` - Primary text color
- `text-neutral-floating` - Secondary text color  
- `text-neutral-elevated` - Tertiary text color
- `bg-neutral-base` - Base background color
- `bg-neutral-subtle` - Subtle background color
- `bg-neutral-elevated` - Elevated background color
- `border-neutral-subtle` - Subtle border color
- `text-primary-overlay` - Primary brand text color
- `bg-primary-subtle` - Subtle primary background color

## Migration from CodeViewer

If you're migrating from the old `CodeViewer` component:

**Old:**
```svelte
<CodeViewer
  component={demoComponent}
  code={demoCode}
  title="Demo Title"
  description="Demo description"
/>
```

**New:**
```svelte
<DemoRoot
  slug="demo-slug"
  title="Demo Title"
  description="Demo description"
/>
```

The new system handles loading automatically, so you no longer need to manage `demoComponent` and `demoCode` state manually.