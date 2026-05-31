<script lang="ts">
	import { Grid } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	const apps = [
		{ label: 'Dashboard', icon: 'i-glyph:home', value: 'dashboard' },
		{ label: 'Reports', icon: 'i-glyph:chart', value: 'reports' },
		{ label: 'Inbox', icon: 'i-glyph:letter', value: 'inbox' },
		{ label: 'Calendar', icon: 'i-glyph:calendar', value: 'calendar' },
		{ label: 'Files', icon: 'i-glyph:folder-open', value: 'files' },
		{ label: 'Settings', icon: 'i-glyph:settings', value: 'settings' }
	]

	const tools = [
		{ label: 'Pen', icon: 'i-glyph:pen' },
		{ label: 'Eraser', icon: 'i-glyph:eraser' },
		{ label: 'Cursor', icon: 'i-glyph:cursor' },
		{ label: 'Zoom', icon: 'i-glyph:zoom-in' }
	]

	let active = $state<string | null>(null)
</script>

<div class="grid">
	<section>
		<header>Default — selectable tiles</header>
		<Grid items={apps} bind:value={active} {...spread} />
		<p class="hint">Selected: <code>{active ?? '—'}</code></p>
	</section>

	<section>
		<header>Compact — minSize=80px, size=sm</header>
		<Grid items={tools} minSize="80px" size="sm" {...spread} />
	</section>

	<section>
		<header>Prominent — minSize=160px, size=lg</header>
		<Grid items={tools} minSize="160px" size="lg" {...spread} />
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
