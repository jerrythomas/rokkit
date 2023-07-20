<script>
	import DataEditor from './DataEditor.svelte'

	export let value
	export let schema
	export let layout
	export let using
</script>

<form on:submit>
	<DataEditor bind:value {schema} {layout} {using} />
	<button type="submit">Submit</button>
</form>
