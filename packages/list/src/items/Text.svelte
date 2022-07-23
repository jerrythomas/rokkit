<script>
	export let content
	export let fields
</script>

<a class="px-3 flex flex-grow content" href={content[fields.url]}>
	{content[fields.text]}
</a>
