<script lang="ts">
	import { MarkdownRenderer } from '@rokkit/ui'
	const { data } = $props()
	const c = $derived(data.component)
</script>

<article class="component-doc">
	<nav class="crumb"><a href="/components">Components</a> <span>/</span> {c.title}</nav>

	<header>
		<h1>{c.title}</h1>
		<p class="lead">{c.description}</p>
		<a class="demo-link" href="/app">Try it in the interactive catalog →</a>
	</header>

	{#if c.docs}
		<div class="docs">
			<MarkdownRenderer markdown={c.docs} />
		</div>
	{/if}
</article>

<style>
	.component-doc {
		max-width: 52rem;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 4rem;
	}
	.crumb {
		font: 400 0.8125rem/1 var(--font-mono, monospace);
		color: var(--ink-soft);
		margin-bottom: 1.5rem;
	}
	.crumb a {
		color: var(--ink-mute);
		text-decoration: none;
	}
	.crumb a:hover {
		color: var(--primary);
	}
	.crumb span {
		margin: 0 0.25rem;
		color: var(--ink-faint);
	}
	header {
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--paper-edge);
	}
	h1 {
		font: 600 2rem/1.1 var(--font-heading, serif);
		color: var(--ink);
		margin: 0 0 0.5rem;
	}
	.lead {
		font-size: 1.0625rem;
		line-height: 1.5;
		color: var(--ink-mute);
		margin: 0 0 1rem;
	}
	.demo-link {
		display: inline-block;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--primary);
		text-decoration: none;
	}
	.demo-link:hover {
		text-decoration: underline;
	}
</style>
