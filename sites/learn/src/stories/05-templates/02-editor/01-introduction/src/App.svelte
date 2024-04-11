<script>
	import { NestedEditor } from '@rokkit/ui'
	import { schema } from './schema.js'
	import { data } from './data.js'

	let value = data
	// let stringValue = JSON.stringify(data, null, 2)

	// function handle(event) {
	// 	stringValue = JSON.stringify(event.detail, null, 2)
	// }
</script>

<content class="flex h-full overflow-hidden border border-neutral-subtle">
	<NestedEditor bind:value {schema} />
	<!-- <pre class="overflow-auto text-xs border-l border-neutral-subtle">{stringValue}</pre> -->
</content>
