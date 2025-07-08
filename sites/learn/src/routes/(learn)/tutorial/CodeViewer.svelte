<script>
	import { highlightCode } from '$lib/shiki.js'

	/**
	 * Escape HTML characters for safe display
	 */
	function escapeHtml(text) {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
	}

	/**
	 * @typedef {Object} CodeViewerProps
	 * @property {any} component - The Svelte component to render
	 * @property {string} code - The source code to display
	 * @property {string} [title] - Optional title for the demo
	 * @property {string} [description] - Optional description for the demo
	 * @property {boolean} [showCode] - Whether to show code by default
	 * @property {string} [class] - Additional CSS classes
	 * @property {Function} [ontoggle] - Callback when code visibility is toggled
	 * @property {Function} [oncopy] - Callback when code is copied
	 */

	/**
	 * Props for the CodeViewer component
	 * @type {CodeViewerProps}
	 */
	let {
		component,
		code = '',
		title = 'Demo',
		description = '',
		showCode = false,
		class: className = '',
		ontoggle,
		oncopy
	} = $props()

	let isCodeVisible = $state(showCode)
	let copySuccess = $state(false)
	// let highlightedCode = $state('')
	let isHighlighting = $state(false)
	let codeError = $state('')
	let highlightedCode = $derived(highlightCode(code, { lang: 'svelte' }))
	/**
	 * Toggle code visibility and highlight code if needed
	 */
	async function toggleCode() {
		isCodeVisible = !isCodeVisible
		ontoggle?.({ showCode: isCodeVisible })

		// Highlight code when showing for the first time
		if (isCodeVisible && !highlightedCode && code) {
			await highlightCodeAsync()
		}
	}

	/**
	 * Highlight code using Shiki
	 */
	async function highlightCodeAsync() {
		if (!code || isHighlighting) return

		isHighlighting = true
		codeError = ''

		try {
			highlightedCode = await highlightCode(code, { lang: 'svelte' })
		} catch (error) {
			console.error('Failed to highlight code:', error)
			codeError = `Syntax highlighting failed: ${error.message}`
			// Fallback to plain text without syntax highlighting
			highlightedCode = `<pre class="overflow-x-auto text-sm text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-800 rounded p-4"><code>${escapeHtml(code)}</code></pre>`
		} finally {
			isHighlighting = false
		}
	}

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

<div class="code-viewer space-y-4 {className}">
	<!-- Header -->
	{#if title || description}
		<div class="space-y-2">
			{#if title}
				<h3 class="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h3>
			{/if}
			{#if description}
				<p class="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
			{/if}
		</div>
	{/if}

	<!-- Demo Section -->
	<div
		class="rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
	>
		<!-- Demo Content -->
		<div class="p-6">
			{#if component}
				{@const Component = component}
				<Component />
			{:else}
				<div class="text-neutral-500 dark:text-neutral-400">No component provided</div>
			{/if}
		</div>

		<!-- Controls -->
		<div
			class="border-t border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800"
		>
			<div class="flex items-center justify-between">
				<button
					onclick={toggleCode}
					class="inline-flex items-center rounded-md bg-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
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

				{#if isCodeVisible && code}
					<button
						onclick={copyCode}
						class="bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors"
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
				{/if}
			</div>
		</div>
	</div>

	<!-- Code Display -->
	{#if isCodeVisible && code}
		<div
			class="rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800"
		>
			<div class="border-b border-neutral-200 bg-neutral-100 px-4 py-2 dark:border-neutral-700">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">App.svelte</span>
					<span class="text-xs text-neutral-500 dark:text-neutral-400"
						>{code.split('\n').length} lines</span
					>
				</div>
			</div>
			<div class="p-4">
				{#await highlightedCode}
					<!-- Content displayed while the promise is pending (loading state) -->
					<p>Loading...</p>
				{:then value}
					<!-- Content displayed when the promise resolves successfully -->
					{@html value}
				{:catch error}
					<!-- Content displayed if the promise is rejected (error state) -->
					<p style="color: red;">Error: {error.message}</p>
				{/await}
			</div>
		</div>
	{/if}
</div>
