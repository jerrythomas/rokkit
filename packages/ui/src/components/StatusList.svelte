<script>
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'

	const DEFAULT_ICONS = DEFAULT_STATE_ICONS.badge

	let { class: className = '', items, icons = {} } = $props()

	const resolvedIcons = $derived({ ...DEFAULT_ICONS, ...icons })
</script>

<div data-status-list class={className} role="status">
	{#each items as { text, status }, index (index)}
		<div data-status-item data-status={status}>
			<span class={resolvedIcons[status]} aria-hidden="true"></span>
			<p>{text}</p>
		</div>
	{/each}
</div>
