<script>
	import DataEditor from './DataEditor.svelte'

	export let value
	export let schema = null
	export let layout = null
	export let using = {}
</script>

<form on:submit>
	<DataEditor bind:value {schema} {layout} {using} />
	<slot>
		<button type="submit">Submit</button>
	</slot>
</form>
