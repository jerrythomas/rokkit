<script>
	import { Reveal, Button } from '@rokkit/ui'

	let key = $state(0)
</script>

<div class="flex flex-col items-center gap-6 p-4">
	<Button onclick={() => key++}>Replay</Button>

	{#key key}
		<Reveal direction="up" duration={600}>
			<div
				class="bg-surface-z2 border-surface-z3 flex h-28 w-64 items-center justify-center rounded-xl border shadow"
			>
				<span class="text-surface-z7 text-sm font-semibold">Single element — slides up</span>
			</div>
		</Reveal>
	{/key}
</div>
