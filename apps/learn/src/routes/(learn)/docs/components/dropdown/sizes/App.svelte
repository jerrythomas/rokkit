<script>
	// @ts-nocheck
	import { Dropdown } from '@rokkit/ui'

	const items = [
		{ label: 'Option A', value: 'a' },
		{ label: 'Option B', value: 'b' },
		{ label: 'Option C', value: 'c' }
	]
</script>

<div class="flex flex-wrap items-center gap-4">
	<Dropdown {items} size="sm" placeholder="Small" />
	<Dropdown {items} size="md" placeholder="Medium" />
	<Dropdown {items} size="lg" placeholder="Large" />
</div>
