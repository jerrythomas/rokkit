<script lang="ts">
	import Stack from '../src/components/Stack.svelte'

	const {
		direction = 'vertical',
		gap = 'md',
		align,
		justify,
		class: className = ''
	}: {
		direction?: 'vertical' | 'horizontal'
		gap?: string
		align?: string
		justify?: string
		class?: string
	} = $props()
</script>

<Stack {direction} {gap} {align} {justify} class={className}>
	<span data-stack-child>A</span>
	<span data-stack-child>B</span>
</Stack>
