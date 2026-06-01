<script lang="ts">
	import { Tilt, Shine, Reveal, Card } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()
</script>

<div class="grid">
	<section>
		<header>Tilt — hover the card</header>
		<div class="stage">
			<Tilt maxRotation={12} setBrightness {...spread}>
				<Card class="effect-card">
					<h3>Hover me</h3>
					<p>The card tilts toward the cursor and brightens slightly with vertical position.</p>
				</Card>
			</Tilt>
		</div>
	</section>

	<section>
		<header>Shine — specular highlight follows the pointer</header>
		<div class="stage">
			<Shine {...spread}>
				<Card class="effect-card glossy">
					<h3>Glossy surface</h3>
					<p>Hover for a specular highlight that tracks your cursor across the card.</p>
				</Card>
			</Shine>
		</div>
	</section>

	<section>
		<header>Reveal — three cards with stagger</header>
		<div class="stage">
			<Reveal direction="up" stagger={120} once={false} {...spread}>
				<Card class="effect-card">
					<h3>Reveals first</h3>
				</Card>
				<Card class="effect-card">
					<h3>… then this one</h3>
				</Card>
				<Card class="effect-card">
					<h3>… then this one</h3>
				</Card>
			</Reveal>
		</div>
	</section>

	<section>
		<header>Composed — Reveal → Tilt → Shine</header>
		<div class="stage">
			<Reveal direction="up" once={false}>
				<Tilt maxRotation={8}>
					<Shine>
						<Card class="effect-card">
							<h3>Three effects, one card</h3>
							<p>Reveals on scroll, tilts on hover, catches a specular highlight.</p>
						</Card>
					</Shine>
				</Tilt>
			</Reveal>
		</div>
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
	.stage {
		display: flex;
		gap: 14px;
		padding: 14px;
		border: 1px dashed var(--paper-edge);
		border-radius: 8px;
		background: var(--paper-soft);
		min-height: 140px;
	}
	.stage :global(.effect-card) {
		min-width: 200px;
		max-width: 280px;
	}
	.stage :global(.effect-card h3) {
		margin: 0 0 6px;
		font: 600 14px var(--font-display);
		color: var(--ink);
	}
	.stage :global(.effect-card p) {
		margin: 0;
		font: 400 12.5px/1.5 var(--font-ui);
		color: var(--ink-mute);
	}
	.stage :global(.glossy) {
		background: linear-gradient(135deg, var(--paper), var(--paper-soft));
	}
</style>
