<script>
	import { onMount } from 'svelte'
	import { FormBuilder, FormRenderer } from '@rokkit/forms'
	import { basicDemo, schemaDemo, layoutDemo } from './config.js'

	let mounted = $state(false)

	// Form builders for each demo
	let basicFormBuilder = $state(new FormBuilder(basicDemo.data, basicDemo.schema, basicDemo.layout))
	let schemaFormBuilder = $state(
		new FormBuilder(schemaDemo.data, schemaDemo.schema, schemaDemo.layout)
	)
	let layoutFormBuilder = $state(
		new FormBuilder(layoutDemo.data, layoutDemo.schema, layoutDemo.layout)
	)

	// onMount(() => {
	// 	mounted = true

	// 	// Initialize form builders
	// 	basicFormBuilder =
	// 	schemaFormBuilder =
	// 	layoutFormBuilder =
	// })

	// Handle form updates
	function handleBasicUpdate(scope, value) {
		basicFormBuilder?.updateField(scope, value)
	}

	function handleSchemaUpdate(scope, value) {
		schemaFormBuilder?.updateField(scope, value)
	}

	function handleLayoutUpdate(scope, value) {
		layoutFormBuilder?.updateField(scope, value)
	}
</script>

<svelte:head>
	<title>FormBuilder Demo - FizzBot</title>
	<meta name="description" content="Dynamic form generation with FormBuilder class" />
</svelte:head>

<!-- {#if mounted} -->
<div class="min-h-screen overflow-y-auto bg-neutral-50 py-8 dark:bg-neutral-900">
	<div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-neutral-900 dark:text-white">FormBuilder Demo</h1>
			<p class="mt-2 text-neutral-600 dark:text-neutral-400">
				Dynamic form generation from data structures using schema and layout derivation
			</p>
		</div>

		<!-- Form Examples Grid -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Example 1: Basic Data-Driven Form -->
			<div class="rounded-lg bg-neutral-100 p-6 shadow-lg dark:bg-neutral-800">
				<h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
					1. Basic Data-Driven Form
				</h3>
				<p class="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
					Automatically derives schema and layout from data object. Uses range inputs for numbers.
				</p>

				{#if basicFormBuilder}
					<FormRenderer elements={basicFormBuilder.elements} onUpdate={handleBasicUpdate} />

					<div class="mt-4 rounded bg-neutral-100 p-3 dark:bg-neutral-700">
						<h4 class="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
							Current Data:
						</h4>
						<pre class="text-xs text-neutral-600 dark:text-neutral-400">{JSON.stringify(
								basicFormBuilder.data,
								null,
								2
							)}</pre>
					</div>
				{/if}
			</div>

			<!-- Example 2: Custom Schema -->
			<div class="rounded-lg bg-neutral-100 p-6 shadow-lg dark:bg-neutral-800">
				<h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
					2. Custom Schema with Constraints
				</h3>
				<p class="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
					Uses custom schema with min/max values. Shows how constraints affect form controls.
				</p>

				{#if schemaFormBuilder}
					<FormRenderer elements={schemaFormBuilder.elements} onUpdate={handleSchemaUpdate} />

					<div class="mt-4 rounded bg-neutral-100 p-3 dark:bg-neutral-700">
						<h4 class="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Schema:</h4>
						<pre class="text-xs text-neutral-600 dark:text-neutral-400">{JSON.stringify(
								schemaDemo.schema,
								null,
								2
							)}</pre>
					</div>
				{/if}
			</div>

			<!-- Example 3: Custom Layout -->
			<div class="rounded-lg bg-neutral-100 p-6 shadow-lg dark:bg-neutral-800">
				<h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
					3. Custom Layout & Controls
				</h3>
				<p class="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
					Custom layout with different input types: numbers, checkbox, and select dropdown.
				</p>

				{#if layoutFormBuilder}
					<FormRenderer elements={layoutFormBuilder.elements} onUpdate={handleLayoutUpdate} />

					<div class="mt-4 rounded bg-neutral-100 p-3 dark:bg-neutral-700">
						<h4 class="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Layout:</h4>
						<pre class="text-xs text-neutral-600 dark:text-neutral-400">{JSON.stringify(
								layoutDemo.layout,
								null,
								2
							)}</pre>
					</div>

					<div class="bg-secondary-50 dark:bg-secondary-900/20 mt-4 rounded p-3">
						<h4 class="text-secondary-700 dark:text-secondary-300 mb-2 text-sm font-medium">
							Live Data:
						</h4>
						<pre class="text-secondary-600 text-xs">{JSON.stringify(
								layoutFormBuilder.data,
								null,
								2
							)}</pre>
					</div>
				{/if}
			</div>
		</div>

		<!-- Features -->
		<div
			class="from-secondary-100 to-secondary-200 mt-12 rounded-lg bg-gradient-to-r p-8 dark:from-neutral-800 dark:to-neutral-700"
		>
			<h2 class="mb-6 text-xl font-semibold text-neutral-900 dark:text-white">
				FormBuilder Features
			</h2>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				<div>
					<h3 class="mb-2 font-medium text-neutral-900 dark:text-white">🧠 Smart Derivation</h3>
					<p class="text-sm text-neutral-700">
						Automatically derives schema and layout from data structure
					</p>
				</div>

				<div>
					<h3 class="mb-2 font-medium text-neutral-900 dark:text-white">🎛️ Multiple Input Types</h3>
					<p class="text-sm text-neutral-700">
						Range sliders, number inputs, checkboxes, selects, and text fields
					</p>
				</div>

				<div>
					<h3 class="mb-2 font-medium text-neutral-900 dark:text-white">📏 Constraint Support</h3>
					<p class="text-sm text-neutral-700">
						Min/max values, enums, and type validation from schema
					</p>
				</div>

				<div>
					<h3 class="mb-2 font-medium text-neutral-900 dark:text-white">🔄 Reactive Updates</h3>
					<p class="text-sm text-neutral-700">Real-time form updates with Svelte 5 reactivity</p>
				</div>

				<div>
					<h3 class="mb-2 font-medium text-neutral-900 dark:text-white">🎨 Custom Layouts</h3>
					<p class="text-sm text-neutral-700">
						Override default layout with custom field arrangements
					</p>
				</div>

				<div>
					<h3 class="mb-2 font-medium text-neutral-900 dark:text-white">📦 Reusable Class</h3>
					<p class="text-sm text-neutral-700">
						Framework-agnostic class design following AnimatedOrbs pattern
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
<!-- {:else}
	<div class="flex h-screen w-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
		<div class="text-neutral-600 ">Loading FormBuilder Demo...</div>
	</div>
{/if} -->
