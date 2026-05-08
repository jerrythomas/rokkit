<script lang="ts">
	import type { ProxyItem } from '@rokkit/states'
	import { isIconClass } from '@rokkit/core'

	interface Props {
		proxy: ProxyItem
		collapsed?: boolean
	}
	let { proxy, collapsed = false }: Props = $props()

	const icon = $derived(proxy.get('icon'))
	const subtitle = $derived(proxy.get('subtext'))
	const badge = $derived(proxy.get('badge'))
	// Optional step status (wizard mode): 'current' | 'done' | 'pending'
	// When present, the component drives icon color and tick visibility directly.
	const status = $derived(proxy.get('status') as string | undefined)

	// Inline icon color — overrides CSS when status is set (avoids specificity battles)
	const iconStyle = $derived(
		status === 'current' ? 'color: oklch(var(--color-primary-z5) / 1)'
		: status === 'done'  ? 'color: oklch(var(--color-surface-z5) / 1)'
		: status             ? 'color: oklch(var(--color-surface-z3) / 1)'
		: undefined
	)
</script>

{#if icon}
	{#if isIconClass(String(icon))}
		<span data-item-icon class={String(icon)} aria-hidden="true" title={collapsed ? proxy.label : undefined}></span>
	{:else}
		<span
			data-item-icon-literal
			aria-hidden="true"
			title={collapsed ? proxy.label : undefined}
			style={iconStyle}
		>{icon}</span>
	{/if}
{/if}
{#if !collapsed}
	<span data-item-text>
		<span data-item-label>{proxy.label}</span>
		{#if subtitle}
			{#if status !== undefined}
				<!-- Wizard mode: subtitle visible only for the current step -->
				{#if status === 'current'}
					<span style="display:block; font-family:var(--font-mono,monospace); font-size:10px; color:oklch(var(--color-surface-z5)/1); margin-top:2px">{subtitle}</span>
				{/if}
			{:else}
				<!-- Generic mode: CSS controls visibility via [data-active] -->
				<span data-item-description>{subtitle}</span>
			{/if}
		{/if}
	</span>
	{#if status !== undefined}
		<!-- Wizard tick — always in layout (preserves column width), fades in when done -->
		<span
			aria-hidden="true"
			style="font-size:11px; text-align:center; line-height:1; width:14px; flex-shrink:0; opacity:{status === 'done' ? '1' : '0'}; color:oklch(var(--color-success-z5)/1); transition:opacity 0.14s"
		>✓</span>
	{:else if badge}
		<span data-item-badge>{badge}</span>
	{/if}
{/if}
