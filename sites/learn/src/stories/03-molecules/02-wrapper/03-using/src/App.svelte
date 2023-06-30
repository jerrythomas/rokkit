<script>
	import { ItemWrapper } from '@rokkit/molecules'
	import Status from './Status.svelte'

	let using = { default: Status }
</script>

<span class="flex flex-wrap gap-2">
	<ItemWrapper value="success" {using} />
	<ItemWrapper value="failure" {using} />
	<ItemWrapper value="warning" {using} />
</span>
