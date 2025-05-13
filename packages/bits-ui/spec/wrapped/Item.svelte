<script>
	import Item from '../../src/tree/Item.svelte'
	let { option = 1, class: classNames = '', ...rest } = $props()
</script>

<Item class={classNames} {...rest}>
	{#if option === 1}
		Item...
	{:else}
		<span>Wait a minute!</span>
	{/if}
</Item>
