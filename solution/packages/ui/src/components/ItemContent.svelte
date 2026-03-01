<script lang="ts">
	import type { ItemProxy } from '../types/item-proxy.js'

	interface Props {
		proxy: ItemProxy
	}

	const { proxy }: Props = $props()

	const badge = $derived(proxy.get<string>('badge'))
</script>

{#if proxy.get('icon')}
	<span data-item-icon class={proxy.get('icon')} aria-hidden="true"></span>
{/if}
{#if proxy.label || proxy.get('description')}
	<span data-item-text>
		<span data-item-label>{proxy.label}</span>
		{#if proxy.get('description')}
			<span data-item-description>{proxy.get('description')}</span>
		{/if}
	</span>
{/if}
{#if badge}
	<span data-item-badge>{badge}</span>
{/if}
