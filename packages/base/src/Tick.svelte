<script>
	export let label
	export let width = '20px'
</script>

<div class="grid grid-cols-2 select-none cursor-pointer" {width} on:click>
	<span class="col-start-2 border-l border-primary-500 h-2 tick" />
	<p class="col-span-2 flex justify-center text-xs ">
		{label}
	</p>
</div>
