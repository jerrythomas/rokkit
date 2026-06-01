<script lang="ts">
	import { MarkdownRenderer } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	const content = `# Markdown rendering

A short showcase covering the standard nodes — paragraphs, **bold**,
_italic_, \`inline code\`, [links](https://github.com/jerrythomas/rokkit),
lists, blockquotes, and fenced code blocks.

## Lists

- First bullet
- Second bullet with **emphasis**
- Third with a [link](#)

1. Numbered item one
2. Numbered item two

## Blockquote

> A blockquote — useful for asides, callouts, or quoted speech.
> Supports multi-line content and inline \`code\`.

## Code

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`
}
\`\`\`

## Table

| Component | Category | Notes |
| --- | --- | --- |
| Tabs | navigation | Five panes from one items array |
| Toggle | input | Segmented 2-5 option control |
| Stack | layout | Flex primitive with gap scale |
`
</script>

<div class="grid">
	<section>
		<header>Standard prose — headings, lists, table, fenced code</header>
		<article class="md-stage">
			<MarkdownRenderer markdown={content} {...spread} />
		</article>
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
	.md-stage {
		padding: 16px 20px;
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper);
		max-width: 720px;
	}
	.md-stage :global(h1) {
		font: 600 20px var(--font-display);
		color: var(--ink);
		margin: 0 0 12px;
	}
	.md-stage :global(h2) {
		font: 600 15px var(--font-display);
		color: var(--ink);
		margin: 18px 0 8px;
	}
	.md-stage :global(p) {
		margin: 0 0 10px;
		font: 400 13.5px/1.55 var(--font-ui);
		color: var(--ink-mute);
	}
	.md-stage :global(ul),
	.md-stage :global(ol) {
		margin: 0 0 10px;
		padding-left: 20px;
		font: 400 13.5px/1.55 var(--font-ui);
		color: var(--ink-mute);
	}
	.md-stage :global(blockquote) {
		margin: 0 0 10px;
		padding: 6px 14px;
		border-left: 3px solid var(--paper-edge);
		color: var(--ink-soft);
		font-style: italic;
	}
	.md-stage :global(table) {
		width: 100%;
		border-collapse: collapse;
		font: 400 12.5px var(--font-ui);
	}
	.md-stage :global(th),
	.md-stage :global(td) {
		padding: 4px 10px;
		border-bottom: 1px solid var(--paper-edge);
		text-align: left;
	}
	.md-stage :global(code) {
		font: 400 12.5px var(--font-mono);
		background: var(--paper-soft);
		padding: 1px 5px;
		border-radius: 3px;
		color: var(--ink);
	}
	.md-stage :global(pre code) {
		display: block;
		padding: 10px 12px;
		font-size: 12px;
		line-height: 1.6;
	}
	.md-stage :global(a) {
		color: var(--accent, var(--ink));
		text-decoration: underline;
	}
</style>
