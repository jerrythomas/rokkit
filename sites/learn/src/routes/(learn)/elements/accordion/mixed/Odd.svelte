<script>
	let { value } = $props()
</script>

<div class="flex h-32 w-full gap-4 py-4 font-extralight">
	{#if value.photo}
		<img src={value.photo} class="cover w-32 rounded" alt={value.name} />
	{/if}
	<div class="flex flex-col justify-center">
		<h4 class="font-semibold text-lg">{value.name}</h4>
		<p class="text-sm leading-tight">{value.description}</p>
	</div>
</div>