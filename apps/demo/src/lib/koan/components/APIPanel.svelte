<script lang="ts">
	/**
	 * API reference panel rendered in the canvas area. Shows the active
	 * demo's full public surface — props / events / data-attribute hooks
	 * — as wide tables. Read-only documentation: editing props lives in
	 * the chat-side Tweaks slab and the chat composer (e.g. "change
	 * orientation to vertical"), keeping the API panel as a pure
	 * reference surface.
	 */
	import type { DemoApi } from '../types'

	interface Props {
		api: DemoApi
	}

	const { api }: Props = $props()
</script>

<div data-api-panel>
	<section data-api-section>
		<header><h3>Props</h3></header>
		<table data-api-table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Type</th>
					<th>Default</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				{#each api.props as p (p.name)}
					<tr>
						<td>
							<code>{p.name}</code>
							{#if p.bindable}<span data-api-tag>bindable</span>{/if}
						</td>
						<td><code>{p.type}</code></td>
						<td><code>{p.default ?? '—'}</code></td>
						<td>{p.desc}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>

	{#if api.events && api.events.length}
		<section data-api-section>
			<header><h3>Events</h3></header>
			<table data-api-table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Signature</th>
						<th>Description</th>
					</tr>
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
			<header><h3>Data attributes</h3></header>
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
</div>

<style>
	[data-api-panel] {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 960px;
	}

	[data-api-section] header {
		display: flex;
		align-items: baseline;
		gap: 8px;
		margin-bottom: 8px;
		padding-bottom: 6px;
		border-bottom: 1px solid var(--paper-edge);
	}

	[data-api-section] h3 {
		margin: 0;
		font: 600 12px var(--font-ui);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}

	[data-api-table] {
		width: 100%;
		border-collapse: collapse;
		font: 400 13px var(--font-ui);
		color: var(--ink);
	}

	[data-api-table] th,
	[data-api-table] td {
		text-align: left;
		padding: 8px 12px;
		border-bottom: 1px solid var(--paper-edge);
		vertical-align: top;
	}

	[data-api-table] th {
		font: 500 11px var(--font-ui);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ink-soft);
		background: var(--paper-soft);
	}

	[data-api-table] code {
		font: 400 12.5px var(--font-mono, ui-monospace, monospace);
		color: var(--ink);
	}

	[data-api-table] tbody tr:hover {
		background: var(--paper-soft);
	}

	[data-api-tag] {
		display: inline-block;
		margin-left: 6px;
		padding: 1px 6px;
		border-radius: 9999px;
		background: color-mix(in oklch, var(--accent) 14%, transparent);
		color: var(--accent);
		font: 500 10px var(--font-ui);
		letter-spacing: 0.02em;
		text-transform: uppercase;
		vertical-align: middle;
	}

	[data-api-attrs] {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 6px;
	}

	[data-api-attrs] li {
		display: grid;
		grid-template-columns: minmax(200px, auto) 1fr;
		gap: 16px;
		padding: 6px 0;
		border-bottom: 1px solid var(--paper-edge);
		font: 400 13px var(--font-ui);
	}

	[data-api-attrs] code {
		font: 400 12.5px var(--font-mono, ui-monospace, monospace);
		color: var(--ink);
	}
</style>
