<script lang="ts">
	import { Switch } from '@rokkit/ui'
	let notifications = $state(true)
	let darkMode = $state(false)
	let { ...spread }: Record<string, unknown> = $props()
</script>

<div class="grid">
	<section>
		<header>Basic — on / off</header>
		<div class="row">
			<label>
				<Switch bind:value={notifications} {...spread} />
				<span>Notifications {notifications ? '(on)' : '(off)'}</span>
			</label>
		</div>
	</section>

	<section>
		<header>With labels visible</header>
		<div class="row">
			<Switch bind:value={darkMode} showLabels options={[{ label: 'Light', value: false }, { label: 'Dark', value: true }]} />
			<span>Mode: <code>{darkMode ? 'dark' : 'light'}</code></span>
		</div>
	</section>

	<section>
		<header>Sizes</header>
		<div class="row">
			<Switch size="sm" />
			<Switch size="md" />
			<Switch size="lg" />
		</div>
	</section>

	<section>
		<header>Disabled</header>
		<div class="row"><Switch disabled /></div>
	</section>
</div>

<style>
	.grid { display: flex; flex-direction: column; gap: 18px; }
	section { display: flex; flex-direction: column; gap: 8px; }
	header { font: 500 11px var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); }
	.row { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; font: 400 13px var(--font-ui); color: var(--ink-mute); }
	label { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
</style>
