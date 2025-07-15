<script>
	let { content, floating = false, class: className = '' } = $props()
	let copySuccess = $state(false)

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(content || '')
			copySuccess = true
			setTimeout(() => {
				copySuccess = false
			}, 2000)
		} catch (err) {
			console.error('Failed to copy code:', err)
		}
	}
</script>

<button
	onclick={copyToClipboard}
	class="text-neutral-floating hover:text-neutral-overlay flex items-center justify-center transition-colors {className}"
	class:absolute={floating}
	class:top-2={floating}
	class:right-2={floating}
	class:z-10={floating}
	title="Copy code"
>
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
				d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 002 2z"
			></path>
		</svg>
	{/if}
</button>
