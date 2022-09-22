<script>
  import { layout , validate} from "./layout"
	import FormFields from './FormFields.svelte'

	export let action  = null
	export let data
	export let schema
	export let mapping = layout(schema, data)

	function handleChange(){
		mapping = mapping.validate()
	}

</script>

<form on:submit on:reset {action}>
  <FormFields bind:data {mapping} on:change={handleChange} />
</form>