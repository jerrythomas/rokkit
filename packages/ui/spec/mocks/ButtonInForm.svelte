<script>
	import Button from '../../src/Button.svelte'
	let { onsubmit, onreset } = $props()
</script>

<form {onsubmit} {onreset}>
	<Button label="Submit" type="submit" />
	<Button label="Reset" type="reset" />
</form>
