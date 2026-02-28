<script>
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'
	import { Icon, Button } from '@rokkit/ui'
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
			console.error('Failed to copy code:', err)
		}
	}
</script>

<Button onclick={copyToClipboard} class={className} {title}>
	{#if copySuccess}
		<Icon name={DEFAULT_STATE_ICONS.action.copysuccess} />
	{:else}
		<Icon name={DEFAULT_STATE_ICONS.action.copy} />
	{/if}
</Button>
