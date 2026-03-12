<script>
	import { Reveal, Button } from '@rokkit/ui'

	let key = $state(0)
</script>

<div class="flex flex-col items-center gap-6 p-4">
	<Button onclick={() => key++}>Replay</Button>

	{#key key}
		<Reveal direction="up" stagger={100} duration={500} class="flex gap-4">
			{#each ['Card 1', 'Card 2', 'Card 3'] as label}
				<div class="w-32 h-20 rounded-xl bg-primary-z2 border border-primary-z3 flex items-center justify-center shadow">
					<span class="text-xs font-medium text-primary-z8">{label}</span>
				</div>
			{/each}
		</Reveal>
	{/key}
</div>
