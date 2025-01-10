<script>
	let { value = $bindable(), ...rest } = $props()
</script>

<input bind:value type="file" {...rest} />
