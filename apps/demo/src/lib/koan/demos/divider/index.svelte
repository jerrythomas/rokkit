<script lang="ts">
	import { Divider } from '@rokkit/ui'
	let { ...spread }: Record<string, unknown> = $props()
</script>

<div class="grid">
	<section>
		<header>Horizontal — plain</header>
		<p>Content above</p>
		<Divider {...spread} />
		<p>Content below</p>
	</section>

	<section>
		<header>Horizontal — with label</header>
		<p>Section one</p>
		<Divider label="Section two" {...spread} />
		<p>Section three</p>
		<Divider label="or" {...spread} />
		<p>Section four</p>
	</section>

	<section>
		<header>Vertical</header>
		<div class="h-row">
			<span>Left</span>
			<Divider orientation="vertical" />
			<span>Centre</span>
			<Divider orientation="vertical" />
			<span>Right</span>
		</div>
	</section>
</div>

<style>
	.grid { display: flex; flex-direction: column; gap: 18px; }
	section { display: flex; flex-direction: column; gap: 8px; }
	header { font: 500 11px var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); }
	p { margin: 0; color: var(--ink-mute); font: 400 13px var(--font-ui); }
	.h-row { display: inline-flex; align-items: center; gap: 12px; height: 32px; }
</style>
