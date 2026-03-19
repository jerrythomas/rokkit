<script>
	// @ts-nocheck
	import { AlertList } from '@rokkit/ui'
	import { alerts } from '@rokkit/states'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	// ── AlertList props ─────────────────────────────────────────────────────
	let listProps = $state({ position: 'top-right' })

	const listSchema = {
		type: 'object',
		properties: {
			position: { type: 'string' }
		}
	}

	const listLayout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/position',
				label: 'Position',
				props: {
					options: [
						'top-right',
						'top-center',
						'top-left',
						'bottom-right',
						'bottom-center',
						'bottom-left'
					]
				}
			}
		]
	}

	// ── Toast composer ──────────────────────────────────────────────────────
	let toastData = $state({
		type: 'info',
		text: 'Something happened',
		dismissible: true,
		timeout: 4000
	})
	let lastId = $state(null)

	const toastSchema = {
		type: 'object',
		properties: {
			type: { type: 'string' },
			text: { type: 'string' },
			dismissible: { type: 'boolean' },
			timeout: { type: 'number' }
		}
	}

	const toastLayout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/type',
				label: 'Type',
				props: { options: ['info', 'success', 'warning', 'error'] }
			},
			{ scope: '#/text', label: 'Text' },
			{ scope: '#/dismissible', label: 'Dismissible' },
			{ scope: '#/timeout', label: 'Timeout (ms)' },
			{ type: 'separator' }
		]
	}

	function sendToast() {
		lastId = alerts.push({ ...toastData })
	}
</script>

<AlertList position={listProps.position} />

<PlaySection>
	{#snippet preview()}
		<div class="text-surface-z4 flex flex-col items-center gap-2 text-sm">
			<span class="i-solar:bell-bold-duotone text-surface-z3 text-4xl" aria-hidden="true"></span>
			<p class="text-center">
				Toasts appear at <strong class="text-surface-z6">{listProps.position}</strong>.<br />
				Use the data panel to send one.
			</p>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={listProps} schema={listSchema} layout={listLayout} />
	{/snippet}

	{#snippet data()}
		<div class="flex flex-col gap-3">
			<p class="text-surface-z5 text-xs font-semibold uppercase tracking-widest">New Toast</p>
			<FormRenderer bind:data={toastData} schema={toastSchema} layout={toastLayout} />
			<div class="flex flex-wrap gap-2">
				<button data-button data-variant="primary" onclick={sendToast}>Send</button>
				{#if lastId}
					<button data-button onclick={() => alerts.dismiss(lastId)}>Dismiss Last</button>
				{/if}
				<button data-button onclick={() => alerts.clear()}>Clear All</button>
			</div>
		</div>
	{/snippet}
</PlaySection>
