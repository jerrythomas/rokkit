<script>
	import Text from './Text.svelte'
	import { defaultFields } from '../constants'

	export let value
	export let fields = defaultFields

	$: target = fields.target ? value[fields.target] : ''
</script>

<a
	class="flex flex-row flex-grow items-center"
	href={value[fields.url]}
	{target}
	tabindex="-1"
>
	<Text {value} {fields} />
</a>
