# CodeViewer Usage Example

Rokkit UI is a data-driven, headless component library for Svelte that empowers you to build high-quality, accessible, and beautiful user interfaces—without sacrificing creative control or developer velocity.

This document shows how to use the new CodeViewer component to create maintainable tutorial demos.

## Quick Start

### 1. Create Your Demo Component

Create a demo in `src/App.svelte` within your tutorial section:

```
tutorial/
├── my-section/
│   ├── src/
│   │   └── App.svelte    # Your demo component
│   └── +page.svelte      # Tutorial page
```

**Example `src/App.svelte`:**

```svelte
<script>
	import { List } from '@rokkit/ui'

	let items = $state([
		{ text: 'Apple', icon: '🍎' },
		{ text: 'Banana', icon: '🍌' },
		{ text: 'Cherry', icon: '🍒' }
	])

	let value = $state(null)
</script>

<div class="space-y-4">
	<h2 class="text-lg font-bold">Fruit Selector</h2>
	<List bind:items bind:value />
	{#if value}
		<p>Selected: {value.icon} {value.text}</p>
	{/if}
</div>
```

### 2. Use CodeViewer in Your Tutorial Page

**Example `+page.svelte`:**

```svelte
<script>
	import { onMount } from 'svelte'
	import CodeViewer from '../CodeViewer.svelte'
	import { loadDemo } from '../demo-loader.js'

	let demoComponent = $state(null)
	let demoCode = $state('')
	let loading = $state(true)

	onMount(async () => {
		try {
			const demo = await loadDemo('my-section')
			demoComponent = demo.component
			demoCode = demo.code
		} catch (error) {
			console.error('Failed to load demo:', error)
			// Provide fallback code here
		} finally {
			loading = false
		}
	})
</script>

<div class="space-y-8">
	<h1>My Tutorial Section</h1>

	{#if loading}
		<div>Loading demo...</div>
	{:else}
		<CodeViewer
			component={demoComponent}
			code={demoCode}
			title="Interactive Demo"
			description="Click items to see selection in action"
		/>
	{/if}
</div>
```

## Benefits

- **Data-Driven:** Components adapt to your data, not the other way around. No more writing adapters or mappers for every API response.
- **Developer-Focused:** Rokkit is designed to let you focus on your application's functionality, not on learning a new design system or fighting with component APIs.
- **Unstyled by Default:** Bring your own styles, or use one of the included themes. Rokkit provides semantic `data-*` attributes for easy theming.
- **Extensible:** Override, customize, and compose components as needed. Use snippets and field mapping for total flexibility.
- **Separation of Concerns:** Demo code is separate from tutorial content.
- **Easy Maintenance:** Update demos by editing `src/App.svelte` only.
- **Code Viewing:** Users can see and copy the exact source code.
- **Reusable:** Same demo can be used across multiple tutorials.
- **Testable:** Demo components can be tested independently.

---

### Acknowledgements

- **Bits UI** — Inspired the data-attribute pattern and composable architecture. Rokkit uses Bits UI under the hood for some components.
- **UnoCSS** — For utility-first styling and theme support.
- **Iconify** — For the icon system.

## File Structure

```
tutorial/
├── CodeViewer.svelte              # Shared component
├── demo-loader.js                 # Utility functions
├── introduction/
│   ├── src/App.svelte            # Demo component
│   └── +page.svelte              # Tutorial page
├── forms/
│   ├── inputs/
│   │   ├── src/App.svelte        # Forms demo
│   │   └── +page.svelte          # Forms tutorial
│   └── builder/
│       ├── src/App.svelte        # Builder demo
│       └── +page.svelte          # Builder tutorial
```

## Next Steps

1. Create your demo component in `src/App.svelte`
2. Import and use CodeViewer in your tutorial page
3. Test that the demo loads and code displays correctly
4. Iterate on your demo until it perfectly illustrates the concept

The system handles loading, error states, and provides copy functionality automatically!
