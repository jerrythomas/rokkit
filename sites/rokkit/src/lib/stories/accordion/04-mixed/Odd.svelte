<script>
	export let content
</script>

<div class="flex w-full h-32 gap-4 py-3 text-sm font-extralight">
	<p class="leading-tight italic font-mono">
		{content.description}
	</p>
	<img src={content.photo} class="rounded cover w-32" alt={content.name} />
</div>
