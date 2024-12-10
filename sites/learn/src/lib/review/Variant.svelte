<script>
	let { variant, props, component } = $props()

	const SvelteComponent = $derived(component)
</script>

<card class="flex min-w-80 flex-col rounded-lg border border-neutral-300 shadow">
	<h1 class="flex bg-neutral-200 px-4 leading-loose text-neutral-700">
		{variant.title}
	</h1>
	<preview class="p-4">
		<SvelteComponent {...variant.attr} {...props} />
	</preview>
	<block-quote>{variant.summary}</block-quote>
</card>
