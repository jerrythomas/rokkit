<script>
	import Text from './Text.svelte'
	import { defaultFields } from '../constants'

	export let content
	export let fields = defaultFields

	$: target = fields.target ? content[fields.target] : ''
</script>

<a
	class="flex flex-row flex-grow gap-2 items-center content"
	href={content[fields.url]}
	{target}
	tabindex="-1"
>
	<Text {content} {fields} />
</a>
