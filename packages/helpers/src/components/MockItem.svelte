<script>
	let { value = null } = $props()
	let text = $derived(typeof value === 'object' ? value?.text : value)
</script>

{text}
