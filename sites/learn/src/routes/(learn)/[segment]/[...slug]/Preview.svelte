<script>
	let { content } = $props()
</script>

<section class="flex h-full w-full flex-col gap-4 overflow-scroll p-8">
	{#if content}
		{@const Template = content}
		<Template />
	{/if}
</section>
