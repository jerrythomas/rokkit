<script>
	let { value } = $props();
</script>

<div class="h-32 w-full flex gap-4 py-4 font-extralight">
	<img src={value.photo} class="cover w-32 rounded" alt={value.name} />
	<p class="leading-tight text-sm">{value.description}</p>
</div>
