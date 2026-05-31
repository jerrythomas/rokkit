<script lang="ts">
	import { Swatch } from '@rokkit/ui'
	const colours = ['#0ea5e9', '#f97316', '#10b981', '#ef4444', '#8b5cf6', '#eab308']
	let single = $state<string | null>(null)
	let many = $state<string[]>([])
</script>

<div class="grid">
	<section>
		<header>Single-select (square)</header>
		<Swatch options={colours} bind:value={single} shape="square" size="md" />
		<p class="hint">Selected: <code>{single ?? '—'}</code></p>
	</section>

	<section>
		<header>Multi-select (circle)</header>
		<Swatch options={colours} bind:value={many} multiple shape="circle" size="md" />
		<p class="hint">Selected: <code>{many.length ? many.join(', ') : '—'}</code></p>
	</section>

	<section>
		<header>Sizes</header>
		<div class="row">
			<Swatch options={colours.slice(0, 4)} size="sm" />
			<Swatch options={colours.slice(0, 4)} size="md" />
			<Swatch options={colours.slice(0, 4)} size="lg" />
		</div>
	</section>
</div>

<style>
	.grid { display: flex; flex-direction: column; gap: 18px; }
	section { display: flex; flex-direction: column; gap: 8px; }
	header { font: 500 11px var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); }
	.row { display: flex; flex-direction: column; gap: 12px; }
	.hint { margin: 0; font: 400 12px var(--font-ui); color: var(--ink-mute); }
</style>
