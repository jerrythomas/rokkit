<script>
	export let value
</script>

<div class="flex w-full h-32 gap-4 py-3 text-sm font-extralight">
	<p class="leading-tight italic font-mono">
		{value.description}
	</p>
	<img src={value.photo} class="rounded cover w-32" alt={value.name} />
</div>
