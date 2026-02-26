<script>
	// @ts-nocheck
	import { Carousel } from '@rokkit/ui'

	let transition = $state('slide')
	let current = $state(0)

	const colors = ['bg-red-500/20', 'bg-blue-500/20', 'bg-green-500/20', 'bg-amber-500/20']
</script>

<div class="mb-4 flex gap-2">
	{#each ['slide', 'fade', 'none'] as t}
		<button
			class="button"
			class:is-primary={transition === t}
			onclick={() => { transition = t; current = 0 }}
		>
			{t}
		</button>
	{/each}
</div>

<div class="w-full max-w-lg">
	<Carousel count={colors.length} {transition} bind:current>
		{#snippet slide(index)}
			<div class="flex h-48 items-center justify-center {colors[index]}">
				<p class="text-2xl font-bold">Slide {index + 1}</p>
			</div>
		{/snippet}
	</Carousel>
</div>

<p class="text-surface-z6 mt-4 text-sm">
	Current transition: <strong>{transition}</strong>
</p>
