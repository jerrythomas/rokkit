<script>
	export let label
	export let width = '20px'
</script>

<tick class="grid grid-cols-2" {width} on:click>
	<span class="col-start-2 border-l" />
	<p class="col-span-2 flex justify-center text-xs">
		{label}
	</p>
</tick>
