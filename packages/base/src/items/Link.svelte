<script>
	import Text from './Text.svelte'
	import { defaultFields } from '../constants'

	export let content
	export let fields = defaultFields
</script>

<a
	class="flex flex-row flex-grow gap-2 items-center content"
	href={content[fields.url]}
>
	<Text {content} {fields} />
</a>
