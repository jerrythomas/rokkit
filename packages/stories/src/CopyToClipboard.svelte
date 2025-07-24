<script>
	import { defaultStateIcons } from '@rokkit/core'
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
		<Icon name={defaultStateIcons.action.copysuccess} />
	{:else}
		<Icon name={defaultStateIcons.action.copy} />
	{/if}
</Button>
