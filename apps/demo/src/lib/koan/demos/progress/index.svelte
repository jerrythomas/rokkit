<script lang="ts">
	import { ProgressBar } from '@rokkit/ui'
	import { onMount } from 'svelte'

	let { ...spread }: Record<string, unknown> = $props()

	let ticker = $state(0)

	onMount(() => {
		const id = setInterval(() => {
			ticker = (ticker + 7) % 105
		}, 1000)
		return () => clearInterval(id)
	})
</script>

<div class="grid">
	<section>
		<header>Determinate — 25 / 50 / 75 / 100 %</header>
		<div class="row">
			<span class="label">25</span>
			<ProgressBar value={25} {...spread} />
		</div>
		<div class="row">
			<span class="label">50</span>
			<ProgressBar value={50} {...spread} />
		</div>
		<div class="row">
			<span class="label">75</span>
			<ProgressBar value={75} {...spread} />
		</div>
		<div class="row">
			<span class="label">100</span>
			<ProgressBar value={100} {...spread} />
		</div>
	</section>

	<section>
		<header>Custom max — value={ticker}, max=100 (live)</header>
		<div class="row">
			<span class="label">{ticker}</span>
			<ProgressBar value={Math.min(ticker, 100)} {...spread} />
		</div>
	</section>

	<section>
		<header>Indeterminate</header>
		<ProgressBar value={null} {...spread} />
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
	.row {
		display: grid;
		grid-template-columns: 36px 1fr;
		gap: 12px;
		align-items: center;
	}
	.label {
		font: 500 11px var(--font-mono);
		color: var(--ink-soft);
		text-align: right;
	}
</style>
