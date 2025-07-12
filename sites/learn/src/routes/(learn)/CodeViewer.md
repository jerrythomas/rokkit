# CodeViewer Component

A reusable component for displaying interactive demos with source code viewing and copying functionality. This component is designed to make tutorial creation easier by allowing you to maintain demo code in separate files while providing an integrated viewing experience.

## Features

- **Component Rendering**: Dynamically imports and renders Svelte components
- **Source Code Display**: Shows the source code with syntax highlighting
- **Copy to Clipboard**: One-click copying of source code
- **Toggle View**: Switch between demo and code view
- **Loading States**: Handles loading and error states gracefully
- **Responsive Design**: Works well on different screen sizes
- **Dark Mode**: Full dark mode support with UnoCSS classes

## Usage

### Basic Usage

```svelte
<script>
	import CodeViewer from './CodeViewer.svelte'
	import { loadDemo } from './demo-loader.js'
	import { onMount } from 'svelte'

	let demoComponent = $state(null)
	let demoCode = $state('')

	onMount(async () => {
		try {
			const demo = await loadDemo('forms/inputs')
			demoComponent = demo.component
			demoCode = demo.code
		} catch (error) {
			console.error('Failed to load demo:', error)
		}
	})
</script>

<CodeViewer
	component={demoComponent}
	code={demoCode}
	title="Interactive Form Demo"
	description="A practical example using multiple input components"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `component` | `any` | `null` | The Svelte component to render |
| `code` | `string` | `''` | The source code to display |
| `title` | `string` | `'Demo'` | Optional title for the demo |
| `description` | `string` | `''` | Optional description for the demo |
| `showCode` | `boolean` | `false` | Whether to show code by default |
| `class` | `string` | `''` | Additional CSS classes |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `toggle` | `{ showCode: boolean }` | Fired when code visibility is toggled |
| `copy` | `{ code: string }` | Fired when code is copied to clipboard |

## Demo Structure

The CodeViewer works best with a consistent demo structure:

```
tutorial/
├── forms/
│   ├── inputs/
│   │   ├── src/
│   │   │   └── App.svelte        # Demo component
│   │   └── +page.svelte          # Tutorial page
│   └── builder/
│       ├── src/
│       │   └── App.svelte
│       └── +page.svelte
└── elements/
    ├── list/
    │   ├── src/
    │   │   └── App.svelte
    │   └── +page.svelte
    └── ...
```

## Demo Loader

The `demo-loader.js` utility provides helper functions for loading demos:

### `loadDemo(demoPath)`

Loads a demo component and its source code:

```javascript
const demo = await loadDemo('forms/inputs')
// Returns: { component, code, title, description }
```

### `createSectionLoader(sectionPath)`

Creates a pre-configured loader for a specific section:

```javascript
const loadFormsDemo = createSectionLoader('forms')
const demo = await loadFormsDemo('inputs')
```

### `preloadDemos(demoPaths)`

Pre-loads multiple demos for better performance:

```javascript
await preloadDemos(['forms/inputs', 'forms/builder', 'elements/list'])
```

## Source Code Loading

The component supports multiple strategies for loading source code:

1. **API Endpoint**: Uses `/api/source-code` to fetch source files
2. **Raw Imports**: Vite's `?raw` import syntax (requires configuration)
3. **Fallback**: Provides a placeholder with expected code structure

### API Endpoint

The `/api/source-code` endpoint serves source code securely:

```javascript
GET /api/source-code?path=src/routes/(learn)/tutorial/forms/inputs/src/App.svelte
```

Security features:
- Path validation (only tutorial files allowed)
- Directory traversal prevention
- File type restrictions (`.svelte`, `.js`, `.ts`, `.css`)

## Integration with Tutorial System

### Tutorial Page Template

```svelte
<script>
	import { onMount } from 'svelte'
	import CodeViewer from '../../CodeViewer.svelte'
	import { loadDemo } from '../../demo-loader.js'

	let demoComponent = $state(null)
	let demoCode = $state('')
	let demoLoading = $state(true)

	onMount(async () => {
		try {
			const demo = await loadDemo('section/topic')
			demoComponent = demo.component
			demoCode = demo.code
		} catch (error) {
			console.error('Failed to load demo:', error)
			// Provide fallback code
			demoCode = `// Fallback code here`
		} finally {
			demoLoading = false
		}
	})
</script>

<div class="space-y-8">
	<header>
		<h1>Tutorial Title</h1>
		<p>Tutorial description</p>
	</header>

	<section>
		<h2>Interactive Demo</h2>
		{#if demoLoading}
			<div class="loading">Loading demo...</div>
		{:else}
			<CodeViewer
				component={demoComponent}
				code={demoCode}
				title="Demo Title"
				description="Demo description"
			/>
		{/if}
	</section>
</div>
```

### Benefits

- **Maintainability**: Demo code is separate from tutorial content
- **Reusability**: Components can be shared across tutorials
- **Development**: Easy to test and iterate on demo components
- **User Experience**: Integrated viewing and copying of source code

## Styling

The component uses UnoCSS classes following the project's design system:

- **Colors**: `neutral-*` for backgrounds, `primary-*` for accents
- **Dark Mode**: All styles include `dark:` variants
- **Responsive**: Adapts to different screen sizes
- **Accessibility**: Proper focus states and keyboard navigation

## Error Handling

The component handles various error scenarios:

- **Missing Component**: Shows placeholder message
- **Loading Failures**: Provides fallback code
- **Copy Failures**: Logs errors and continues gracefully
- **Network Issues**: Graceful degradation with fallback content

## Best Practices

1. **Demo Structure**: Keep demos focused and self-contained
2. **Code Quality**: Write clean, well-commented demo code
3. **Performance**: Use `preloadDemos()` for better loading experience
4. **Error Handling**: Always provide fallback code for reliability
5. **Accessibility**: Ensure demos are accessible and keyboard-navigable

## Future Enhancements

- Syntax highlighting for code display
- Multiple file support for complex demos
- Live code editing capabilities
- Export functionality for demo projects
- Integration with playground environments