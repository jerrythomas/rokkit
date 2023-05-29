<script>
	export let value
</script>

<div class="h-32 w-full flex gap-4 py-3 font-extralight text-sm">
	<p class="font-mono leading-tight italic">
		{value.description}
	</p>
	<img src={value.photo} class="cover w-32 rounded" alt={value.name} />
</div>
