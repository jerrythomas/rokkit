<script lang="ts">
	import RokkitWordmark from '$lib/components/RokkitWordmark.svelte'
	import SiteNav from '$lib/components/SiteNav.svelte'
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import { vibe } from '@rokkit/states'
	import { siteStyles, siteDensities } from '$lib/data/site-styles'

	let pickerOpen = $state(false)
	const currentStyle = $derived(siteStyles.find((s) => s.id === vibe.style))

	function pickStyle(id: string) {
		vibe.style = id
		pickerOpen = false
	}
</script>

<header data-site-header>
	<a href="/" class="brand-link" title="Rokkit home" aria-label="Rokkit home">
		<RokkitWordmark height={26} />
	</a>

	<SiteNav />

	<div data-site-header-spacer></div>

	<div data-site-header-prefs>
		<span data-site-header-label>style</span>
		<button
			type="button"
			data-site-header-style-pill
			onclick={() => (pickerOpen = !pickerOpen)}
			aria-haspopup="listbox"
			aria-expanded={pickerOpen}
		>
			{#if currentStyle}
				<span data-site-header-swatch aria-hidden="true">
					{#each currentStyle.colors.slice(0, 3) as c, i (i)}
						<span style:background={c}></span>
					{/each}
				</span>
				{currentStyle.label}
			{:else}
				{vibe.style}
			{/if}
		</button>

		{#if pickerOpen}
			<div data-site-header-style-picker role="listbox">
				{#each siteStyles as s (s.id)}
					<button
						type="button"
						data-active={s.id === vibe.style ? '' : undefined}
						onclick={() => pickStyle(s.id)}
						role="option"
						aria-selected={s.id === vibe.style}
					>
						<span data-site-header-swatch aria-hidden="true">
							{#each s.colors.slice(0, 3) as c, i (i)}
								<span style:background={c}></span>
							{/each}
						</span>
						{s.label}
					</button>
				{/each}
			</div>
		{/if}

		<span data-site-header-div></span>

		<span data-site-header-label>density</span>
		<div data-site-header-trio role="group" aria-label="Density">
			{#each siteDensities as d (d.id)}
				<button
					type="button"
					data-active={d.id === vibe.density ? '' : undefined}
					title={d.label}
					aria-label={d.label}
					aria-pressed={d.id === vibe.density}
					onclick={() => (vibe.density = d.id)}
				>
					<svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
						<rect
							x="2"
							y={d.id === 'compact' ? 3 : d.id === 'cozy' ? 2.5 : 1.5}
							width="10"
							height="1.5"
							rx="0.7"
							fill="currentColor"
						/>
						<rect x="2" y="6.25" width="10" height="1.5" rx="0.7" fill="currentColor" />
						<rect
							x="2"
							y={d.id === 'compact' ? 9.5 : d.id === 'cozy' ? 10 : 11}
							width="10"
							height="1.5"
							rx="0.7"
							fill="currentColor"
						/>
					</svg>
				</button>
			{/each}
		</div>
	</div>

	<ThemeSwitcherToggle variant="triad" />
</header>

<style>
	[data-site-header] {
		display: flex;
		align-items: center;
		gap: 18px;
		padding: 12px 24px;
		border-bottom: 1px solid var(--paper-edge);
		background: var(--paper);
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.brand-link {
		display: inline-flex;
		align-items: center;
		text-decoration: none;
		color: inherit;
	}

	[data-site-header-spacer] {
		flex: 1;
	}

	[data-site-header-prefs] {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		position: relative;
	}

	[data-site-header-label] {
		font: 500 10px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	[data-site-header-style-pill] {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		border: 1px solid var(--paper-edge);
		border-radius: var(--density-radius-base);
		background: var(--paper-soft);
		font: 500 12px var(--font-ui);
		color: var(--ink);
		cursor: pointer;
		transition:
			background 120ms ease,
			border-color 120ms ease;
	}

	[data-site-header-style-pill]:hover {
		background: var(--paper-mute);
		border-color: var(--ink-faint);
	}

	[data-site-header-swatch] {
		display: inline-flex;
		gap: 1px;
		align-items: center;
	}

	[data-site-header-swatch] > span {
		width: 8px;
		height: 12px;
		border-radius: 1px;
	}

	[data-site-header-style-picker] {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		min-width: 180px;
		padding: 4px;
		background: var(--paper);
		border: 1px solid var(--paper-edge);
		border-radius: var(--density-radius-base);
		box-shadow: 0 4px 16px color-mix(in oklch, var(--ink) 14%, transparent);
		display: flex;
		flex-direction: column;
		gap: 2px;
		z-index: 60;
	}

	[data-site-header-style-picker] button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		border: 0;
		background: transparent;
		text-align: left;
		font: 400 12.5px var(--font-ui);
		color: var(--ink);
		border-radius: 3px;
		cursor: pointer;
	}

	[data-site-header-style-picker] button:hover {
		background: var(--paper-mute);
	}

	[data-site-header-style-picker] button[data-active] {
		background: var(--paper-mute);
		font-weight: 500;
	}

	[data-site-header-div] {
		width: 1px;
		height: 16px;
		background: var(--paper-edge);
		margin: 0 6px;
	}

	[data-site-header-trio] {
		display: inline-flex;
		gap: 1px;
		padding: 2px;
		background: var(--paper-soft);
		border: 1px solid var(--paper-edge);
		border-radius: var(--density-radius-base);
	}

	[data-site-header-trio] button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 22px;
		border: 0;
		background: transparent;
		color: var(--ink-soft);
		cursor: pointer;
		border-radius: 3px;
		transition:
			background 100ms ease,
			color 100ms ease;
	}

	[data-site-header-trio] button:hover {
		color: var(--ink-mute);
		background: var(--paper-mute);
	}

	[data-site-header-trio] button[data-active] {
		background: var(--ink);
		color: var(--paper);
	}
</style>
