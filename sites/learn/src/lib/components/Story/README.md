# Story System

The Story system is a modular component library for creating interactive code demonstrations in the Rokkit Learn site. It replaces the previous CodeViewer component with a more flexible, reusable system that supports multiple files and better organization.

## Architecture

The Story system consists of five main components:

- **StoryRoot** - Main orchestrator that loads stories and manages state
- **StoryComponent** - Renders interactive Svelte components
- **StoryCode** - Displays syntax-highlighted code with multi-file support
- **StoryError** - Shows error states consistently
- **StoryLoading** - Shows loading states with spinner

## Components

### StoryRoot

The main component that handles loading stories from slugs and orchestrates the entire story display.

**Props:**
- `slug` (string, required) - The story slug to load (e.g., "introduction")
- `title` (string, optional) - Optional title for the story
- `description` (string, optional) - Optional description for the story
- `showCode` (boolean, optional) - Whether to show code by default (default: false)
- `class` (string, optional) - Additional CSS classes
- `ontoggle` (function, optional) - Callback when code visibility is toggled
- `oncopy` (function, optional) - Callback when code is copied

**Usage:**
```svelte
<script>
  import { StoryRoot } from '$lib/components/Story'
</script>

<StoryRoot
  slug="introduction"
  title="Interactive List Demo"
  description="A data-driven List component with field mapping and custom rendering"
  oncopy={(event) => console.log('Code copied:', event.code.length + ' characters')}
  ontoggle={(event) => console.log('Code visibility toggled:', event.showCode)}
/>
```

### StoryComponent

Renders an interactive Svelte component within the story container.

**Props:**
- `component` (any, required) - The Svelte component to render
- `class` (string, optional) - Additional CSS classes

**Usage:**
```svelte
<script>
  import { StoryComponent } from '$lib/components/Story'
  import { Button } from '@rokkit/ui'
</script>

<StoryComponent component={Button} />
```

### StoryCode

Displays syntax-highlighted code with support for single files or multiple files using tabs.

**Props:**
- `code` (string|StoryCodeFile[], optional) - The source code to display or array of files
- `files` (StoryCodeFile[], optional) - Array of files (alternative to code)
- `showCopyButton` (boolean, optional) - Whether to show just the copy button (default: false)
- `filename` (string, optional) - The filename to display for single files (default: "App.svelte")
- `language` (string, optional) - Programming language for single files (default: "svelte")
- `class` (string, optional) - Additional CSS classes
- `oncopy` (function, optional) - Callback when code is copied

**StoryCodeFile Interface:**
```typescript
interface StoryCodeFile {
  id: string;           // Unique identifier for the file
  name: string;         // Display name of the file
  language: string;     // Programming language for syntax highlighting
  content: string;      // File content
  icon?: string;        // Optional icon for the file
}
```

**Usage:**
```svelte
<script>
  import { StoryCode } from '$lib/components/Story'
</script>

<!-- Single file -->
<StoryCode
  code={sourceCode}
  filename="Example.svelte"
  language="svelte"
  oncopy={(event) => console.log('Code copied:', event.code.length + ' characters')}
/>

<!-- Multiple files -->
<StoryCode
  files={[
    {
      id: 'app',
      name: 'App.svelte',
      language: 'svelte',
      content: '<script>...'
    },
    {
      id: 'utils',
      name: 'utils.js',
      language: 'javascript',
      content: 'export function...'
    }
  ]}
  oncopy={(event) => console.log('File copied:', event.file.name)}
/>
```

### StoryError

Displays error messages with consistent styling and branding.

**Props:**
- `error` (string, required) - The error message to display
- `class` (string, optional) - Additional CSS classes

**Usage:**
```svelte
<script>
  import { StoryError } from '$lib/components/Story'
</script>

<StoryError error="Failed to load story component" />
```

### StoryLoading

Displays a loading state with spinner and customizable message.

**Props:**
- `message` (string, optional) - Custom loading message (default: "Loading story...")
- `class` (string, optional) - Additional CSS classes

**Usage:**
```svelte
<script>
  import { StoryLoading } from '$lib/components/Story'
</script>

<StoryLoading message="Loading your awesome story..." />
```

## Story Structure

Stories are organized by tutorial section and should follow this structure:

```
tutorial/
├── introduction/
│   └── src/
│       └── App.svelte
├── multi-file-demo/
│   └── src/
│       ├── App.svelte
│       ├── counter.js
│       └── styles.css
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

Each story's main component should be in `src/App.svelte` and can include additional files as needed.

## Multi-File Support

The Story system supports multiple files per story through the enhanced `StoryCode` component and `FileTabs` integration:

### File Structure
For multi-file stories, place all files in the `src/` directory:
```
story-name/
└── src/
    ├── App.svelte      # Main component
    ├── utils.js        # Utility functions
    ├── styles.css      # Styles
    └── types.ts        # Type definitions
```

### File Icons
The system automatically assigns icons based on file extensions:
- `.svelte` → 🔷
- `.js`, `.mjs` → 🟨
- `.ts` → 🔵
- `.css` → 🎨
- `.html` → 🌐
- `.json` → 📄
- `.md` → 📝
- Others → 📄

Custom icons can be provided via the `icon` property in the file object.

## Creating New Stories

1. Create a new directory under the appropriate tutorial section
2. Create a `src/App.svelte` file with your main component
3. Add any additional files needed in the `src/` directory
4. Use the story in your tutorial page with `<StoryRoot slug="section/story-name" />`

**Example story structure:**
```
tutorial/elements/button/
└── src/
    ├── App.svelte
    ├── button-variants.js
    └── button-styles.css
```

**Example story component:**
```svelte
<script>
  import { Button } from '@rokkit/ui'
  import { variants } from './button-variants.js'
  import './button-styles.css'
  
  let selectedVariant = $state('primary')
  let clickCount = $state(0)
  
  function handleClick() {
    clickCount++
  }
</script>

<div class="button-demo">
  <div class="variant-selector">
    {#each variants as variant}
      <label>
        <input
          type="radio"
          bind:group={selectedVariant}
          value={variant.name}
        />
        {variant.label}
      </label>
    {/each}
  </div>
  
  <Button
    class={selectedVariant}
    onclick={handleClick}
  >
    Click me! ({clickCount})
  </Button>
</div>
```

## Best Practices

1. **Keep stories focused** - Each story should demonstrate one specific feature or concept
2. **Use semantic colors** - Use the semantic color shortcuts (e.g., `text-neutral-overlay`, `bg-neutral-subtle`)
3. **Make stories interactive** - Include state changes, user interactions, or data transformations
4. **Provide context** - Include explanatory text within the story when helpful
5. **Handle edge cases** - Show both empty states and populated states where relevant
6. **Organize files logically** - Group related functionality into separate files for multi-file stories
7. **Use meaningful file names** - Choose descriptive names that clearly indicate the file's purpose

## Styling Guidelines

The Story system uses semantic color shortcuts for consistent theming:

- `text-neutral-overlay` - Primary text color
- `text-neutral-floating` - Secondary text color  
- `text-neutral-elevated` - Tertiary text color
- `bg-neutral-base` - Base background color
- `bg-neutral-subtle` - Subtle background color
- `bg-neutral-elevated` - Elevated background color
- `border-neutral-subtle` - Subtle border color
- `text-primary-overlay` - Primary brand text color
- `bg-primary-subtle` - Subtle primary background color

## Migration from Demo Components

If you're migrating from the old Demo components:

**Old:**
```svelte
<script>
  import { DemoRoot } from '../demo'
</script>

<DemoRoot
  slug="introduction"
  title="Demo Title"
  description="Demo description"
/>
```

**New:**
```svelte
<script>
  import { StoryRoot } from '$lib/components/Story'
</script>

<StoryRoot
  slug="introduction"
  title="Story Title"
  description="Story description"
/>
```

## Advanced Usage

### Custom File Handling
```svelte
<script>
  import { StoryCode } from '$lib/components/Story'
  
  let files = [
    {
      id: 'config',
      name: 'package.json',
      language: 'json',
      content: JSON.stringify(packageConfig, null, 2),
      icon: '📦'
    }
  ]
</script>

<StoryCode {files} />
```

### Programmatic Control
```svelte
<script>
  import { StoryRoot } from '$lib/components/Story'
  
  let showCode = $state(false)
  
  function toggleCode() {
    showCode = !showCode
  }
</script>

<button onclick={toggleCode}>
  {showCode ? 'Hide' : 'Show'} Code
</button>

<StoryRoot
  slug="example"
  bind:showCode
  ontoggle={(event) => console.log('Code toggled:', event.showCode)}
/>
```

## Error Handling

The Story system provides comprehensive error handling:

- **Loading errors** - Shown via `StoryError` component
- **Syntax highlighting errors** - Gracefully handled with fallback display
- **Missing files** - Clear error messages indicating what's missing
- **Component errors** - Boundary handling to prevent crashes

## Performance Considerations

- **Lazy loading** - Stories are loaded only when needed
- **Code highlighting** - Syntax highlighting is deferred until code is shown
- **Caching** - Successfully loaded stories are cached to avoid re-loading
- **Bundle splitting** - Individual story components are code-split automatically