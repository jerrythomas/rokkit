<script>
	import { highlightCode } from '$lib/shiki.js'
	import { vibe } from '@rokkit/states'

	/**
	 * @typedef {Object} DemoCodeProps
	 * @property {string} code - The source code to display
	 * @property {boolean} [showCopyButton] - Whether to show the copy button
	 * @property {string} [filename] - The filename to display
	 * @property {string} [class] - Additional CSS classes
	 * @property {Function} [oncopy] - Callback when code is copied
	 */

	/**
	 * Props for the DemoCode component
	 * @type {DemoCodeProps}
	 */
	let {
		code = '',
		showCopyButton = false,
		filename = 'App.svelte',
		class: className = '',
		oncopy
	} = $props()

	let copySuccess = $state(false)

	let highlightedCode = $derived(
		highlightCode(code, {
			lang: 'svelte',
			theme: vibe.mode == 'dark' ? 'github-dark' : 'github-light'
		})
	)

	/**
	 * Copy code to clipboard
	 */
	async function copyCode() {
		try {
			await navigator.clipboard.writeText(code)
			copySuccess = true
			setTimeout(() => {
				copySuccess = false
			}, 2000)
			oncopy?.({ code })
		} catch (err) {
			console.error('Failed to copy code:', err)
		}
	}
</script>

{#if showCopyButton}
	<!-- Copy Button (for inline usage) -->
	<button
		onclick={copyCode}
		class="bg-primary-overlay hover:bg-primary-hover inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors"
	>
		<span class="mr-2">
			{#if copySuccess}
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 13l4 4L19 7"
					></path>
				</svg>
			{:else}
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
					></path>
				</svg>
			{/if}
		</span>
		{copySuccess ? 'Copied!' : 'Copy Code'}
	</button>
{:else}
	<!-- Code Display Block -->
	<div class="demo-code rounded-lg bg-neutral-subtle {className}">
		<div class="border-b border-neutral-floating bg-neutral-elevated px-4 py-2">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-neutral-overlay">{filename}</span>
				<div class="flex items-center space-x-3">
					<span class="text-xs text-neutral-floating">{code.split('\n').length} lines</span>
					<button
						onclick={copyCode}
						class="text-neutral-floating hover:text-neutral-overlay transition-colors"
						title="Copy code"
					>
						{#if copySuccess}
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								></path>
							</svg>
						{:else}
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
								></path>
							</svg>
						{/if}
					</button>
				</div>
			</div>
		</div>
		<div class="overflow-x-auto">
			{#await highlightedCode}
				<div class="p-4 text-neutral-floating">Highlighting code...</div>
			{:then value}
				{@html value}
			{:catch error}
				<div class="p-4 text-red-500">Error highlighting code: {error.message}</div>
			{/await}
		</div>
	</div>
{/if}
