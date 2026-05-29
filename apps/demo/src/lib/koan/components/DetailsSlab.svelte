<script lang="ts">
	/**
	 * 3-tab slab in the chat-left composer: Tweaks | API | Source.
	 *
	 * - **Tweaks** — reuses the existing `<Tweaks/>` wrapper (FormRenderer-driven).
	 *   Only enabled when the active demo declares `props`.
	 * - **API** — props / events / data-attribute tables from `meta.api`.
	 *   Disabled (with a hint) when the demo hasn't declared an API yet.
	 * - **Source** — `meta.snippets` rendered as `<CodeBlock/>` cards with
	 *   copy buttons.
	 *
	 * The tab strip self-selects the first ENABLED tab when the active
	 * demo changes, so navigating between a demo that has tweaks and one
	 * that only has API doesn't leave the slab on a disabled tab.
	 */
	import { CodeBlock } from '@rokkit/ui'
	import Tweaks from './Tweaks.svelte'
	import type { DemoApi, DemoPropSchema, DemoSnippet } from '../types'

	type TabId = 'tweaks' | 'api' | 'source'

	interface Props {
		demoId: string
		propsSchema?: Record<string, DemoPropSchema>
		tweakValues?: Record<string, unknown>
		api?: DemoApi
		snippets?: DemoSnippet[]
		onTweakChange?: (name: string, value: unknown) => void
		onTweakReset?: () => void
		onTweakCopy?: () => void
	}

	const {
		demoId,
		propsSchema,
		tweakValues = {},
		api,
		snippets,
		onTweakChange,
		onTweakReset,
		onTweakCopy
	}: Props = $props()

	const tabs: Array<{ id: TabId; label: string; enabled: boolean; hint: string }> = $derived([
		{
			id: 'tweaks',
			label: 'Tweaks',
			enabled: Boolean(propsSchema && Object.keys(propsSchema).length > 0),
			hint: 'Live prop editor'
		},
		{
			id: 'api',
			label: 'API',
			enabled: Boolean(api && api.props.length > 0),
			hint: 'Props · events · data-attributes'
		},
		{
			id: 'source',
			label: 'Source',
			enabled: Boolean(snippets && snippets.length > 0),
			hint: 'Copyable examples'
		}
	])

	let activeTab = $state<TabId>('tweaks')

	// When the demo changes, reset to the first enabled tab so the slab
	// never opens on a disabled tab.
	$effect(() => {
		void demoId
		const first = tabs.find((t) => t.enabled)
		if (first) activeTab = first.id
	})

	function selectTab(id: TabId, enabled: boolean) {
		if (enabled) activeTab = id
	}
</script>

<div data-details-slab role="group" aria-label="Component details">
	<header data-details-tabs role="tablist" aria-label="Details sections">
		{#each tabs as tab (tab.id)}
			<button
				type="button"
				role="tab"
				data-details-tab
				data-active={activeTab === tab.id ? '' : undefined}
				disabled={!tab.enabled}
				aria-selected={activeTab === tab.id}
				aria-disabled={!tab.enabled}
				title={tab.enabled ? tab.hint : `${tab.label} not available for this demo yet`}
				onclick={() => selectTab(tab.id, tab.enabled)}
			>
				{tab.label}
			</button>
		{/each}
	</header>

	<div data-details-body>
		{#if activeTab === 'tweaks'}
			{#if propsSchema}
				<Tweaks
					schema={propsSchema}
					values={tweakValues}
					onchange={onTweakChange}
					onreset={onTweakReset}
					oncopy={onTweakCopy}
				/>
			{:else}
				<p data-details-empty>No tweakable props declared for this demo yet.</p>
			{/if}
		{:else if activeTab === 'api'}
			{#if api}
				<section data-api-section>
					<h4>Props</h4>
					<table data-api-table>
						<thead>
							<tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr>
						</thead>
						<tbody>
							{#each api.props as p (p.name)}
								<tr>
									<td><code>{p.name}{p.bindable ? ' *' : ''}</code></td>
									<td><code>{p.type}</code></td>
									<td><code>{p.default ?? '—'}</code></td>
									<td>{p.desc}</td>
								</tr>
							{/each}
						</tbody>
					</table>
					{#if api.props.some((p) => p.bindable)}
						<p data-api-foot><code>*</code> bindable</p>
					{/if}
				</section>

				{#if api.events && api.events.length}
					<section data-api-section>
						<h4>Events</h4>
						<table data-api-table>
							<thead>
								<tr><th>Name</th><th>Signature</th><th>Description</th></tr>
							</thead>
							<tbody>
								{#each api.events as e (e.name)}
									<tr>
										<td><code>{e.name}</code></td>
										<td><code>{e.signature}</code></td>
										<td>{e.desc}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</section>
				{/if}

				{#if api.attrs && api.attrs.length}
					<section data-api-section>
						<h4>Data attributes</h4>
						<ul data-api-attrs>
							{#each api.attrs as a (a.selector)}
								<li>
									<code>{a.selector}</code>
									<span>{a.desc}</span>
								</li>
							{/each}
						</ul>
					</section>
				{/if}
			{:else}
				<p data-details-empty>
					No API reference for this demo yet.
				</p>
			{/if}
		{:else if activeTab === 'source'}
			{#if snippets && snippets.length}
				<div data-source-list>
					{#each snippets as snip (snip.id)}
						<CodeBlock
							code={snip.code}
							filename={snip.title}
							language={snip.lang ?? 'svelte'}
							allowCopy
						/>
					{/each}
				</div>
			{:else}
				<p data-details-empty>No source examples for this demo yet.</p>
			{/if}
		{/if}
	</div>
</div>

<style>
	[data-details-slab] {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper);
		overflow: hidden;
	}

	[data-details-tabs] {
		display: flex;
		gap: 2px;
		padding: 6px 6px 0;
		background: var(--paper-soft);
		border-bottom: 1px solid var(--paper-edge);
	}

	[data-details-tab] {
		padding: 6px 12px;
		border: 1px solid transparent;
		border-bottom: none;
		border-radius: 6px 6px 0 0;
		background: transparent;
		color: var(--ink-mute);
		font: 500 12px var(--font-ui);
		cursor: pointer;
		transition: color 120ms ease, background 120ms ease, border-color 120ms ease;
	}

	[data-details-tab]:hover:not(:disabled) {
		color: var(--ink);
		background: var(--paper);
	}

	[data-details-tab][data-active] {
		color: var(--ink);
		background: var(--paper);
		border-color: var(--paper-edge);
		margin-bottom: -1px;
	}

	[data-details-tab]:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	[data-details-body] {
		padding: 12px;
		max-height: 360px;
		overflow-y: auto;
	}

	/* Tweaks already brings its own card chrome — strip the inner Tweaks
	   border when nested inside this slab so we don't double-frame. */
	[data-details-body] :global([data-tweaks]) {
		border: none;
		background: transparent;
	}

	[data-details-body] :global([data-tweaks-head]) {
		display: none;
	}

	[data-details-body] :global([data-tweaks-body]) {
		padding: 0;
	}

	[data-details-empty] {
		padding: 24px 8px;
		text-align: center;
		color: var(--ink-mute);
		font: 400 12px var(--font-ui);
	}

	[data-api-section] + [data-api-section] {
		margin-top: 16px;
	}

	[data-api-section] h4 {
		margin: 0 0 6px;
		font: 600 11px var(--font-ui);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}

	[data-api-table] {
		width: 100%;
		border-collapse: collapse;
		font: 400 12px var(--font-ui);
	}

	[data-api-table] th,
	[data-api-table] td {
		text-align: left;
		padding: 6px 8px;
		border-bottom: 1px solid var(--paper-edge);
		vertical-align: top;
	}

	[data-api-table] th {
		font: 600 11px var(--font-ui);
		color: var(--ink-soft);
	}

	[data-api-table] code {
		font: 400 11px var(--font-mono, ui-monospace, monospace);
		color: var(--ink);
	}

	[data-api-foot] {
		margin: 6px 0 0;
		font: 400 11px var(--font-ui);
		color: var(--ink-mute);
	}

	[data-api-attrs] {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 4px;
		font: 400 12px var(--font-ui);
	}

	[data-api-attrs] li {
		display: grid;
		grid-template-columns: minmax(160px, auto) 1fr;
		gap: 12px;
	}

	[data-api-attrs] code {
		font: 400 11px var(--font-mono, ui-monospace, monospace);
		color: var(--ink);
	}

	[data-source-list] {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>
