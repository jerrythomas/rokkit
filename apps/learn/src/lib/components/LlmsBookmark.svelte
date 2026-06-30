<script lang="ts">
	// Floating bottom-right "bookmark" that links to the LLM-ready spec for the
	// current docs page. Rendered only on docs surfaces (the component Docs tab
	// and guide pages) — not on every view.
	let {
		href,
		label = 'llms.txt',
		title = 'LLM-ready spec for this page'
	}: { href: string; label?: string; title?: string } = $props()
</script>

<a {href} target="_blank" rel="noopener noreferrer" {title} data-llms-bookmark>
	<span class="i-mdi:bookmark-outline" aria-hidden="true"></span>
	<span>{label}</span>
</a>

<style>
	[data-llms-bookmark] {
		position: fixed;
		right: 1.25rem;
		bottom: 1.25rem;
		z-index: 30;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		font: 500 11px var(--font-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-mute);
		background: var(--paper-soft);
		border: 1px solid var(--paper-edge);
		border-radius: 999px;
		box-shadow: 0 2px 12px rgb(0 0 0 / 0.12);
		text-decoration: none;
		transition:
			color 120ms ease,
			border-color 120ms ease,
			background 120ms ease,
			transform 120ms ease;
	}
	[data-llms-bookmark]:hover {
		color: var(--ink);
		border-color: var(--paper-edge-hover);
		background: var(--paper);
		transform: translateY(-1px);
	}
	[data-llms-bookmark] [class^='i-'] {
		width: 13px;
		height: 13px;
	}
</style>
