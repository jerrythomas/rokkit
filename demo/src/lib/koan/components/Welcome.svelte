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
			<span class="hand-arrow" aria-hidden="true"></span>
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
		color: var(--color-ink-z1);
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
		color: var(--color-ink-z2);
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
		color: var(--color-ink-z1);
	}
	.copy .tagline {
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 24px;
		color: var(--color-ink-z3);
		margin: 0 0 16px;
	}
	.copy .lede {
		font-size: 15px;
		line-height: 1.6;
		color: var(--color-ink-z2);
		max-width: 480px;
		margin: 0 auto;
	}
	.action-row {
		display: flex;
		align-items: center;
		gap: 16px;
		color: var(--color-accent-z5);
	}
	.hand-arrow {
		display: block;
		width: 30px;
		height: 100px;
		opacity: 0.7;
		transform: translateY(-80px) rotate(-12deg);
		background: var(--color-accent-z5);
		-webkit-mask: url(/arrow.svg) no-repeat center / contain;
		        mask: url(/arrow.svg) no-repeat center / contain;
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
