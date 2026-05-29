<script lang="ts">
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'

	/** One row of the status list — text + a badge status the icon map resolves. */
	export interface StatusListItem {
		text: string
		status: keyof typeof DEFAULT_STATE_ICONS.badge | string
	}

	interface Props {
		/** Extra class string on the root. */
		class?: string
		/** Rows to render. */
		items: StatusListItem[]
		/** Override the default badge icon map (`pass` / `fail` / `warn` / `unknown`). */
		icons?: Partial<Record<string, string>>
	}

	const DEFAULT_ICONS = DEFAULT_STATE_ICONS.badge

	const { class: className = '', items, icons = {} }: Props = $props()

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
