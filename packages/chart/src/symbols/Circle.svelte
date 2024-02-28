<script>
	export let x = 0
	export let y = 0
	export let size = 10
	export let fill = 'currentColor'
	export let stroke = 'currentColor'
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<circle
	cx={x}
	cy={y}
	r = {size/2}
	{fill}
	{stroke}
	role="button"
	on:click
	on:mouseover
	on:mouseleave
	on:focus
	tabindex="0"
/>
