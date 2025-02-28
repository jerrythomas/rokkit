<script>
	import { Pill } from '@rokkit/ui'
	import { FieldMapper } from '@rokkit/core'
	import Status from './Status.svelte'

	let mapping = new FieldMapper({}, { default: Status })
</script>

<span class="flex flex-wrap gap-2">
	<Pill value="success" {mapping} />
	<Pill value="failure" {mapping} />
	<Pill value="warning" {mapping} />
</span>
