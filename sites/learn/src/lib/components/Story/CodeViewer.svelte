<script>
	import { highlightCode } from '$lib/shiki.js'
	import { vibe } from '@rokkit/states'
	import { TabGroup } from '@rokkit/bits-ui'
	let { files = [] } = $props()
	let current = $state(files[0])
	let theme = $derived(vibe.mode == 'dark' ? 'github-dark' : 'github-light')
	let fields = { text: 'name', icon: 'language' }
	let highlightedCode = $derived(
		highlightCode(current?.content, {
			lang: current?.language,
			theme
		})
	)

	let copySuccess = $state(false)

	async function copyCurrentFile() {
		try {
			await navigator.clipboard.writeText(current?.content || '')
			copySuccess = true
			setTimeout(() => {
				copySuccess = false
			}, 2000)
		} catch (err) {
			console.error('Failed to copy code:', err)
		}
	}
</script>

<TabGroup options={files} {fields} bind:value={current}>
	{#snippet children()}
		<div class="flex items-center justify-between border-b border-neutral-floating bg-neutral-elevated px-4 py-2">
			<span class="text-sm font-medium text-neutral-overlay">{current?.name}</span>
			<div class="flex items-center space-x-3">
				<span class="text-xs text-neutral-floating">
					{current?.content?.split('\n').length || 0} lines
				</span>
				<button
					onclick={copyCurrentFile}
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
		<div class="overflow-x-auto">
			{#await highlightedCode}
				<div class="p-4 text-neutral-floating">Highlighting code...</div>
			{:then code}
				<!-- eslint-disable svelte/no-at-html-tags -->
				{@html code}
			{:catch error}
				<div class="p-4 text-red-500">Error highlighting code: {error.message}</div>
			{/await}
		</div>
	{/snippet}
</TabGroup>
