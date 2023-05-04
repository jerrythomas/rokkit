<script>
	export let variant
	export let props
	export let component
</script>

<card class="flex flex-col border border-skin-300 rounded-lg shadow min-w-80">
	<h1 class="flex leading-loose text-skin-700 bg-skin-200 px-4">
		{variant.title}
	</h1>
	<preview class="p-4">
		<svelte:component this={component} {...variant.attr} {...props} />
	</preview>
	<block-quote>{variant.summary}</block-quote>
</card>
