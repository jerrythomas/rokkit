<script>
	import { Reveal, Button } from '@rokkit/ui'

	let key = $state(0)
</script>

<div class="flex flex-col items-center gap-6 p-4">
	<Button onclick={() => key++}>Replay</Button>

	{#key key}
		<Reveal direction="up" stagger={100} duration={500} class="flex gap-4">
			{#each ['Card 1', 'Card 2', 'Card 3'] as label}
				<div
					class="bg-primary-z2 border-primary-z3 flex h-20 w-32 items-center justify-center rounded-xl border shadow"
				>
					<span class="text-primary-z8 text-xs font-medium">{label}</span>
				</div>
			{/each}
		</Reveal>
	{/key}
</div>
