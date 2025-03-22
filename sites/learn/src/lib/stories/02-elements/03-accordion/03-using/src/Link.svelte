<script>
	import { Item } from '@rokkit/ui'

	let { value, mapping } = $props()

	let target = $derived(mapping.getAttribute(value, 'target'))
</script>

<a
	class="flex flex-grow flex-row items-center"
	href={mapping.getAttribute(value, 'url')}
	{target}
	tabindex="-1"
>
	<Item {value} {mapping} />
</a>
