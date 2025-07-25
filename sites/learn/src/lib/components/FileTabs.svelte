<script>
	import { Tabs } from 'bits-ui'
	import { highlightCode } from '$lib/shiki.js'
	import { vibe } from '@rokkit/states'

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

	/**
	 * Props for the FileTabs component
	 * @type {FileTabsProps}
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

	let activeFile = $derived(files.find((f) => f.id === selectedFile))
	let copySuccess = $state({})

	// Highlight code for the active file
	let highlightedCode = $derived(
		activeFile
			? highlightCode(activeFile.content, {
					lang: activeFile.language,
					theme: vibe.mode === 'dark' ? 'github-dark' : 'github-light'
				})
			: Promise.resolve('')
	)

	function handleFileSelect(fileId) {
		selectedFile = fileId
		onFileSelect?.({ fileId, file: files.find((f) => f.id === fileId) })
	}

	async function copyFileContent(file) {
		try {
			await navigator.clipboard.writeText(file.content)
			copySuccess[file.id] = true
			setTimeout(() => {
				copySuccess[file.id] = false
			}, 2000)
			onCopy?.({ file, content: file.content })
		} catch (err) {
			console.error('Failed to copy code:', err)
		}
	}

	function getFileIcon(file) {
		if (file.icon) return file.icon
		const KNOWN_EXTENSIONS = ['svelte', 'js', 'mjs', 'ts', 'css', 'html', 'json', 'md']
		if (KNOWN_EXTENSIONS.includes(file.name.split('.').pop()?.toLowerCase())) return '📄'

		// Default icons based on file extension
		const ext = file.name.split('.').pop()?.toLowerCase()
		return KNOWN_EXTENSIONS.includes(ext) ? `i-file:${ext}` : '📄'
	}
</script>

<div class="file-tabs {className}">
	{#if files.length === 0}
		<div class="border-surface-z2 bg-surface-z2 rounded-lg border p-6 text-center">
			<p class="text-surface-floating">No files to display</p>
		</div>
	{:else if files.length === 1}
		<!-- Single file - no tabs needed -->
		<div class="border-surface-z2 bg-surface-z2 rounded-lg border">
			{#if showFileInfo}
				<div class="border-surface-z2 bg-surface-elevated border-b px-4 py-2">
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-2">
							<span class="text-sm">{getFileIcon(files[0])}</span>
							<span class="text-surface-overlay text-sm font-medium">{files[0].name}</span>
						</div>
						<div class="flex items-center space-x-3">
							<span class="text-surface-floating text-xs">
								{files[0].content.split('\n').length} lines
							</span>
							{#if showCopyButton}
								<button
									onclick={() => copyFileContent(files[0])}
									class="text-surface-floating hover:text-surface-overlay transition-colors"
									title="Copy code"
								>
									{#if copySuccess[files[0].id]}
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
				{#await highlightCode( files[0].content, { lang: files[0].language, theme: vibe.mode === 'dark' ? 'github-dark' : 'github-light' } )}
					<div class="text-surface-floating p-4">Highlighting code...</div>
				{:then value}
					{@html value}
				{:catch error}
					<div class="p-4 text-red-500">Error highlighting code: {error.message}</div>
				{/await}
			</div>
		</div>
	{:else}
		<!-- Multiple files - show tabs -->
		<div class="border-surface-z2 bg-surface-z2 rounded-lg border">
			<Tabs.Root value={selectedFile} onValueChange={handleFileSelect}>
				<!-- Tab List -->
				<Tabs.List class="border-surface-z2 bg-surface-elevated flex overflow-x-auto border-b">
					{#each files as file (file.id)}
						<Tabs.Trigger
							value={file.id}
							class="text-surface-floating hover:text-surface-overlay hover:bg-surface-z2 data-[state=active]:text-surface-overlay data-[state=active]:bg-surface-z2 data-[state=active]:border-primary-overlay flex items-center space-x-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors data-[state=active]:border-b-2"
						>
							<span class="text-xs">{getFileIcon(file)}</span>
							<span>{file.name}</span>
						</Tabs.Trigger>
					{/each}
				</Tabs.List>

				<!-- Tab Content -->
				{#each files as file (file.id)}
					<Tabs.Content value={file.id} class="p-0">
						{#if showFileInfo}
							<!-- File Header -->
							<div class="border-surface-z2 bg-surface-elevated border-b px-4 py-2">
								<div class="flex items-center justify-between">
									<div class="flex items-center space-x-2">
										<span class="text-sm">{getFileIcon(file)}</span>
										<span class="text-surface-overlay text-sm font-medium">{file.name}</span>
									</div>
									<div class="flex items-center space-x-3">
										<span class="text-surface-floating text-xs">
											{file.content.split('\n').length} lines
										</span>
										{#if showCopyButton}
											<button
												onclick={() => copyFileContent(file)}
												class="text-surface-floating hover:text-surface-overlay transition-colors"
												title="Copy code"
											>
												{#if copySuccess[file.id]}
													<svg
														class="h-4 w-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M5 13l4 4L19 7"
														></path>
													</svg>
												{:else}
													<svg
														class="h-4 w-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
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

						<!-- Code Content -->
						<div class="overflow-x-auto">
							{#if file.id === selectedFile}
								{#await highlightedCode}
									<div class="text-surface-floating p-4">Highlighting code...</div>
								{:then value}
									{@html value}
								{:catch error}
									<div class="p-4 text-red-500">Error highlighting code: {error.message}</div>
								{/await}
							{/if}
						</div>
					</Tabs.Content>
				{/each}
			</Tabs.Root>
		</div>
	{/if}
</div>
