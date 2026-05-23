<script lang="ts">
	import { Select } from '@rokkit/ui'

	const items = Array.from({ length: 20 }, (_, i) => ({
		label: `Option ${String(i + 1).padStart(2, '0')}`,
		value: `opt-${i + 1}`
	}))
	let value = $state<unknown>(null)
</script>

<Select {items} bind:value placeholder="Pick an option" />
