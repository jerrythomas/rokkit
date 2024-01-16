<script>
	export let value
	export let min = undefined
	export let max = undefined
	export let list = undefined
</script>

<input bind:value type="range" {...$$restProps} {min} {max} {list} on:change on:focus on:blur />
