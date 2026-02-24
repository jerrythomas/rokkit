<script>
	import { Toolbar } from '@rokkit/ui'

	let lastAction = $state('none')

	let items = [
		{ text: 'Bold', icon: 'i-lucide:bold' },
		{ text: 'Italic', icon: 'i-lucide:italic' },
		{ text: 'Underline', icon: 'i-lucide:underline' },
		{ itemType: 'separator' },
		{ text: 'Align Left', icon: 'i-lucide:align-left' },
		{ text: 'Align Center', icon: 'i-lucide:align-center' },
		{ text: 'Align Right', icon: 'i-lucide:align-right' }
	]
</script>

<div class="space-y-4">
	<Toolbar {items} onclick={(item) => (lastAction = item.text)} />

	<p class="text-surface-z7">
		Last action: <strong>{lastAction}</strong>
	</p>
</div>
