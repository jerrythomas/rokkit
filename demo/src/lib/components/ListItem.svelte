<script lang="ts">
	import type { ProxyItem } from '@rokkit/states'
	import { isIconClass } from '@rokkit/core'

	interface Props {
		proxy: ProxyItem
		collapsed?: boolean
	}
	let { proxy, collapsed = false }: Props = $props()

	const icon     = $derived(proxy.get('icon'))
	const subtitle = $derived(proxy.get('subtext'))
	const badge    = $derived(proxy.get('badge'))
	// Used only to decide whether to render the tick slot (wizard mode).
	// Visual state (icon color, tick opacity, description visibility) is driven
	// entirely by CSS via data-item-status and the [data-active] / :disabled
	// attributes set by List.svelte — no inline styles here.
	const status = $derived(proxy.get('status') as string | undefined)
</script>

{#if icon}
	{#if isIconClass(String(icon))}
		<span data-item-icon class={String(icon)} aria-hidden="true" title={collapsed ? proxy.label : undefined}></span>
	{:else}
		<span
			data-item-icon-literal
			data-item-status={status || undefined}
			aria-hidden="true"
			title={collapsed ? proxy.label : undefined}
		>{icon}</span>
	{/if}
{/if}
{#if !collapsed}
	<span data-item-text>
		<span data-item-label>{proxy.label}</span>
		{#if subtitle}
			<span data-item-description>{subtitle}</span>
		{/if}
	</span>
	{#if status !== undefined}
		<span data-item-tick aria-hidden="true">✓</span>
	{:else if badge}
		<span data-item-badge>{badge}</span>
	{/if}
{/if}
