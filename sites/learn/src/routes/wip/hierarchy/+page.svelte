<script>
	import { NestedEditor } from '@rokkit/organisms'

	export let data

</script>

<NestedEditor bind:value={data.data} schema={data.schema} />
