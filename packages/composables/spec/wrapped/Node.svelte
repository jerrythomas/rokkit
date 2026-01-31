<script>
	import Node from '../../src/tree/Node.svelte'
	let { option = 1, class: classNames = '', ...rest } = $props()
</script>

<Node class={classNames} {...rest}>
	{#if option === 1}
		Node...
	{:else}
		<span>Wait a minute!</span>
	{/if}
</Node>
