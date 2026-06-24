<script lang="ts">
	import { LockMode, Card } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()
</script>

<div class="demo-grid">
	<section>
		<header>Always dark — inside any page mode</header>
		<LockMode mode="dark" class="demo-region" {...spread}>
			<div data-testid="locked-dark" class="region-inner">
				<Card class="lock-card">
					<div class="card-body">
						<span class="i-mdi:weather-night" aria-hidden="true"></span>
						<h3>Dark region</h3>
						<p>This surface is always dark. The page mode does not affect it.</p>
						<div class="swatch-row">
							<span class="swatch" title="--paper" style="background: var(--paper); border: 1px solid var(--paper-edge)"></span>
							<span class="swatch accent" title="--accent" style="background: var(--accent)"></span>
							<span class="swatch faint" title="--paper-faint" style="background: var(--paper-faint); border: 1px solid var(--paper-edge)"></span>
						</div>
					</div>
				</Card>
			</div>
		</LockMode>
	</section>

	<section>
		<header>Always light — inside any page mode</header>
		<LockMode mode="light" class="demo-region" {...spread}>
			<div data-testid="locked-light" class="region-inner">
				<Card class="lock-card">
					<div class="card-body">
						<span class="i-mdi:white-balance-sunny" aria-hidden="true"></span>
						<h3>Light region</h3>
						<p>This surface is always light. Even on a dark page, it stays bright.</p>
						<div class="swatch-row">
							<span class="swatch" title="--paper" style="background: var(--paper); border: 1px solid var(--paper-edge)"></span>
							<span class="swatch accent" title="--accent" style="background: var(--accent)"></span>
							<span class="swatch faint" title="--paper-faint" style="background: var(--paper-faint); border: 1px solid var(--paper-edge)"></span>
						</div>
					</div>
				</Card>
			</div>
		</LockMode>
	</section>
</div>

<style>
	.demo-grid {
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

	.demo-region {
		border-radius: 10px;
		overflow: hidden;
	}

	.region-inner {
		padding: 14px;
		background: var(--paper);
		min-height: 140px;
		display: flex;
		align-items: flex-start;
	}

	:global(.lock-card) {
		min-width: 220px;
		max-width: 320px;
	}

	.card-body {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.card-body span[class^='i-'] {
		font-size: 22px;
		color: var(--accent);
	}

	.card-body h3 {
		margin: 0;
		font: 600 14px var(--font-display);
		color: var(--ink);
	}

	.card-body p {
		margin: 0;
		font: 400 12.5px/1.5 var(--font-ui);
		color: var(--ink-mute);
	}

	.swatch-row {
		display: flex;
		gap: 6px;
		margin-top: 6px;
	}

	.swatch {
		display: inline-block;
		width: 20px;
		height: 20px;
		border-radius: 4px;
	}
</style>
