<script>
	let { value } = $props()
</script>

<div class="flex w-full gap-2 py-2">
	<div class="text-right">
		<h5 class="font-medium">{value.name}</h5>
		<p class="text-sm text-gray-600">{value.description}</p>
	</div>
</div>