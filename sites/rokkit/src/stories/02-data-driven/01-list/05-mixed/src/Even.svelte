<script>
	export let content
</script>

<div class="flex w-full h-32 gap-4 py-4 font-extralight">
	<img src={content.photo} class="rounded cover w-32" alt={content.name} />
	<p class="leading-tight text-sm">{content.description}</p>
</div>
