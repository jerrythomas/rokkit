<script>
	import { Reveal, Button } from '@rokkit/ui'

	let key = $state(0)
</script>

<div class="flex flex-col items-center gap-6 p-4">
	<Button onclick={() => key++}>Replay</Button>

	{#key key}
		<Reveal direction="up" duration={600}>
			<div class="w-64 h-28 rounded-xl bg-surface-z2 border border-surface-z3 flex items-center justify-center shadow">
				<span class="text-sm font-semibold text-surface-z7">Single element — slides up</span>
			</div>
		</Reveal>
	{/key}
</div>
