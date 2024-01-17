<script>
	import { NestedEditor, TreeTable } from '@rokkit/organisms'

	export let data
  let tabular = []
	let value

	// function handle(event) {
	// 	schema = pick(['type', 'properties','items'], event.detail)
	// 	layout = event.detail.layout
	// 	scope = event.detail.scope.split('/').slice(1)
	// 	value = data.data
	//   type = event.detail.type
	// 	// if (event.detail.type === 'array'){
	//   for (let i = 0; i < scope.length; i++) {
	// 		value = value[scope[i]]
	// 	}
	// }
</script>

<NestedEditor bind:value={data.data} schema={data.schema} />
