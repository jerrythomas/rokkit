<script lang="ts">
	import { Table, List } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import { BarChart } from '@rokkit/chart'
	import { submitExport } from '../store.svelte'

	type Props = {
		tool: string
		props: Record<string, unknown>
		caption?: string
	}

	const { tool, props, caption }: Props = $props()

	// Form needs a bindable `data` — clone the seed so the user can mutate it
	// without leaking back into the response block. One instance per mount.
	let formData = $state<Record<string, unknown>>(
		tool === 'mount_form' ? { ...((props.data as Record<string, unknown>) ?? {}) } : {}
	)

	const seedData = $derived(props.data ?? null)

	// Tables: editable mode keeps a deep clone of the rows so edits don't
	// mutate the response block. Toggled via "Edit rows".
	let editingTable = $state(false)
	let tableRows = $state<Record<string, unknown>[]>(
		tool === 'mount_table'
			? JSON.parse(JSON.stringify((props.data as unknown[]) ?? []))
			: []
	)
	const tableColumns = $derived<string[]>(
		tool === 'mount_table' && Array.isArray(props.data)
			? Array.from(
					new Set(
						(props.data as Record<string, unknown>[]).flatMap((r) => Object.keys(r ?? {}))
					)
				)
			: []
	)
	const isTableDirty = $derived.by(() => {
		if (tool !== 'mount_table') return false
		try {
			return JSON.stringify(tableRows) !== JSON.stringify(props.data)
		} catch {
			return false
		}
	})

	function cellInputType(value: unknown): 'number' | 'checkbox' | 'date' | 'text' {
		if (typeof value === 'number') return 'number'
		if (typeof value === 'boolean') return 'checkbox'
		if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return 'date'
		return 'text'
	}

	function setCell(rowIdx: number, col: string, raw: string | boolean) {
		const original = tableRows[rowIdx]?.[col]
		let next: unknown = raw
		if (typeof original === 'number' && typeof raw === 'string') {
			const n = Number(raw)
			next = Number.isNaN(n) ? raw : n
		}
		// Boolean comes through as a real boolean from checkbox
		tableRows[rowIdx] = { ...tableRows[rowIdx], [col]: next }
	}

	// True once the form has diverged from its initial value. Avoids the
	// Save button feeling clickable when nothing's changed.
	const isFormDirty = $derived.by(() => {
		if (tool !== 'mount_form' || seedData === null) return false
		try {
			return JSON.stringify(formData) !== JSON.stringify(seedData)
		} catch {
			return true
		}
	})

	function saveForm() {
		submitExport({
			source: 'form',
			caption,
			// Pass a snapshot so subsequent edits don't mutate the saved turn.
			data: JSON.parse(JSON.stringify(formData))
		})
	}

	function saveTable() {
		submitExport({
			source: 'table',
			caption,
			data: JSON.parse(JSON.stringify(tableRows))
		})
		editingTable = false
	}

	function currentExportData(): unknown {
		if (tool === 'mount_form') return formData
		if (tool === 'mount_table') return tableRows
		return props.data ?? props.items ?? null
	}

	function exportData() {
		const data = currentExportData()
		if (data === null) return
		submitExport({ source: tool, caption, data })
	}

	async function copyJson() {
		const data = currentExportData()
		if (data === null) return
		try {
			await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
		} catch {
			// clipboard not available — ignore, the Save / Export button still works
		}
	}

	const hasExportableData = $derived(
		tool === 'mount_table' ||
			tool === 'mount_list' ||
			tool === 'mount_bar_chart' ||
			tool === 'mount_form'
	)
</script>

<figure class="inline-mount" data-tool={tool}>
	{#if tool === 'mount_bar_chart'}
		<BarChart {...props} />
	{:else if tool === 'mount_table'}
		{#if editingTable}
			<div class="cell-grid" style="grid-template-columns: repeat({tableColumns.length}, minmax(0, 1fr));">
				{#each tableColumns as col (col)}
					<div class="cell-header">{col}</div>
				{/each}
				{#each tableRows as row, rowIdx (rowIdx)}
					{#each tableColumns as col (col)}
						{@const value = row[col]}
						{@const type = cellInputType(value)}
						<div class="cell">
							{#if type === 'checkbox'}
								<input
									type="checkbox"
									checked={Boolean(value)}
									onchange={(e) =>
										setCell(rowIdx, col, (e.currentTarget as HTMLInputElement).checked)}
								/>
							{:else if type === 'number'}
								<input
									type="number"
									value={value as number}
									oninput={(e) =>
										setCell(rowIdx, col, (e.currentTarget as HTMLInputElement).value)}
								/>
							{:else if type === 'date'}
								<input
									type="date"
									value={value as string}
									oninput={(e) =>
										setCell(rowIdx, col, (e.currentTarget as HTMLInputElement).value)}
								/>
							{:else}
								<input
									type="text"
									value={value as string ?? ''}
									oninput={(e) =>
										setCell(rowIdx, col, (e.currentTarget as HTMLInputElement).value)}
								/>
							{/if}
						</div>
					{/each}
				{/each}
			</div>
		{:else}
			<Table {...props} />
		{/if}
	{:else if tool === 'mount_list'}
		<List {...props} />
	{:else if tool === 'mount_form'}
		<FormRenderer bind:data={formData} schema={props.schema as Record<string, unknown>} />
	{:else}
		<div class="inline-error">No inline renderer registered for tool <code>{tool}</code>.</div>
	{/if}

	{#if caption || hasExportableData}
		<div class="inline-footer">
			{#if caption}
				<figcaption>{caption}</figcaption>
			{:else}
				<span></span>
			{/if}
			{#if hasExportableData}
				<div class="inline-actions">
					{#if tool === 'mount_form'}
						<button
							type="button"
							class="inline-action"
							onclick={saveForm}
							disabled={!isFormDirty}
							title={isFormDirty ? 'Save edits as a new turn' : 'Edit a field to enable saving'}
						>
							<span class="i-mdi:content-save-outline" aria-hidden="true"></span>
							Save changes
						</button>
					{:else if tool === 'mount_table'}
						{#if editingTable}
							<button
								type="button"
								class="inline-action"
								onclick={saveTable}
								disabled={!isTableDirty}
								title={isTableDirty
									? 'Save edited rows as a new turn'
									: 'Edit a cell to enable saving'}
							>
								<span class="i-mdi:content-save-outline" aria-hidden="true"></span>
								Save rows
							</button>
							<button
								type="button"
								class="inline-action subtle"
								onclick={() => {
									tableRows = JSON.parse(JSON.stringify(props.data ?? []))
									editingTable = false
								}}
							>
								Cancel
							</button>
						{:else}
							<button
								type="button"
								class="inline-action"
								onclick={() => (editingTable = true)}
							>
								<span class="i-mdi:table-edit" aria-hidden="true"></span>
								Edit rows
							</button>
							<button type="button" class="inline-action subtle" onclick={exportData}>
								<span class="i-mdi:export-variant" aria-hidden="true"></span>
								Export
							</button>
						{/if}
					{:else}
						<button type="button" class="inline-action" onclick={exportData}>
							<span class="i-mdi:export-variant" aria-hidden="true"></span>
							Export data
						</button>
					{/if}
					<button type="button" class="inline-action subtle" onclick={copyJson} title="Copy as JSON">
						<span class="i-mdi:content-copy" aria-hidden="true"></span>
						Copy
					</button>
				</div>
			{/if}
		</div>
	{/if}
</figure>

<style>
	.inline-mount {
		margin: 10px 0 0;
		padding: 12px;
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper-soft);
	}

	.inline-footer {
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px dashed var(--paper-edge);
		display: flex;
		align-items: center;
		gap: 8px;
	}

	figcaption {
		flex: 1;
		font: 500 11.5px var(--font-ui);
		color: var(--ink-mute);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.inline-actions {
		display: flex;
		gap: 6px;
		margin-left: auto;
	}

	.inline-action {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		height: 26px;
		padding: 0 10px;
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		background: var(--paper);
		font: 500 11.5px var(--font-ui);
		color: var(--ink-mute);
		cursor: pointer;
	}

	.inline-action:not(:disabled):hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.inline-action:disabled {
		opacity: 0.55;
		cursor: default;
	}

	.inline-action.subtle {
		background: transparent;
		border-color: transparent;
	}

	.inline-action.subtle:hover {
		background: var(--paper);
		border-color: var(--paper-edge);
		color: var(--ink);
	}

	.inline-error {
		font: 13px var(--font-ui);
		color: var(--ink-mute);
		padding: 8px;
	}

	.cell-grid {
		display: grid;
		gap: 1px;
		background: var(--paper-edge);
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		overflow: hidden;
	}

	.cell-header {
		padding: 6px 8px;
		background: var(--paper-soft);
		font: 500 11px var(--font-mono);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.cell {
		background: var(--paper);
		padding: 2px;
	}

	.cell input[type='text'],
	.cell input[type='number'],
	.cell input[type='date'] {
		width: 100%;
		padding: 6px 8px;
		border: 1px solid transparent;
		background: transparent;
		font: 13px var(--font-ui);
		color: var(--ink);
		border-radius: 4px;
	}

	.cell input:focus {
		outline: none;
		border-color: var(--accent);
		background: var(--paper-soft);
	}

	.cell input[type='checkbox'] {
		margin: 8px;
	}
</style>
