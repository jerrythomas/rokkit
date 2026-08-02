<script lang="ts">
	import { ResponsiveGrid } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	const cards = [
		{ id: 'a', title: 'Sessions', value: '12.4k' },
		{ id: 'b', title: 'Bounce', value: '38%' },
		{ id: 'c', title: 'Signups', value: '284' },
		{ id: 'd', title: 'Revenue', value: '$9.1k' },
		{ id: 'e', title: 'Latency', value: '142ms' },
		{ id: 'f', title: 'Errors', value: '0.3%' }
	]

	const swatches = ['#e2725b', '#f0a202', '#4f772d', '#2d6a8e', '#6d597a', '#b56576', '#355070', '#c9ada7']
</script>

<div class="grid">
	<section>
		<header>Auto-fit — minWidth=200px, gap=1rem</header>
		<p class="hint">Resize the canvas: columns reflow to fit whatever width is available.</p>
		<ResponsiveGrid minWidth="200px" gap="1rem" {...spread}>
			{#each cards as card (card.id)}
				<div class="tile">
					<span class="tile-label">{card.title}</span>
					<strong class="tile-value">{card.value}</strong>
				</div>
			{/each}
		</ResponsiveGrid>
	</section>

	<section>
		<header>Capped — maxCols=3</header>
		<p class="hint">Same auto-fit rule, but never more than three columns however wide it gets.</p>
		<ResponsiveGrid minWidth="140px" gap="0.75rem" maxCols={3} {...spread}>
			{#each cards as card (card.id)}
				<div class="tile">
					<span class="tile-label">{card.title}</span>
					<strong class="tile-value">{card.value}</strong>
				</div>
			{/each}
		</ResponsiveGrid>
	</section>

	<section>
		<header>Dense gallery — minWidth=90px, gap=0.5rem</header>
		<ResponsiveGrid minWidth="90px" gap="0.5rem" {...spread}>
			{#each swatches as color, i (color)}
				<div class="swatch" style:background={color}>
					<span class="swatch-index">{i + 1}</span>
				</div>
			{/each}
		</ResponsiveGrid>
	</section>
</div>

<style>
	.grid {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	header {
		font: 500 11px var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-soft);
	}
	.hint {
		margin: 0;
		font: 400 12px var(--font-ui);
		color: var(--ink-mute);
	}
	.tile {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 12px 14px;
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		background: var(--paper);
	}
	.tile-label {
		font: 500 11px var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--ink-soft);
	}
	.tile-value {
		font: 600 18px var(--font-display);
		color: var(--ink);
	}
	.swatch {
		position: relative;
		aspect-ratio: 1;
		border-radius: 6px;
		border: 1px solid var(--paper-edge);
	}
	.swatch-index {
		position: absolute;
		right: 6px;
		bottom: 4px;
		font: 500 10px var(--font-mono);
		color: var(--paper);
		mix-blend-mode: difference;
	}
</style>
