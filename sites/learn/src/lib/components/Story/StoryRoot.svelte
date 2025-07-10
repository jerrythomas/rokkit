<script>
	import { onMount } from 'svelte'
	import { loadDemo } from '../../../routes/(learn)/tutorial/demo-loader.js'
	import StoryComponent from './StoryComponent.svelte'
	import StoryCode from './StoryCode.svelte'
	import StoryError from './StoryError.svelte'
	import StoryLoading from './StoryLoading.svelte'

	/**
	 * @typedef {Object} StoryRootProps
	 * @property {string} slug - The story slug to load
	 * @property {string} [title] - Optional title for the story
	 * @property {string} [description] - Optional description for the story
	 * @property {boolean} [showCode] - Whether to show code by default
	 * @property {string} [class] - Additional CSS classes
	 * @property {Function} [ontoggle] - Callback when code visibility is toggled
	 * @property {Function} [oncopy] - Callback when code is copied
	 */

	/**
	 * Props for the StoryRoot component
	 * @type {StoryRootProps}
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

	let storyComponent = $state(null)
	let storyCode = $state('')
	let storyFiles = $state([])
	let loading = $state(true)
	let error = $state('')

	let isCodeVisible = $state(showCode)

	onMount(async () => {
		try {
			const story = await loadDemo(slug)
			storyComponent = story.component
			storyCode = story.code
			storyFiles = story.files || []
		} catch (err) {
			console.error('Failed to load story:', err)
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

<div class="story-root space-y-4 {className}">
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
		<StoryLoading />
	{:else if error}
		<StoryError {error} />
	{:else}
		<div class="border-neutral-subtle bg-neutral-base rounded-lg border">
			<!-- Component Display -->
			<StoryComponent component={storyComponent} />

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

					{#if isCodeVisible && (storyCode || storyFiles.length > 0)}
						<StoryCode files={storyFiles} code={storyCode} oncopy={handleCopy} showCopyButton />
					{/if}
				</div>
			</div>
		</div>

		<!-- Code Display -->
		{#if isCodeVisible && (storyCode || storyFiles.length > 0)}
			<StoryCode files={storyFiles} code={storyCode} oncopy={handleCopy} />
		{/if}
	{/if}
</div>
