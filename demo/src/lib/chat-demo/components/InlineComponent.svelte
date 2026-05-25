<script lang="ts">
	import { Table, List } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import { BarChart } from '@rokkit/chart'

	type Props = {
		tool: string
		props: Record<string, unknown>
		caption?: string
	}

	const { tool, props, caption }: Props = $props()

	// Form needs a bindable `data` — clone the seed so the user can mutate it
	// without leaking back into the response block. One instance per mount.
	let formData = $state<Record<string, unknown>>(
		tool === 'mount_form' ? { ...(props.data as Record<string, unknown> ?? {}) } : {}
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
	{#if caption}
		<figcaption>{caption}</figcaption>
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

	figcaption {
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px dashed var(--paper-edge);
		font: 500 11.5px var(--font-ui);
		color: var(--ink-mute);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.inline-error {
		font: 13px var(--font-ui);
		color: var(--ink-mute);
		padding: 8px;
	}
</style>
