<script lang="ts">
	import type { Snippet } from 'svelte'

	interface StyleOption {
		id: string
		label: string
		/** 3-swatch preview (paper / ink / accent) */
		colors: string[]
	}

	interface ChatChromeProps {
		/** Current style id (e.g. "zen-sumi") — bindable */
		style?: string
		/** Current density id ("compact" | "cozy" | "comfortable") — bindable */
		density?: string
		/** Current mode ("light" | "dark") — bindable */
		mode?: 'light' | 'dark'
		/** Available styles for the picker. Empty disables the picker. */
		styles?: StyleOption[]
		/** Available density options (defaults to compact/cozy/comfortable) */
		densities?: Array<{ id: string; label: string }>
		/** Brand block snippet (wordmark / mark) */
		brand?: Snippet
		/** Breadcrumb snippet rendered right of the brand */
		crumb?: Snippet
		/** Additional right-side action buttons (before the mode toggle) */
		actions?: Snippet
		/** Hide the macOS traffic-light decoration */
		hideTrafficLights?: boolean
	}

	let {
		style = $bindable('zen-sumi'),
		density = $bindable('cozy'),
		mode = $bindable('light'),
		styles = [],
		densities = [
			{ id: 'compact', label: 'Compact' },
			{ id: 'cozy', label: 'Cozy' },
			{ id: 'comfortable', label: 'Comfortable' }
		],
		brand,
		crumb,
		actions,
		hideTrafficLights = false
	}: ChatChromeProps = $props()

	let pickerOpen = $state(false)

	const currentStyle = $derived(styles.find((s) => s.id === style))

	function pickStyle(id: string) {
		style = id
		pickerOpen = false
	}

	function toggleMode() {
		mode = mode === 'dark' ? 'light' : 'dark'
	}
</script>

<header data-chat-chrome>
	{#if !hideTrafficLights}
		<div data-chat-chrome-traffic aria-hidden="true">
			<span></span><span></span><span></span>
		</div>
	{/if}

	{#if brand}
		<div data-chat-chrome-brand>{@render brand()}</div>
	{/if}

	{#if crumb}
		<div data-chat-chrome-crumb>
			<span data-sep>/</span>
			{@render crumb()}
		</div>
	{/if}

	<div data-chat-chrome-spacer></div>

	<div data-chat-chrome-prefs>
		{#if styles.length}
			<span data-chat-chrome-label>style</span>
			<button
				type="button"
				data-chat-chrome-style-pill
				onclick={() => (pickerOpen = !pickerOpen)}
				aria-haspopup="listbox"
				aria-expanded={pickerOpen}
			>
				{#if currentStyle}
					<span data-chat-chrome-swatch aria-hidden="true">
						{#each currentStyle.colors.slice(0, 3) as c, i (i)}
							<span style:background={c}></span>
						{/each}
					</span>
					{currentStyle.label}
				{:else}
					{style}
				{/if}
			</button>

			{#if pickerOpen}
				<div data-chat-chrome-style-picker role="listbox">
					{#each styles as s (s.id)}
						<button
							type="button"
							data-active={s.id === style ? '' : undefined}
							onclick={() => pickStyle(s.id)}
							role="option"
							aria-selected={s.id === style}
						>
							<span data-chat-chrome-swatch aria-hidden="true">
								{#each s.colors.slice(0, 3) as c, i (i)}
									<span style:background={c}></span>
								{/each}
							</span>
							{s.label}
						</button>
					{/each}
				</div>
			{/if}

			<span data-chat-chrome-div></span>
		{/if}

		<span data-chat-chrome-label>density</span>
		<div data-chat-chrome-trio role="group" aria-label="Density">
			{#each densities as d (d.id)}
				<button
					type="button"
					data-active={d.id === density ? '' : undefined}
					title={d.label}
					aria-label={d.label}
					aria-pressed={d.id === density}
					onclick={() => (density = d.id)}
				>
					<svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
						<rect x="2" y={d.id === 'compact' ? 3 : d.id === 'cozy' ? 2.5 : 1.5} width="10" height="1.5" rx="0.7" fill="currentColor"/>
						<rect x="2" y="6.25" width="10" height="1.5" rx="0.7" fill="currentColor"/>
						<rect x="2" y={d.id === 'compact' ? 9.5 : d.id === 'cozy' ? 10 : 11} width="10" height="1.5" rx="0.7" fill="currentColor"/>
					</svg>
				</button>
			{/each}
		</div>
	</div>

	{#if actions}
		<div data-chat-chrome-actions>{@render actions()}</div>
	{/if}

	<button
		type="button"
		data-chat-chrome-mode-toggle
		title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
		aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
		onclick={toggleMode}
	>
		{#if mode === 'dark'}
			<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true">
				<circle cx="7" cy="7" r="2.4"/>
				<path d="M7 1 v1.5 M7 11.5 v1.5 M1 7 h1.5 M11.5 7 h1.5 M2.7 2.7 l1 1 M10.3 10.3 l1 1 M2.7 11.3 l1 -1 M10.3 3.7 l1 -1"/>
			</svg>
		{:else}
			<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" aria-hidden="true">
				<path d="M11.5 8.5 A 5 5 0 1 1 5.5 2.5 A 4 4 0 0 0 11.5 8.5 Z"/>
			</svg>
		{/if}
	</button>
</header>
