<script lang="ts">
	import { Toolbar, ToolbarGroup } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	const formatting = [
		{ label: 'Bold', icon: 'i-glyph:text-bold' },
		{ label: 'Italic', icon: 'i-glyph:text-italic' },
		{ label: 'Underline', icon: 'i-glyph:text-underline' },
		{ itemType: 'separator' },
		{ label: 'Align Left', icon: 'i-glyph:align-left' },
		{ label: 'Align Center', icon: 'i-glyph:align-center' },
		{ label: 'Align Right', icon: 'i-glyph:align-right' }
	]

	const fileBar = [
		{ label: 'New', icon: 'i-glyph:add-circle' },
		{ label: 'Open', icon: 'i-glyph:folder-open' },
		{ itemType: 'separator' },
		{ label: 'Save', icon: 'i-glyph:diskette' },
		{ itemType: 'spacer' },
		{ label: 'Settings', icon: 'i-glyph:settings' }
	]

	const verticalTools = [
		{ label: 'Cursor', icon: 'i-glyph:cursor' },
		{ label: 'Pen', icon: 'i-glyph:pen' },
		{ label: 'Eraser', icon: 'i-glyph:eraser' },
		{ itemType: 'separator' },
		{ label: 'Zoom', icon: 'i-glyph:zoom-in' }
	]

	let lastAction = $state<string | null>(null)
</script>

<div class="grid">
	<section>
		<header>Formatting bar — separator between groups</header>
		<Toolbar
			items={formatting}
			{...spread}
			onclick={(item) => (lastAction = (item as { label: string }).label)}
		/>
		<p class="hint">Last action: <code>{lastAction ?? '—'}</code></p>
	</section>

	<section>
		<header>File bar — separator + spacer</header>
		<Toolbar items={fileBar} {...spread} />
	</section>

	<section>
		<header>Vertical — compact</header>
		<div class="vertical-wrap">
			<Toolbar items={verticalTools} position="left" compact width="fit" {...spread} />
		</div>
	</section>

	<section>
		<header>ToolbarGroup — semantic grouping (role="group")</header>
		<div class="group-row">
			<ToolbarGroup label="History">
				<button class="tool-btn" type="button"
					><span class="i-glyph:undo" aria-hidden="true"></span> Undo</button
				>
				<button class="tool-btn" type="button"
					><span class="i-glyph:redo" aria-hidden="true"></span> Redo</button
				>
			</ToolbarGroup>
			<ToolbarGroup label="Zoom" gap="md">
				<button class="tool-btn" type="button" aria-label="Zoom out"
					><span class="i-glyph:zoom-out" aria-hidden="true"></span></button
				>
				<button class="tool-btn" type="button" aria-label="Zoom in"
					><span class="i-glyph:zoom-in" aria-hidden="true"></span></button
				>
			</ToolbarGroup>
		</div>
		<p class="hint">
			Each <code>ToolbarGroup</code> is an <code>aria-label</code>ed <code>role="group"</code>
			container with a <code>gap</code> scale.
		</p>
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
	.vertical-wrap {
		display: flex;
	}
	.group-row {
		display: flex;
		gap: 16px;
		align-items: center;
		flex-wrap: wrap;
	}
	.tool-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		background: var(--paper);
		color: var(--ink);
		font: 500 12px var(--font-ui);
		cursor: pointer;
	}
</style>
