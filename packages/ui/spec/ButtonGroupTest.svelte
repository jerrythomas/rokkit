<script lang="ts">
	import ButtonGroup from '../src/components/ButtonGroup.svelte'

	const {
		size = 'md',
		class: className = ''
	}: {
		size?: 'sm' | 'md' | 'lg'
		class?: string
	} = $props()
</script>

<ButtonGroup {size} class={className}>
	<button data-test-btn>A</button>
	<button data-test-btn>B</button>
</ButtonGroup>
