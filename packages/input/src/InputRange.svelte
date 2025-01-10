<script>
	let {
		value = $bindable(),
		min = undefined,
		max = undefined,
		list = undefined,
		...rest
	} = $props()
</script>

<input bind:value type="range" {...rest} {min} {max} {list} />
