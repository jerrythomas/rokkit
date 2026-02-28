<script>
	// @ts-nocheck
	import { Toggle } from '@rokkit/ui'

	// label is now the default text field — no fields prop needed for standard objects
	let options = [
		{ label: 'Light', value: 'light', icon: 'i-lucide:sun' },
		{ label: 'Dark', value: 'dark', icon: 'i-lucide:moon' },
		{ label: 'System', value: 'system', icon: 'i-lucide:monitor' }
	]
	let value = $state('light')
</script>

<div class="space-y-4">
	<Toggle {options} bind:value />

	<p class="text-surface-z7">
		Selected: <strong>{value}</strong>
	</p>
</div>
