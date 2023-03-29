<script>
	export let content
	export let fields
</script>

<p>{content[fields.text]}</p>
<img
	src={content[fields.image]}
	alt={content[fields.text]}
	class="rounded-sm h-8 w-8"
/>
