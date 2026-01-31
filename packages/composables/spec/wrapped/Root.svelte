<script>
	import Root from '../../src/tree/Root.svelte'
	let { option = 1, class: classNames = '', ...rest } = $props()
</script>

<Root class={classNames} {...rest}>
	{#if option === 1}
		Root...
	{:else}
		<span>Wait a minute!</span>
	{/if}
</Root>
