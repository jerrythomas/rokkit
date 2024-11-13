<script>
	let { value = $bindable(), ...rest } = $props()
</script>

<input type="checkbox" {...rest} bind:checked={value} />
