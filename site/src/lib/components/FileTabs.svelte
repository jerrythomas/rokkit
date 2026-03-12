<script>
	// @ts-nocheck
	import { highlightCode } from '$lib/shiki.js'
	import { vibe } from '@rokkit/states'
	import { Tabs } from '@rokkit/ui'

	/**
	 * @typedef {Object} FileTabsFile
	 * @property {string} id - Unique identifier for the file
	 * @property {string} name - Display name of the file
	 * @property {string} language - Programming language for syntax highlighting
	 * @property {string} content - File content
	 * @property {string} [icon] - Optional icon for the file
	 */

	/**
	 * @typedef {Object} FileTabsProps
	 * @property {FileTabsFile[]} files - Array of files to display
	 * @property {string} [selectedFile] - Currently selected file ID (bindable)
	 * @property {string} [class] - Additional CSS classes
	 * @property {boolean} [showCopyButton] - Whether to show copy buttons
	 * @property {boolean} [showFileInfo] - Whether to show file metadata
	 * @property {Function} [onFileSelect] - Callback when file is selected
	 * @property {Function} [onCopy] - Callback when code is copied
	 */

	let {
		files = [],
		selectedFile = $bindable(),
		class: className = '',
		showCopyButton = true,
		showFileInfo = true,
		onFileSelect,
		onCopy
	} = $props()

	// Initialize selected file if not provided
	$effect(() => {
		if (!selectedFile && files.length > 0) {
			selectedFile = files[0].id
		}
	})

	let processedFiles = $derived(files.map((f) => ({ ...f, _icon: getFileIcon(f) })))
	let fields = { value: 'id', label: 'name', icon: '_icon' }

	let activeFile = $derived(files.find((f) => f.id === selectedFile))
	let copySuccess = $state({})

	let highlightedCode = $derived(
		activeFile
			? highlightCode(activeFile.content, {
					lang: activeFile.language,
					theme: vibe.mode === 'dark' ? 'github-dark' : 'github-light'
				})
			: Promise.resolve('')
	)

	async function copyFileContent(file) {
		if (!file) return
		try {
			await navigator.clipboard.writeText(file.content)
			copySuccess[file.id] = true
			setTimeout(() => {
				copySuccess[file.id] = false
			}, 2000)
			onCopy?.({ file, content: file.content })
		} catch (err) {
			console.error('Failed to copy code:', err) // eslint-disable-line no-console
		}
	}

	function getFileIcon(file) {
		if (file.icon) return file.icon
		const KNOWN_EXTENSIONS = ['svelte', 'js', 'mjs', 'ts', 'css', 'html', 'json', 'md']
		const ext = file.name.split('.').pop()?.toLowerCase()
		return KNOWN_EXTENSIONS.includes(ext) ? `i-file:${ext}` : '📄'
	}
</script>

<div class="file-tabs border-surface-z2 bg-surface-z2 rounded-lg border {className}">
	{#if files.length === 0}
		<div class="p-6 text-center">
			<p class="text-surface-z5">No files to display</p>
		</div>
	{:else}
		<Tabs
			options={processedFiles}
			{fields}
			bind:value={selectedFile}
			onchange={() => onFileSelect?.({ fileId: selectedFile, file: activeFile })}
		>
			{#snippet tabPanel()}
				{#if showFileInfo && activeFile}
					<div class="border-surface-z2 border-b px-4 py-2">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span class={getFileIcon(activeFile)} aria-hidden="true"></span>
								<span class="text-surface-z7 text-sm font-medium">{activeFile.name}</span>
							</div>
							<div class="flex items-center gap-3">
								<span class="text-surface-z5 text-xs">
									{activeFile.content.split('\n').length} lines
								</span>
								{#if showCopyButton}
									<button
										onclick={() => copyFileContent(activeFile)}
										class="text-surface-z5 hover:text-surface-z8 transition-colors"
										title="Copy code"
									>
										{#if copySuccess[activeFile.id]}
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
								{/if}
							</div>
						</div>
					</div>
				{/if}

				<div class="overflow-x-auto">
					{#await highlightedCode}
						<div class="text-surface-z5 p-4">Highlighting code...</div>
					{:then value}
						{@html value}
					{:catch error}
						<div class="p-4 text-red-500">Error highlighting code: {error.message}</div>
					{/await}
				</div>
			{/snippet}
		</Tabs>
	{/if}
</div>
