<script>
	import { NestedEditor } from '@rokkit/organisms'

	export let data
</script>

<NestedEditor bind:value={data.data} schema={data.schema}>
	<span class="flex w-full justify-end">
		<button class="btn btn-primary" on:click={() => console.log(data.data)}>Save</button>
	</span>
</NestedEditor>
