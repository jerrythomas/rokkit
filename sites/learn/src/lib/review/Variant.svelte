<script>
	export let variant
	export let props
	export let component
</script>

<card
	class="min-w-80 flex flex-col border border-neutral-300 rounded-lg shadow"
>
	<h1 class="flex bg-neutral-200 px-4 leading-loose text-neutral-700">
		{variant.title}
	</h1>
	<preview class="p-4">
		<svelte:component this={component} {...variant.attr} {...props} />
	</preview>
	<block-quote>{variant.summary}</block-quote>
</card>
