<script>
	import { ProxyItem } from '@rokkit/states'

	/** @type {{ proxy: ProxyItem }} */
	const { proxy } = $props()
</script>

{#if proxy.get('avatar')}
	<img data-item-avatar src={proxy.get('avatar')} alt={proxy.get('tooltip') ?? proxy.label} />
{:else if proxy.get('icon')}
	<span data-item-icon class={proxy.get('icon')} aria-hidden="true"></span>
{/if}
{#if proxy.label || proxy.get('subtext')}
	<span data-item-text>
		<span data-item-label>{proxy.label}</span>
		{#if proxy.get('subtext')}
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
