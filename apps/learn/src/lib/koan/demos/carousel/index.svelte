<script lang="ts">
	import { Carousel } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	const slides = [
		{ title: 'Welcome', body: 'Type a question on the left, watch the canvas mount.', icon: 'i-glyph:star' },
		{ title: 'Features', body: 'Field-mapped data, themable surfaces, keyboard nav.', icon: 'i-glyph:bolt' },
		{ title: 'Get Started', body: 'Pick a component from the catalog. Tweak its props.', icon: 'i-glyph:rocket' }
	]

	let current = $state(0)
	let auto = $state(1)
	let bounded = $state(0)
</script>

<div class="grid">
	<section>
		<header>Default — slide transition, looped</header>
		<div class="stage">
			<Carousel count={slides.length} bind:current {...spread}>
				{#snippet slide(index)}
					<div class="slide">
						<span class={slides[index].icon} aria-hidden="true"></span>
						<h3>{slides[index].title}</h3>
						<p>{slides[index].body}</p>
						<p class="slide-meta">Slide {index + 1} of {slides.length}</p>
					</div>
				{/snippet}
			</Carousel>
		</div>
	</section>

	<section>
		<header>Autoplay — fade, 3s interval (hover to pause)</header>
		<div class="stage">
			<Carousel
				count={slides.length}
				bind:current={auto}
				autoplay
				interval={3000}
				transition="fade"
				{...spread}
			>
				{#snippet slide(index)}
					<div class="slide soft">
						<span class={slides[index].icon} aria-hidden="true"></span>
						<h3>{slides[index].title}</h3>
					</div>
				{/snippet}
			</Carousel>
		</div>
	</section>

	<section>
		<header>Bounded — no loop, dots only</header>
		<div class="stage">
			<Carousel
				count={slides.length}
				bind:current={bounded}
				loop={false}
				showArrows={false}
				{...spread}
			>
				{#snippet slide(index)}
					<div class="slide">
						<span class={slides[index].icon} aria-hidden="true"></span>
						<h3>{slides[index].title}</h3>
						<p>Bounded mode — stops at the ends.</p>
					</div>
				{/snippet}
			</Carousel>
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
		border: 1px dashed var(--paper-edge);
		border-radius: 8px;
		background: var(--paper-soft);
		padding: 6px;
	}
	.slide {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 160px;
		padding: 24px;
		background: var(--paper);
		border-radius: 6px;
		text-align: center;
	}
	.slide.soft {
		background: var(--paper-soft);
	}
	.slide span[aria-hidden] {
		width: 28px;
		height: 28px;
		color: var(--ink-soft);
	}
	.slide h3 {
		margin: 0;
		font: 600 16px var(--font-display);
		color: var(--ink);
	}
	.slide p {
		margin: 0;
		font: 400 13px/1.5 var(--font-ui);
		color: var(--ink-mute);
		max-width: 360px;
	}
	.slide-meta {
		font: 500 11px var(--font-mono) !important;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-soft) !important;
	}
</style>
