<script>
	import Empty from '../../src/tree/Empty.svelte'
	let { option = 1, class: classNames = '', ...rest } = $props()
</script>

<Empty class={classNames} {...rest}>
	{#if option === 1}
		No Items.
	{:else}
		<span>Nothing here!</span>
	{/if}
</Empty>
