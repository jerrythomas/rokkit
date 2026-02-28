<script lang="ts">
	import type { TimelineProps } from '../types/timeline.js'
	import { defaultTimelineFields, defaultTimelineIcons } from '../types/timeline.js'
	import { ItemProxy } from '../types/item-proxy.js'

	let {
		items = [],
		fields: userFields,
		icons: userIcons,
		class: className = '',
		content
	}: TimelineProps = $props()

	const fields = $derived({ ...defaultTimelineFields, ...userFields })
	const icons = $derived({ ...defaultTimelineIcons, ...userIcons })
</script>

<div data-timeline class={className || undefined} role="list">
	{#each items as item, index (index)}
		{@const proxy = new ItemProxy(item, fields)}
		{@const text = proxy.text}
		{@const icon = proxy.icon}
		{@const description = proxy.description}
		{@const completed = Boolean(item.completed)}
		{@const active = Boolean(item.active)}

		<div
			data-timeline-item
			data-completed={completed || undefined}
			data-active={active || undefined}
			role="listitem"
		>
			<div data-timeline-marker aria-hidden="true">
				<div data-timeline-circle>
					{#if completed}
						<span class={icons.completed}></span>
					{:else if icon}
						<span class={icon}></span>
					{:else}
						{index + 1}
					{/if}
				</div>
				{#if index < items.length - 1}
					<div data-timeline-connector></div>
				{/if}
			</div>

			<div data-timeline-body>
				{#if text}
					<div data-timeline-title>{text}</div>
				{/if}
				{#if description}
					<div data-timeline-description>{description}</div>
				{/if}
				{#if content}
					{@render content(item, index)}
				{/if}
			</div>
		</div>
	{/each}
</div>
