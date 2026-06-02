<script lang="ts">
	import type { ItemContentProps } from '../types/item-content.js'
	import { isIconClass } from '@rokkit/core'

	const { proxy, showIcon = true, showSubtext = true }: ItemContentProps = $props()
</script>

{#if showIcon}
	{#if proxy.get('avatar')}
		<img data-item-avatar src={proxy.get('avatar')} alt={proxy.get('tooltip') ?? proxy.label} />
	{:else if proxy.get('icon')}
		{#if isIconClass(proxy.get('icon'))}
			<span data-item-icon class={proxy.get('icon')} aria-hidden="true"></span>
		{:else}
			<span data-item-icon-literal aria-hidden="true">{proxy.get('icon')}</span>
		{/if}
	{/if}
{/if}
{#if proxy.label || (showSubtext && proxy.get('subtext'))}
	<span data-item-text>
		<span data-item-label>{proxy.label}</span>
		{#if showSubtext && proxy.get('subtext')}
			<span data-item-description>{proxy.get('subtext')}</span>
		{/if}
	</span>
{/if}
{#if proxy.get('badge')}
	<span data-item-badge>{proxy.get('badge')}</span>
{/if}
{#if proxy.get('shortcut')}
	<kbd data-item-shortcut>{proxy.get('shortcut')}</kbd>
{/if}
