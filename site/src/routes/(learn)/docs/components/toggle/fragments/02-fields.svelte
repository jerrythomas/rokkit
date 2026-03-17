<script>
	// @ts-nocheck
	import { Toggle } from '@rokkit/ui'

	// label is the default text field — no fields mapping needed
	let options = [
		{ label: 'Light', value: 'light', icon: 'i-glyph:sun' },
		{ label: 'Dark', value: 'dark', icon: 'i-glyph:moon' },
		{ label: 'System', value: 'system', icon: 'i-glyph:monitor' }
	]
	let value = $state('light')
</script>

<Toggle {options} bind:value />
