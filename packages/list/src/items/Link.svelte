<script>
	import Text from './Text.svelte'
	export let content
	export let fields
</script>

<a class="flex flex-row flex-grow gap-2 content" href={content[fields.url]}>
	<Text {content} {fields} />
</a>
