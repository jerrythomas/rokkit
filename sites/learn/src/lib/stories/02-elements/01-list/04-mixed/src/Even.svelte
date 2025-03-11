<script>
	let { value } = $props()
</script>

<div class="flex h-32 w-full gap-4 py-4 font-extralight">
	<img src={value.photo} class="cover w-32 rounded" alt={value.name} />
	<p class="text-sm leading-tight">{value.description}</p>
</div>
