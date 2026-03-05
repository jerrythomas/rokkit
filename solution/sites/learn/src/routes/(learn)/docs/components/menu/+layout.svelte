<script>
	// @ts-nocheck
	import { Toggle } from '@rokkit/ui'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'

	let { children } = $props()

	const viewOptions = [
		{ label: 'Learn', value: 'learn', icon: 'i-lucide:book-open' },
		{ label: 'Play', value: 'play', icon: 'i-lucide:play' }
	]

	let activeView = $derived(page.url.pathname.endsWith('/play') ? 'play' : 'learn')
	let basePath = $derived(page.url.pathname.replace(/\/play$/, ''))

	function handleViewChange(value) {
		if (value === 'play') goto(`${basePath}/play`)
		else goto(basePath)
	}
</script>

<div class="mb-6 flex items-center justify-end" data-view-toggle>
	<Toggle options={viewOptions} value={activeView} onchange={handleViewChange} />
</div>

{@render children?.()}
