<script lang="ts">
	import { Menu } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	const actions = [
		{ label: 'Copy', icon: 'i-glyph:copy' },
		{ label: 'Cut', icon: 'i-glyph:scissors' },
		{ label: 'Paste', icon: 'i-glyph:clipboard' },
		{ label: 'Delete', icon: 'i-glyph:trash-bin' }
	]

	const grouped = [
		{
			label: 'File',
			children: [
				{ label: 'New', icon: 'i-glyph:add-circle' },
				{ label: 'Open', icon: 'i-glyph:folder-open' },
				{ label: 'Save', icon: 'i-glyph:diskette' }
			]
		},
		{
			label: 'Edit',
			children: [
				{ label: 'Undo', icon: 'i-glyph:restart' },
				{ label: 'Copy', icon: 'i-glyph:copy' },
				{ label: 'Paste', icon: 'i-glyph:clipboard' }
			]
		}
	]

	let lastAction = $state<string | null>(null)
</script>

<div class="grid">
	<section>
		<header>Basic — icons + onselect</header>
		<div class="row">
			<Menu
				items={actions}
				label="Actions"
				{...spread}
				onselect={(_v, proxy) =>
					(lastAction = (proxy as unknown as { label: string }).label)}
			/>
			<p class="hint">
				Last action: <code>{lastAction ?? '—'}</code>
			</p>
		</div>
	</section>

	<section>
		<header>Grouped items</header>
		<Menu items={grouped} label="Menu" {...spread} />
	</section>

	<section>
		<header>End-aligned</header>
		<div class="row align-end">
			<Menu items={actions} label="More" align="end" {...spread} />
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
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 14px;
	}
	.row.align-end {
		justify-content: flex-end;
	}
	.hint {
		margin: 0;
		font: 400 12px var(--font-ui);
		color: var(--ink-mute);
	}
</style>
