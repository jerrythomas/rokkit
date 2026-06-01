<script lang="ts">
	import { MarkdownRenderer } from '@rokkit/ui'

	interface Props {
		markdown: string
	}

	const { markdown }: Props = $props()
</script>

<article class="guide-page">
	<MarkdownRenderer {markdown} />
</article>

<style>
	.guide-page {
		max-width: 760px;
		padding: 8px 4px;
	}
	.guide-page :global(h1) {
		font: 700 28px/1.2 var(--font-display);
		color: var(--ink);
		margin: 0 0 14px;
		letter-spacing: -0.02em;
	}
	.guide-page :global(h2) {
		font: 600 18px/1.3 var(--font-display);
		color: var(--ink);
		margin: 24px 0 10px;
		letter-spacing: -0.01em;
	}
	.guide-page :global(h3) {
		font: 600 14.5px var(--font-display);
		color: var(--ink);
		margin: 18px 0 8px;
	}
	.guide-page :global(p) {
		margin: 0 0 12px;
		font: 400 14px/1.65 var(--font-ui);
		color: var(--ink-mute);
	}
	.guide-page :global(ul),
	.guide-page :global(ol) {
		margin: 0 0 12px;
		padding-left: 20px;
		font: 400 14px/1.65 var(--font-ui);
		color: var(--ink-mute);
	}
	.guide-page :global(li) {
		margin-bottom: 4px;
	}
	.guide-page :global(blockquote) {
		margin: 0 0 12px;
		padding: 8px 14px;
		border-left: 3px solid var(--paper-edge);
		color: var(--ink-soft);
		font-style: italic;
	}
	.guide-page :global(table) {
		width: 100%;
		border-collapse: collapse;
		font: 400 13px var(--font-ui);
		margin: 0 0 12px;
	}
	.guide-page :global(th),
	.guide-page :global(td) {
		padding: 5px 10px;
		border-bottom: 1px solid var(--paper-edge);
		text-align: left;
	}
	.guide-page :global(th) {
		font: 500 11px var(--font-mono);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}
	.guide-page :global(code) {
		font: 400 12.5px var(--font-mono);
		background: var(--paper-soft);
		padding: 1px 5px;
		border-radius: 3px;
		color: var(--ink);
	}
	.guide-page :global(pre) {
		margin: 0 0 12px;
		padding: 12px 14px;
		background: var(--paper-soft);
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		overflow-x: auto;
		font: 400 12.5px/1.55 var(--font-mono);
	}
	.guide-page :global(pre code) {
		background: transparent;
		padding: 0;
		border-radius: 0;
		font-size: 12.5px;
	}
	.guide-page :global(a) {
		color: var(--accent, var(--ink));
		text-decoration: underline;
	}
	.guide-page :global(strong) {
		color: var(--ink);
		font-weight: 600;
	}
	.guide-page :global(hr) {
		margin: 24px 0;
		border: 0;
		border-top: 1px solid var(--paper-edge);
	}
</style>
