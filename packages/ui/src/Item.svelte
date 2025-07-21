<script>
	import Icon from './Icon.svelte'
	import { Proxy } from '@rokkit/states'
	/**
	 * @typedef {Object} Props
	 * @property {import('@rokkit/states').NodeProxy} [value]
	 */

	/** @type {Props} */
	let { value, fields, proxy = null } = $props()
	let proxyItem = $derived(proxy ?? new Proxy(value, fields))
	let content = $derived(proxyItem.get('text'))
	let ariaLabel = $derived(proxyItem.get('label') ?? content)
	let icon = $derived(proxyItem.get('icon'))
	let image = $derived(proxyItem.get('image'))
</script>

{#if icon}
	<Icon name={icon} label={ariaLabel} />
{:else if image}
	<img src={image} alt={ariaLabel} />
{/if}
{#if content}
	<p>{content}</p>
{/if}
