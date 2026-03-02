<script lang="ts">
	import type { Snippet } from 'svelte'
	import { ProxyItem } from '@rokkit/states'
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'

	interface BreadCrumbsIcons {
		separator?: string
	}

	interface BreadCrumbsProps {
		/** Array of breadcrumb items */
		items?: unknown[]
		/** Custom field mappings */
		fields?: Record<string, string>
		/** Custom icons */
		icons?: BreadCrumbsIcons
		/** Callback when a breadcrumb is clicked */
		onclick?: (value: unknown, item: unknown) => void
		/** Custom snippet for rendering each crumb */
		crumb?: Snippet<[ProxyItem, boolean]>
		/** Additional CSS class */
		class?: string
	}

	const {
		items = [],
		fields,
		icons: userIcons = {} as BreadCrumbsIcons,
		onclick,
		crumb,
		class: className = ''
	}: BreadCrumbsProps = $props()

	const icons = $derived({ separator: DEFAULT_STATE_ICONS.navigate.right, ...userIcons })

	function createProxy(item: unknown): ProxyItem {
		return new ProxyItem(item, fields)
	}

	function handleClick(proxy: ProxyItem) {
		onclick?.(proxy.value, proxy.original)
	}
</script>

{#snippet defaultCrumb(proxy: ProxyItem, _isLast: boolean)}
	{#if proxy.get('icon')}
		<span data-breadcrumb-icon class={proxy.get('icon')} aria-hidden="true"></span>
	{/if}
	<span data-breadcrumb-label>{proxy.label}</span>
{/snippet}

<nav data-breadcrumbs class={className || undefined} aria-label="Breadcrumb">
	<ol data-breadcrumb-list>
		{#each items as item, index (index)}
			{@const proxy = createProxy(item)}
			{@const isLast = index === items.length - 1}

			{#if index > 0}
				<li data-breadcrumb-separator aria-hidden="true">
					<span class={icons.separator}></span>
				</li>
			{/if}

			<li data-breadcrumb-item data-current={isLast || undefined}>
				{#if isLast}
					<span data-breadcrumb-current aria-current="page">
						{#if crumb}
							{@render crumb(proxy, isLast)}
						{:else}
							{@render defaultCrumb(proxy, isLast)}
						{/if}
					</span>
				{:else}
					<button
						type="button"
						data-breadcrumb-link
						onclick={() => handleClick(proxy)}
					>
						{#if crumb}
							{@render crumb(proxy, isLast)}
						{:else}
							{@render defaultCrumb(proxy, isLast)}
						{/if}
					</button>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
