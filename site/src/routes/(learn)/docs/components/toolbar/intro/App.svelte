<script>
	// @ts-nocheck
	import { Toolbar } from '@rokkit/ui'

	let lastAction = $state('none')

	let items = [
		{ label: 'Bold', icon: 'i-lucide:bold' },
		{ label: 'Italic', icon: 'i-lucide:italic' },
		{ label: 'Underline', icon: 'i-lucide:underline' },
		{ itemType: 'separator' },
		{ label: 'Align Left', icon: 'i-lucide:align-left' },
		{ label: 'Align Center', icon: 'i-lucide:align-center' },
		{ label: 'Align Right', icon: 'i-lucide:align-right' }
	]
</script>

<div class="space-y-4">
	<Toolbar {items} onclick={(item) => (lastAction = item.label)} />

	<p class="text-surface-z7">
		Last action: <strong>{lastAction}</strong>
	</p>
</div>
