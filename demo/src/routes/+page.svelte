<script lang="ts">
	import RokkitWordmark from '$lib/components/RokkitWordmark.svelte'
	import { theme } from '$lib/stores/theme.svelte'

	const mode = $derived<'light' | 'dark'>(theme.mode === 'dark' ? 'dark' : 'light')
</script>

<svelte:head>
	<title>Rokkit — data-driven Svelte components</title>
</svelte:head>

<div class="landing-stub">
	<header class="nav">
		<RokkitWordmark {mode} height={28} />
		<nav>
			<a href="/app">Components</a>
			<a href="/app">Themes</a>
			<a href="/app">Docs</a>
			<a href="/app">Playground</a>
			<a href="https://github.com/jerrythomas/rokkit">GitHub ↗</a>
		</nav>
	</header>

	<main>
		<section class="hero">
			<div class="eyebrow">Landing page — under construction</div>
			<h1>Pass the data. The component does the rest.</h1>
			<p class="lede">
				A data-driven Svelte 5 component library and design system.
				The full marketing front door is being built — for now,
				jump straight into the chat-first app demo.
			</p>
			<div class="cta">
				<a href="/app" class="primary">Open the demo</a>
				<a href="/chat-lab" class="secondary">Component lab</a>
			</div>
		</section>
	</main>
</div>

<style>
	.landing-stub {
		min-height: 100vh;
		background: var(--paper);
		color: var(--ink);
		font-family: var(--font-ui);
	}

	.nav {
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 18px 48px;
		border-bottom: var(--hairline);
		background: var(--paper);
		position: sticky;
		top: 0;
		z-index: 5;
	}

	.nav nav {
		display: flex;
		gap: 24px;
		margin-left: 48px;
	}

	.nav nav a {
		font: 500 13px var(--font-ui);
		color: var(--ink-mute);
		text-decoration: none;
		white-space: nowrap;
	}

	.nav nav a:hover {
		color: var(--ink);
	}

	.hero {
		max-width: 720px;
		margin: 0 auto;
		padding: 96px 32px 64px;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 20px;
		align-items: center;
	}

	.eyebrow {
		font: 500 11px var(--font-mono);
		color: var(--accent);
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.hero h1 {
		font: 400 56px/1.05 var(--font-display);
		color: var(--ink);
		letter-spacing: -0.025em;
		margin: 0;
		max-width: 620px;
	}

	.lede {
		font: 400 17px/1.55 var(--font-ui);
		color: var(--ink-mute);
		margin: 0;
		max-width: 540px;
	}

	.cta {
		margin-top: 16px;
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.cta a {
		display: inline-flex;
		align-items: center;
		height: 40px;
		padding: 0 18px;
		border-radius: 6px;
		font: 500 14px var(--font-ui);
		text-decoration: none;
		border: var(--hairline);
	}

	.cta .primary {
		background: var(--ink);
		color: var(--paper);
		border-color: var(--ink);
	}

	.cta .primary:hover {
		background: color-mix(in oklab, var(--ink) 85%, white);
	}

	.cta .secondary {
		background: var(--paper);
		color: var(--ink);
	}

	.cta .secondary:hover {
		border-color: var(--ink-soft);
	}
</style>
