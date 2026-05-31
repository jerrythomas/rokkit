<script lang="ts">
	import { FloatingAction } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	const actions = [
		{ label: 'Edit', value: 'edit', icon: 'i-glyph:edit' },
		{ label: 'Copy', value: 'copy', icon: 'i-glyph:copy' },
		{ label: 'Share', value: 'share', icon: 'i-glyph:share' }
	]

	let lastAction = $state<string | null>(null)
</script>

<div class="grid">
	<section>
		<header>Contained — bottom-right (vertical)</header>
		<div class="stage">
			<FloatingAction
				items={actions}
				contained
				position="bottom-right"
				{...spread}
				onselect={(v) => (lastAction = String(v))}
			/>
			<span class="ghost">Card / canvas surface</span>
		</div>
		<p class="hint">Last action: <code>{lastAction ?? '—'}</code></p>
	</section>

	<section>
		<header>Contained — bottom-left (horizontal)</header>
		<div class="stage">
			<FloatingAction
				items={actions}
				contained
				position="bottom-left"
				expand="horizontal"
				{...spread}
			/>
			<span class="ghost">Horizontal reveal</span>
		</div>
	</section>

	<section>
		<header>Contained — radial</header>
		<div class="stage tall">
			<FloatingAction
				items={actions}
				contained
				position="bottom-right"
				expand="radial"
				{...spread}
			/>
			<span class="ghost">Radial reveal</span>
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
		position: relative;
		min-height: 160px;
		border: 1px dashed var(--paper-edge);
		border-radius: 8px;
		background: var(--paper-soft);
		padding: 12px;
		display: flex;
		align-items: flex-start;
	}
	.stage.tall {
		min-height: 220px;
	}
	.ghost {
		font: 400 11px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.06em;
	}
	.hint {
		margin: 0;
		font: 400 12px var(--font-ui);
		color: var(--ink-mute);
	}
</style>
