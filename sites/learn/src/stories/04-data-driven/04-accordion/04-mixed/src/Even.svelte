<script>
	export let value
</script>

<div class="flex w-full h-32 gap-4 py-4 font-extralight">
	<img src={value.photo} class="rounded cover w-32" alt={value.name} />
	<p class="leading-tight text-sm">{value.description}</p>
</div>
