<script>
	// @ts-nocheck
	import { Message } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let props = $state({
		type: 'info',
		text: 'A new version is available. Refresh to update.',
		dismissible: false,
		timeout: 0
	})
	let dismissed = $state(false)

	$effect(() => {
		if (props.type || props.text) dismissed = false
	})

	const schema = {
		type: 'object',
		properties: {
			type: { type: 'string' },
			text: { type: 'string' },
			dismissible: { type: 'boolean' },
			timeout: { type: 'number' }
		}
	}

	const layout = {
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
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex w-full max-w-lg flex-col gap-8">
			<div>
				<p class="text-surface-z4 mb-3 text-xs font-semibold uppercase tracking-widest">
					Inline Message
				</p>
				{#if !dismissed}
					<Message
						type={props.type}
						text={props.text}
						dismissible={props.dismissible}
						timeout={props.timeout}
						ondismiss={() => (dismissed = true)}
					/>
				{:else}
					<button data-button onclick={() => (dismissed = false)}>Restore</button>
				{/if}
			</div>

			<div>
				<p class="text-surface-z4 mb-3 text-xs font-semibold uppercase tracking-widest">
					All Types
				</p>
				<div class="flex flex-col gap-2">
					<Message type="info" text="Informational message." timeout={0} />
					<Message type="success" text="Operation completed successfully." timeout={0} />
					<Message type="warning" text="Proceed with caution." timeout={0} />
					<Message type="error" text="Something went wrong." timeout={0} />
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
	{/snippet}
</PlaySection>
