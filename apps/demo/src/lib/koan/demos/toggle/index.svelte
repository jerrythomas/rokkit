<script lang="ts">
	import { Toggle } from '@rokkit/ui'
	let view = $state('grid')
	let align = $state('center')
	let priority = $state(2)
</script>

<div class="grid">
	<section>
		<header>Segmented group (group variant)</header>
		<Toggle
			options={[
				{ label: 'List', value: 'list' },
				{ label: 'Grid', value: 'grid' },
				{ label: 'Map', value: 'map' }
			]}
			bind:value={view}
		/>
		<p class="hint">view: <code>{view}</code></p>
	</section>

	<section>
		<header>With icons</header>
		<Toggle
			options={[
				{ label: 'Left',   value: 'left',   icon: 'i-mdi:format-align-left' },
				{ label: 'Center', value: 'center', icon: 'i-mdi:format-align-center' },
				{ label: 'Right',  value: 'right',  icon: 'i-mdi:format-align-right' }
			]}
			bind:value={align}
		/>
		<p class="hint">align: <code>{align}</code></p>
	</section>

	<section>
		<header>Sizes</header>
		<div class="row">
			<Toggle options={['1','2','3']} value="2" size="sm" />
			<Toggle options={['1','2','3']} value="2" size="md" />
			<Toggle options={['1','2','3']} value="2" size="lg" />
		</div>
	</section>

	<section>
		<header>Numeric values</header>
		<Toggle
			options={[
				{ label: 'Low',    value: 1 },
				{ label: 'Medium', value: 2 },
				{ label: 'High',   value: 3 }
			]}
			bind:value={priority}
		/>
		<p class="hint">priority: <code>{priority}</code></p>
	</section>
</div>

<style>
	.grid { display: flex; flex-direction: column; gap: 18px; }
	section { display: flex; flex-direction: column; gap: 8px; }
	header { font: 500 11px var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); }
	.row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
	.hint { margin: 0; font: 400 12px var(--font-ui); color: var(--ink-mute); }
</style>
