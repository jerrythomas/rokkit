<script>
	import { defaultStateIcons } from '@rokkit/core'
	import { Button } from '@rokkit/ui'
	let { content, class: className = 'absolute right-2 top-2 z-10', title = 'Copy code' } = $props()
	let copySuccess = $state(false)

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(content || '')
			copySuccess = true
			setTimeout(() => {
				copySuccess = false
			}, 2000)
		} catch (err) {
			console.error('Failed to copy code:', err) // eslint-disable-line no-console
		}
	}
</script>

<Button onclick={copyToClipboard} class={className} {title}>
	{#if copySuccess}
		<span class={defaultStateIcons.action.copysuccess} aria-hidden="true"></span>
	{:else}
		<span class={defaultStateIcons.action.copy} aria-hidden="true"></span>
	{/if}
</Button>
