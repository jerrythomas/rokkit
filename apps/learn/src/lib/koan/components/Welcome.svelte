<script lang="ts">
	import { Input } from '@rokkit/forms'
	import { Button } from '@rokkit/ui'
	import { theme } from '$lib/stores/theme.svelte'

	let {
		query = $bindable(''),
		onsubmit
	}: {
		query?: string
		onsubmit?: (q: string) => void
	} = $props()

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault()
		if (query.trim()) onsubmit?.(query.trim())
	}

	function cycleMode() {
		const order = ['light', 'dark', 'auto'] as const
		const idx = order.indexOf(theme.mode as 'light' | 'dark' | 'auto')
		theme.setMode(order[(idx + 1) % order.length])
	}

	function modeIcon(mode: string): string {
		switch (mode) {
			case 'light': return 'i-glyph:sun'
			case 'dark': return 'i-glyph:moon'
			default: return 'i-glyph:monitor'
		}
	}

	const wordmarkSrc = $derived(
		theme.mode === 'dark' ||
		(theme.mode === 'auto' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
			? '/rokkit-dark.svg'
			: '/rokkit-light.svg'
	)
</script>

<div class="welcome">
	<div class="toolbar" aria-label="Welcome controls">
		<Button
			icon={modeIcon(theme.mode)}
			variant="default"
			style="ghost"
			size="sm"
			title="Toggle theme mode (currently {theme.mode})"
			aria-label="Toggle theme mode"
			onclick={cycleMode}
		/>
		<Button
			icon="i-glyph:share"
			variant="default"
			style="ghost"
			size="sm"
			href="https://github.com/jerrythomas/rokkit"
			target="_blank"
			title="View Rokkit on GitHub"
			aria-label="GitHub"
		/>
	</div>

	<div class="hero">
		<img class="wordmark" src={wordmarkSrc} alt="Rokkit" />

		<div class="copy">
			<h1>Build Beyond Limits</h1>
			<p class="tagline">Empowering your UI with Rokkit</p>
			<p class="lede">A data-driven Svelte 5 component library that adapts to your data, not the other way around.</p>
		</div>

		<div class="action-row">
			<svg
				class="hand-arrow"
				aria-hidden="true"
				viewBox="0 0 126 417"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
			>
				<path
					d="M121.366 412.627C121.864 412.388 122.075 411.791 121.836 411.293L117.95 403.175C117.712 402.677 117.115 402.466 116.616 402.705C116.118 402.943 115.908 403.541 116.146 404.039L119.6 411.255L112.384 414.709C111.886 414.947 111.676 415.544 111.914 416.042C112.153 416.541 112.75 416.751 113.248 416.513L121.366 412.627ZM124.934 0.724609L124.245 0.000242131C82.6328 39.6042 25.136 122.646 6.27131 205.814C-3.16459 247.414 -2.95636 289.142 13.8466 325.495C30.6618 361.875 64.0268 392.723 120.602 412.668L120.934 411.725L121.267 410.782C65.0914 390.977 32.2063 360.449 15.6621 324.656C-0.89429 288.837 -1.15482 247.595 8.22176 206.257C26.9821 123.549 84.2352 40.8402 125.623 1.44898L124.934 0.724609Z"
					fill="currentColor"
				/>
			</svg>
			<form class="input-row" onsubmit={handleSubmit}>
				<Input
					bind:value={query}
					placeholder="type here…"
					aria-label="What would you like to explore?"
				/>
				<Button icon="i-glyph:plain" variant="primary" type="submit" title="Send" aria-label="Send" />
			</form>
		</div>
	</div>
</div>

<style>
	.welcome {
		position: relative;
		min-height: 100vh;
		overflow-y: auto;
		color: var(--ink-mute);
	}
	.toolbar {
		position: absolute;
		top: 24px;
		right: 24px;
		display: flex;
		gap: 8px;
		z-index: 10;
	}
	/* Force toolbar buttons to inherit mode-reactive ink color */
	.toolbar :global([data-button]) {
		color: var(--ink-mute);
	}
	.hero {
		max-width: 720px;
		margin: 0 auto;
		padding: 80px 32px 40px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 32px;
		text-align: center;
	}
	.wordmark {
		width: clamp(280px, 50vw, 420px);
		height: auto;
	}
	.copy h1 {
		font-family: var(--font-display);
		font-size: clamp(36px, 5vw, 56px);
		font-weight: 300;
		margin: 0 0 12px;
		letter-spacing: -0.02em;
		color: var(--ink-mute);
	}
	.copy .tagline {
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 24px;
		color: var(--ink-soft);
		margin: 0 0 16px;
	}
	.copy .lede {
		font-size: 15px;
		line-height: 1.6;
		color: var(--ink-mute);
		max-width: 480px;
		margin: 0 auto;
	}
	.action-row {
		display: flex;
		align-items: center;
		gap: 16px;
		color: var(--accent);
	}
	.hand-arrow {
		display: block;
		width: 30px;
		height: 100px;
		opacity: 0.7;
		transform: translateY(-40px) rotate(-12deg);
		color: var(--accent);
	}
	.input-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.input-row :global([data-input-root]) {
		width: 320px;
	}
</style>
