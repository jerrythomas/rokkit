<script>
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'
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
			console.error('Failed to copy code:', err)
		}
	}
</script>

<Button
	onclick={copyToClipboard}
	class={className}
	{title}
	style="ghost"
	size="sm"
	icon={copySuccess ? DEFAULT_STATE_ICONS.action.copysuccess : DEFAULT_STATE_ICONS.action.copy}
/>
