<script>
	import NodeList from '../../src/tree/NodeList.svelte'
	let { option = 1, class: classNames = '', ...rest } = $props()
</script>

<NodeList class={classNames} {...rest}>
	{#if option === 1}
		NodeList...
	{:else}
		<span>Wait a minute!</span>
	{/if}
</NodeList>
