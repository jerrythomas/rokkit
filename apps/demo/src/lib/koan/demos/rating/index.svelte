<script lang="ts">
	import { Rating } from '@rokkit/ui'
	let stars = $state(3)
	let hearts = $state(2)
	let { ...spread }: Record<string, unknown> = $props()
</script>

<div class="grid">
	<section>
		<header>Stars (5)</header>
		<Rating bind:value={stars} max={5} {...spread} />
		<p class="hint">value: <code>{stars}</code> of 5</p>
	</section>

	<section>
		<header>Custom icons (hearts, 10)</header>
		<Rating bind:value={hearts} max={10} icons={{ filled: 'i-mdi:heart', empty: 'i-mdi:heart-outline' }} />
	</section>

	<section>
		<header>Disabled (read-only)</header>
		<Rating value={4} max={5} disabled />
	</section>
</div>

<style>
	.grid { display: flex; flex-direction: column; gap: 18px; }
	section { display: flex; flex-direction: column; gap: 8px; }
	header { font: 500 11px var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); }
	.hint { margin: 0; font: 400 12px var(--font-ui); color: var(--ink-mute); }
</style>
