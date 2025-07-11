<script>
	let { value } = $props()
</script>

<div class="flex h-32 w-full gap-4 py-3 text-sm font-extralight">
	<p class="font-mono italic leading-tight">
		{value.description}
	</p>
	<img src={value.photo} class="cover w-32 rounded" alt={value.name} />
</div>
