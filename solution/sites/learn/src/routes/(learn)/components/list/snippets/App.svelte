<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'

	const items = [
		{ label: 'Design system', status: 'done', icon: 'i-lucide:palette' },
		{ label: 'Component library', status: 'done', icon: 'i-lucide:blocks' },
		{ label: 'Documentation', status: 'in-progress', icon: 'i-lucide:book-open' },
		{ label: 'E2E tests', status: 'in-progress', icon: 'i-lucide:flask-conical' },
		{ label: 'Release v1.0', status: 'pending', icon: 'i-lucide:rocket' }
	]

	const statusStyle = {
		done: 'bg-success-z2 text-success-z8',
		'in-progress': 'bg-warning-z2 text-warning-z8',
		pending: 'bg-surface-z2 text-surface-z5'
	}

	let value = $state(null)
</script>

<List {items} bind:value onselect={(v) => (value = v)}>
	{#snippet itemContent(proxy)}
		{#if proxy.icon}
			<span class={proxy.icon} aria-hidden="true"></span>
		{/if}
		<span class="flex-1">{proxy.text}</span>
		<span class="rounded px-1.5 py-0.5 text-xs {statusStyle[proxy.get('status')] ?? ''}">
			{proxy.get('status')}
		</span>
	{/snippet}
</List>

{#if value}
	<p class="text-surface-z6 mt-3 text-sm">Selected: <strong>{value.label ?? value}</strong></p>
{/if}
