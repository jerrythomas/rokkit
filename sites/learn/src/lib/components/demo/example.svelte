<script>
	import { DemoRoot, DemoComponent, DemoCode, DemoError, DemoLoading } from './index.js'
	import { List } from '@rokkit/ui'

	// Example component for standalone usage
	let ExampleComponent = List

	// Example code for standalone usage
	let exampleCode = `<script>
	import { List } from '@rokkit/ui'

	let items = [
		{ text: 'Apple', value: 'apple' },
		{ text: 'Banana', value: 'banana' },
		{ text: 'Orange', value: 'orange' }
	]
	let value = $state(null)
<\/script>

<List bind:items bind:value />`

	// Example error message
	let errorMessage = 'Component failed to load'

	// Example items for the component
	let items = $state([
		{ text: 'Apple', value: 'apple' },
		{ text: 'Banana', value: 'banana' },
		{ text: 'Orange', value: 'orange' }
	])
	let value = $state(null)
</script>

<div class="space-y-12 p-6">
	<header>
		<h1 class="text-3xl font-bold text-neutral-overlay mb-2">Demo Components Example</h1>
		<p class="text-neutral-floating">
			This page demonstrates how to use the modular demo components individually or together.
		</p>
	</header>

	<!-- Example 1: Full Demo with DemoRoot -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold text-neutral-overlay">1. Complete Demo with DemoRoot</h2>
		<p class="text-neutral-floating">
			Use <code class="bg-neutral-elevated px-2 py-1 rounded">DemoRoot</code> when you want to load a demo from a slug with automatic loading states.
		</p>

		<DemoRoot
			slug="introduction"
			title="Interactive List Demo"
			description="A complete demo loaded from the introduction tutorial"
			oncopy={(event) => console.log('Code copied:', event.code.length + ' characters')}
			ontoggle={(event) => console.log('Code visibility toggled:', event.showCode)}
		/>
	</section>

	<!-- Example 2: Standalone Component -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold text-neutral-overlay">2. Standalone Component</h2>
		<p class="text-neutral-floating">
			Use <code class="bg-neutral-elevated px-2 py-1 rounded">DemoComponent</code> when you want to display just the interactive component.
		</p>

		<div class="border-neutral-subtle bg-neutral-base rounded-lg border">
			<DemoComponent component={ExampleComponent} />
		</div>
	</section>

	<!-- Example 3: Standalone Code Display -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold text-neutral-overlay">3. Standalone Code Display</h2>
		<p class="text-neutral-floating">
			Use <code class="bg-neutral-elevated px-2 py-1 rounded">DemoCode</code> when you want to display just the code with syntax highlighting.
		</p>

		<DemoCode
			code={exampleCode}
			filename="Example.svelte"
			oncopy={(event) => console.log('Code copied from standalone:', event.code.length + ' characters')}
		/>
	</section>

	<!-- Example 4: Loading State -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold text-neutral-overlay">4. Loading State</h2>
		<p class="text-neutral-floating">
			Use <code class="bg-neutral-elevated px-2 py-1 rounded">DemoLoading</code> when you want to show a loading state.
		</p>

		<DemoLoading message="Loading your awesome demo..." />
	</section>

	<!-- Example 5: Error State -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold text-neutral-overlay">5. Error State</h2>
		<p class="text-neutral-floating">
			Use <code class="bg-neutral-elevated px-2 py-1 rounded">DemoError</code> when you want to display an error message.
		</p>

		<DemoError error={errorMessage} />
	</section>

	<!-- Example 6: Custom Component with Props -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold text-neutral-overlay">6. Custom Component with Props</h2>
		<p class="text-neutral-floating">
			You can also create custom components and pass them to <code class="bg-neutral-elevated px-2 py-1 rounded">DemoComponent</code>.
		</p>

		<div class="border-neutral-subtle bg-neutral-base rounded-lg border">
			<div class="p-6">
				<List bind:items bind:value />
				<div class="mt-4 text-sm text-neutral-floating">
					Selected: <strong class="text-neutral-overlay">{value?.text || 'None'}</strong>
				</div>
			</div>
		</div>
	</section>

	<!-- Usage Examples -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold text-neutral-overlay">Usage Examples</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4">
				<h3 class="font-semibold mb-2">Complete Demo</h3>
				<DemoCode
					code={`<DemoRoot
	slug="introduction"
	title="My Demo"
	description="Demo description"
/>`}
					filename="Usage.svelte"
					showCopyButton={false}
				/>
			</div>

			<div class="border-neutral-subtle bg-neutral-base rounded-lg border p-4">
				<h3 class="font-semibold mb-2">Individual Components</h3>
				<DemoCode
					code={`<DemoComponent component={MyComponent} />
<DemoCode code={sourceCode} />
<DemoLoading message="Loading..." />
<DemoError error="Something went wrong" />`}
					filename="Usage.svelte"
					showCopyButton={false}
				/>
			</div>
		</div>
	</section>
</div>
