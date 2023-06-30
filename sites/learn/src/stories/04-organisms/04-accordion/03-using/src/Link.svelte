<script>
	import { defaultFields } from 'rokkit/utils'
	import { Item } from '@rokkit/molecules'

	export let value
	export let fields = defaultFields

	$: target = fields.target ? value[fields.target] : ''
</script>

<a
	class="flex flex-grow flex-row items-center"
	href={value[fields.url]}
	{target}
	tabindex="-1"
>
	<Item {value} {fields} />
</a>
