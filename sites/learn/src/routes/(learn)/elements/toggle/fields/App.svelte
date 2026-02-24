<script>
	import { Toggle } from '@rokkit/ui'

	let options = [
		{ label: 'Light', icon: 'i-lucide:sun' },
		{ label: 'Dark', icon: 'i-lucide:moon' },
		{ label: 'System', icon: 'i-lucide:monitor' }
	]
	let fields = { text: 'label', icon: 'icon' }
	let value = $state(options[0])
</script>

<div class="space-y-4">
	<Toggle {options} {fields} bind:value />

	<p class="text-surface-z7">
		Selected: <strong>{value?.label}</strong>
	</p>
</div>
