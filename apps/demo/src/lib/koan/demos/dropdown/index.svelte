<script lang="ts">
	import { Dropdown } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	const fonts = [
		{ label: 'System UI', value: 'system' },
		{ label: 'Serif', value: 'serif' },
		{ label: 'Mono', value: 'mono' }
	]

	const sizes = [
		{ label: 'Small', value: 'sm' },
		{ label: 'Medium', value: 'md' },
		{ label: 'Large', value: 'lg' },
		{ label: 'Extra Large', value: 'xl' }
	]

	const timezones = [
		{ label: 'Asia / Kolkata', value: 'IST' },
		{ label: 'Europe / London', value: 'GMT' },
		{ label: 'America / New_York', value: 'EST' },
		{ label: 'America / Los_Angeles', value: 'PST' }
	]

	let font = $state<string>('system')
	let size = $state<string | undefined>(undefined)
	let tz = $state<string | undefined>(undefined)
</script>

<div class="grid">
	<section>
		<header>Bound value — trigger reflects selection</header>
		<Dropdown items={fonts} bind:value={font} {...spread} />
		<p class="hint">Font: <code>{font}</code></p>
	</section>

	<section>
		<header>Placeholder — no initial value</header>
		<Dropdown items={sizes} bind:value={size} placeholder="Select a size" {...spread} />
		<p class="hint">Size: <code>{size ?? '—'}</code></p>
	</section>

	<section>
		<header>With icon</header>
		<Dropdown
			items={timezones}
			bind:value={tz}
			placeholder="Select a timezone"
			icon="i-mdi:clock-outline"
			{...spread}
		/>
		<p class="hint">Timezone: <code>{tz ?? '—'}</code></p>
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
