<script>
	import Viewport from '../../src/tree/Viewport.svelte'
	let { option = 1, class: classNames = '', ...rest } = $props()
</script>

<Viewport class={classNames} {...rest}>
	{#if option === 1}
		Viewport...
	{:else}
		<span>Wait a minute!</span>
	{/if}
</Viewport>
