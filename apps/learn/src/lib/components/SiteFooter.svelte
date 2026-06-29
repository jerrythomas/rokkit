<script lang="ts">
	import pkg from '@rokkit/ui/package.json'

	const version = pkg.version
</script>

<footer data-site-footer>
	<span data-site-footer-chip>v{version} · svelte 5</span>
	<span data-site-footer-credits>
		Rokkit · MIT licensed · built with
		<a href="https://svelte.dev" target="_blank" rel="noopener noreferrer">Svelte</a>
		+
		<a href="https://unocss.dev" target="_blank" rel="noopener noreferrer">UnoCSS</a>
	</span>
</footer>

<style>
	[data-site-footer] {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 10px 24px;
		border-top: 1px solid var(--paper-edge);
		background: var(--paper);
		font: 400 11.5px var(--font-mono);
		color: var(--ink-mute);
		letter-spacing: 0.04em;
	}

	[data-site-footer-chip] {
		padding: 2px 8px;
		border: 1px solid var(--paper-edge);
		border-radius: 999px;
		color: var(--ink-mute);
		background: var(--paper-soft);
	}

	[data-site-footer-credits] a {
		color: var(--ink-mute);
		text-decoration: none;
		border-bottom: 1px dashed var(--paper-edge);
	}

	[data-site-footer-credits] a:hover {
		color: var(--ink);
		border-bottom-color: var(--ink-faint);
	}
</style>
