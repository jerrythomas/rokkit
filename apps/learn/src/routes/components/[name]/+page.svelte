<script lang="ts">
	import { Code, MarkdownRenderer } from '@rokkit/ui'
	import SvelteFence from '$lib/components/fences/SvelteFence.svelte'
	import TsFence from '$lib/components/fences/TsFence.svelte'
	import JsFence from '$lib/components/fences/JsFence.svelte'
	import CssFence from '$lib/components/fences/CssFence.svelte'

	const { data } = $props()
	const c = $derived(data.component)

	/*
	 * MarkdownRenderer renders a fenced block as plain sanitised HTML unless a plugin claims
	 * the language — highlighting lives in `Code` (shiki), which it does not reach for. So
	 * every fence in a demo's docs.md rendered unhighlighted.
	 *
	 * Registering these routes each fence through `Code` instead, which also brings the copy
	 * button with it.
	 */
	const fences = [
		{ language: 'svelte', component: SvelteFence },
		{ language: 'ts', component: TsFence },
		{ language: 'js', component: JsFence },
		{ language: 'css', component: CssFence }
	]
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
			<MarkdownRenderer markdown={c.docs} plugins={fences} />
		</div>
	{/if}

	<!-- The meta already carries curated examples and a documented API surface. This page
	     rendered neither, so the richest part of a demo's metadata was invisible here. -->
	{#if c.snippets?.length}
		<section class="block">
			<h2>Examples</h2>
			{#each c.snippets as snippet (snippet.id)}
				<figure>
					<figcaption>{snippet.title}</figcaption>
					<Code code={snippet.code} language={snippet.lang ?? 'svelte'} theme="dark" />
				</figure>
			{/each}
		</section>
	{/if}

	{#if c.api?.props?.length}
		<section class="block">
			<h2>Props</h2>
			<table>
				<thead>
					<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
				</thead>
				<tbody>
					{#each c.api.props as prop (prop.name)}
						<tr>
							<td><code>{prop.name}</code></td>
							<td><code class="type">{prop.type}</code></td>
							<td>{prop.default ?? '—'}</td>
							<td>{prop.desc ?? ''}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>
	{/if}

	{#if c.api?.attrs?.length}
		<section class="block">
			<h2>Styling hooks</h2>
			<p class="hint">
				Every visual hook is a data-attribute. Match the theme's specificity when you
				override — styles scope their rules under <code>[data-style]</code>.
			</p>
			<table>
				<thead>
					<tr><th>Selector</th><th>Description</th></tr>
				</thead>
				<tbody>
					{#each c.api.attrs as attr (attr.selector)}
						<tr>
							<td><code>{attr.selector}</code></td>
							<td>{attr.desc ?? ''}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>
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
		color: var(--ink-mute);
		margin-bottom: 1.5rem;
	}
	.crumb a {
		color: var(--ink-mute);
		text-decoration: none;
	}
	.crumb a:hover {
		color: var(--ink);
	}
	.crumb span {
		margin: 0 0.25rem;
		color: var(--ink-mute);
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
		color: var(--ink);
		text-decoration: underline;
	}
	.block {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--paper-edge);
	}
	.block h2 {
		font: 600 1.25rem/1.2 var(--font-heading, serif);
		color: var(--ink);
		margin: 0 0 1rem;
	}
	.hint {
		font-size: 0.875rem;
		color: var(--ink-mute);
		margin: 0 0 1rem;
	}
	figure {
		margin: 0 0 1.5rem;
	}
	figcaption {
		font: 500 0.8125rem/1.4 var(--font-mono, monospace);
		color: var(--ink-mute);
		margin-bottom: 0.5rem;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}
	th {
		text-align: left;
		font: 600 0.75rem/1.4 var(--font-mono, monospace);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--ink-mute);
		padding: 0.5rem 0.75rem 0.5rem 0;
		border-bottom: 1px solid var(--paper-edge);
	}
	td {
		vertical-align: top;
		padding: 0.5rem 0.75rem 0.5rem 0;
		border-bottom: 1px solid var(--paper-edge);
		color: var(--ink);
	}
	td code {
		font-family: var(--font-mono, monospace);
		font-size: 0.75rem;
		color: var(--ink);
	}
	td code.type {
		color: var(--ink-mute);
	}
</style>
