<script>
	import { onMount } from 'svelte'
	import { loadDemo } from '../demo-loader.js'
	import DemoComponent from './DemoComponent.svelte'
	import DemoCode from './DemoCode.svelte'
	import DemoError from './DemoError.svelte'
	import DemoLoading from './DemoLoading.svelte'

	/**
	 * @typedef {Object} DemoRootProps
	 * @property {string} slug - The demo slug to load
	 * @property {string} [title] - Optional title for the demo
	 * @property {string} [description] - Optional description for the demo
	 * @property {boolean} [showCode] - Whether to show code by default
	 * @property {string} [class] - Additional CSS classes
	 * @property {Function} [ontoggle] - Callback when code visibility is toggled
	 * @property {Function} [oncopy] - Callback when code is copied
	 */

	/**
	 * Props for the DemoRoot component
	 * @type {DemoRootProps}
	 */
	let {
		slug,
		title = 'Demo',
		description = '',
		showCode = false,
		class: className = '',
		ontoggle,
		oncopy
	} = $props()

	let demoComponent = $state(null)
	let demoCode = $state('')
	let loading = $state(true)
	let error = $state('')

	let isCodeVisible = $state(showCode)

	onMount(async () => {
		try {
			const demo = await loadDemo(slug)
			demoComponent = demo.component
			demoCode = demo.code
		} catch (err) {
			console.error('Failed to load demo:', err)
			error = err.message
		} finally {
			loading = false
		}
	})

	/**
	 * Toggle code visibility
	 */
	function toggleCode() {
		isCodeVisible = !isCodeVisible
		ontoggle?.({ showCode: isCodeVisible })
	}

	/**
	 * Handle code copy
	 */
	function handleCopy(event) {
		oncopy?.(event)
	}
</script>

<div class="demo-root space-y-4 {className}">
	<!-- Header -->
	{#if title || description}
		<div class="space-y-2">
			{#if title}
				<h3 class="text-neutral-overlay text-lg font-semibold">{title}</h3>
			{/if}
			{#if description}
				<p class="text-neutral-floating text-sm">{description}</p>
			{/if}
		</div>
	{/if}

	<!-- Content -->
	{#if loading}
		<DemoLoading />
	{:else if error}
		<DemoError {error} />
	{:else}
		<div class="border-neutral-subtle bg-neutral-base rounded-lg border">
			<!-- Component Display -->
			<DemoComponent component={demoComponent} />

			<!-- Controls -->
			<div class="border-neutral-subtle bg-neutral-subtle border-t px-4 py-3">
				<div class="flex items-center justify-between">
					<button
						onclick={toggleCode}
						class="bg-neutral-elevated text-neutral-overlay hover:bg-neutral-floating inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
					>
						<span class="mr-2">
							{#if isCodeVisible}
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									></path>
								</svg>
							{:else}
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
									></path>
								</svg>
							{/if}
						</span>
						{isCodeVisible ? 'Hide Code' : 'Show Code'}
					</button>

					{#if isCodeVisible && demoCode}
						<DemoCode code={demoCode} oncopy={handleCopy} showCopyButton />
					{/if}
				</div>
			</div>
		</div>

		<!-- Code Display -->
		{#if isCodeVisible && demoCode}
			<DemoCode code={demoCode} oncopy={handleCopy} />
		{/if}
	{/if}
</div>
