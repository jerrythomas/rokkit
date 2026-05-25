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

	function exportData() {
		const data = tool === 'mount_form' ? formData : (props.data ?? props.items ?? null)
		if (data === null) return
		submitExport({ source: tool, caption, data })
	}

	async function copyJson() {
		const data = tool === 'mount_form' ? formData : (props.data ?? props.items ?? null)
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
		<Table {...props} />
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
</style>
