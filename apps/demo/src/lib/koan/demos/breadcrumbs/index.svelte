<script lang="ts">
	import { BreadCrumbs } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	const trail = [
		{ label: 'Home', href: '/', icon: 'i-glyph:home' },
		{ label: 'Products', href: '/products', icon: 'i-glyph:box' },
		{ label: 'Electronics', href: '/products/electronics' },
		{ label: 'Laptops' }
	]

	const settings = [
		{ label: 'Settings', href: '/settings', icon: 'i-glyph:settings' },
		{ label: 'Theme', href: '/settings/theme' }
	]

	let lastClicked = $state<string | null>(null)
</script>

<div class="grid">
	<section>
		<header>Default — chevron separator</header>
		<BreadCrumbs
			items={trail}
			{...spread}
			onclick={(_v, item) => (lastClicked = (item as { label: string }).label)}
		/>
		<p class="hint">Last clicked: <code>{lastClicked ?? '—'}</code></p>
	</section>

	<section>
		<header>Custom separator — slash</header>
		<BreadCrumbs items={trail} {...spread} icons={{ separator: 'i-mdi:slash-forward' }} />
	</section>

	<section>
		<header>Shorter trail</header>
		<BreadCrumbs items={settings} {...spread} />
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
</style>
