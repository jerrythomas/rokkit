<script lang="ts">
	import { Range } from '@rokkit/ui'
	let volume = $state(35)
	let lo = $state(20)
	let hi = $state(80)
	let { ...spread }: Record<string, unknown> = $props()
</script>

<div class="grid">
	<section>
		<header>Single value</header>
		<Range bind:value={volume} min={0} max={100} {...spread} />
		<p class="hint">value: <code>{volume}</code></p>
	</section>

	<section>
		<header>With ticks</header>
		<Range bind:value={volume} min={0} max={100} step={10} ticks={11} labelSkip={2} />
	</section>

	<section>
		<header>Range mode (lower + upper)</header>
		<Range range bind:lower={lo} bind:upper={hi} min={0} max={100} />
		<p class="hint">lower: <code>{lo}</code>, upper: <code>{hi}</code></p>
	</section>

	<section>
		<header>Disabled</header>
		<Range value={50} min={0} max={100} disabled />
	</section>
</div>

<style>
	.grid { display: flex; flex-direction: column; gap: 18px; }
	section { display: flex; flex-direction: column; gap: 8px; }
	header { font: 500 11px var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); }
	.hint { margin: 0; font: 400 12px var(--font-ui); color: var(--ink-mute); }
</style>
