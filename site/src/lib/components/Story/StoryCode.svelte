<script>
	// @ts-nocheck
	import { highlightCode } from '$lib/shiki.js'
	import { vibe } from '@rokkit/states'
	import FileTabs from '$lib/components/FileTabs.svelte'

	/**
	 * @typedef {Object} StoryCodeFile
	 * @property {string} id - Unique identifier for the file
	 * @property {string} name - Display name of the file
	 * @property {string} language - Programming language for syntax highlighting
	 * @property {string} content - File content
	 * @property {string} [icon] - Optional icon for the file
	 */

	/**
	 * @typedef {Object} StoryCodeProps
	 * @property {string|StoryCodeFile[]} code - The source code to display or array of files
	 * @property {StoryCodeFile[]} [files] - Array of files (alternative to code)
	 * @property {boolean} [showCopyButton] - Whether to show the copy button
	 * @property {string} [filename] - The filename to display (for single file)
	 * @property {string} [language] - Programming language (for single file)
	 * @property {string} [class] - Additional CSS classes
	 * @property {Function} [oncopy] - Callback when code is copied
	 */

	/**
	 * Props for the StoryCode component
	 * @type {StoryCodeProps}
	 */
	let {
		code = '',
		files = [],
		showCopyButton = false,
		filename = 'App.svelte',
		language = 'svelte',
		class: className = '',
		oncopy
	} = $props()

	// Convert single code string to files array if needed
	let codeFiles = $derived.by(() => {
		// If files array is provided, use it
		if (files && files.length > 0) {
			return files
		}
		// If code is an array, use it as files
		if (Array.isArray(code)) {
			return code
		}
		// If code is a string, convert to single file
		if (typeof code === 'string' && code.trim()) {
			return [
				{
					id: 'main',
					name: filename,
					language: language,
					content: code
				}
			]
		}
		return []
	})

	let copySuccess = $state(false)

	let highlightedCode = $derived(
		typeof code === 'string'
			? highlightCode(code, {
					lang: language,
					theme: vibe.mode === 'dark' ? 'github-dark' : 'github-light'
				})
			: Promise.resolve('')
	)

	/**
	 * Copy code to clipboard
	 */
	async function copyCode() {
		try {
			const textToCopy = typeof code === 'string' ? code : codeFiles[0]?.content || ''
			await navigator.clipboard.writeText(textToCopy)
			copySuccess = true
			setTimeout(() => {
				copySuccess = false
			}, 2000)
			oncopy?.({ code: textToCopy })
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('Failed to copy code:', err)
		}
	}

	/**
	 * Handle file copy from FileTabs
	 */
	function handleFileCopy(event) {
		oncopy?.(event)
	}

	/**
	 * Copy specific file content
	 */
	async function copyFileContent(file) {
		try {
			await navigator.clipboard.writeText(file.content)
			copySuccess = true
			setTimeout(() => {
				copySuccess = false
			}, 2000)
			oncopy?.({ file, content: file.content })
		} catch (err) {
			// eslint-disable-next-line no-console
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
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
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
{:else if codeFiles.length > 1}
	<!-- Multi-file Code Display -->
	<div class="story-code {className}">
		<FileTabs files={codeFiles} showCopyButton={true} showFileInfo={true} onCopy={handleFileCopy} />
	</div>
{:else if codeFiles.length === 1}
	<!-- Single file Code Display -->
	<div class="story-code bg-surface-z2 rounded-lg {className}">
		<div class="border-surface-floating bg-surface-elevated border-b px-4 py-2">
			<div class="flex items-center justify-between">
				<span class="text-surface-overlay text-sm font-medium">{codeFiles[0].name}</span>
				<div class="flex items-center space-x-3">
					<span class="text-surface-floating text-xs">
						{codeFiles[0].content.split('\n').length} lines
					</span>
					<button
						onclick={() => copyFileContent(codeFiles[0])}
						class="text-surface-floating hover:text-surface-overlay transition-colors"
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
			{#await highlightCode( codeFiles[0].content, { lang: codeFiles[0].language, theme: vibe.mode === 'dark' ? 'github-dark' : 'github-light' } )}
				<div class="text-surface-floating p-4">Highlighting code...</div>
			{:then value}
				{@html value}
			{:catch error}
				<div class="p-4 text-red-500">Error highlighting code: {error.message}</div>
			{/await}
		</div>
	</div>
{:else}
	<!-- Single file fallback -->
	<div class="story-code bg-surface-z2 rounded-lg {className}">
		<div class="border-surface-floating bg-surface-elevated border-b px-4 py-2">
			<div class="flex items-center justify-between">
				<span class="text-surface-overlay text-sm font-medium">{filename}</span>
				<div class="flex items-center space-x-3">
					<span class="text-surface-floating text-xs"
						>{typeof code === 'string' ? code.split('\n').length : 0} lines</span
					>
					<button
						onclick={copyCode}
						class="text-surface-floating hover:text-surface-overlay transition-colors"
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
				<div class="text-surface-floating p-4">Highlighting code...</div>
			{:then value}
				{@html value}
			{:catch error}
				<div class="p-4 text-red-500">Error highlighting code: {error.message}</div>
			{/await}
		</div>
	</div>
{/if}
