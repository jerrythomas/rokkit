<script lang="ts">
	import ToolbarGroup from '../src/components/ToolbarGroup.svelte'

	const {
		label,
		gap = 'sm'
	}: {
		label?: string
		gap?: 'none' | 'sm' | 'md' | 'lg'
	} = $props()
</script>

<ToolbarGroup {label} {gap}>
	<button data-test-child>Child 1</button>
	<button data-test-child>Child 2</button>
</ToolbarGroup>
