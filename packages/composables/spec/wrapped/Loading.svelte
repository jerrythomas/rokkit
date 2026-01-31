<script>
	import Loading from '../../src/tree/Loading.svelte'
	let { option = 1, class: classNames = '', ...rest } = $props()
</script>

<Loading class={classNames} {...rest}>
	{#if option === 1}
		Loading...
	{:else}
		<span>Wait a minute!</span>
	{/if}
</Loading>
