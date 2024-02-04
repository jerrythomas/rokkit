<script>
	import { NestedEditor } from '@rokkit/organisms'

	export let data

	let value = data.data
	let stringValue = JSON.stringify(data.data, null, 2)
	function handle(event) {
		stringValue = JSON.stringify(event.detail)
	}
</script>

<content class="flex overflow-hidden">
	<NestedEditor bind:value schema={data.schema} on:change={handle}>
		<span class="flex w-full justify-end">
			<button class="btn btn-primary" on:click={() => console.log(value)}>Save</button>
		</span>
	</NestedEditor>
</content>
