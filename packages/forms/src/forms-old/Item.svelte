<script>
	import Icon from './Icon.svelte'
	import { Proxy } from '@rokkit/states'
	/**
	 * @typedef {Object} Props
	 * @property {import('@rokkit/states').NodeProxy} [value]
	 */

	/** @type {Props} */
	let { value, fields } = $props()
	let proxy = $derived(new Proxy(value, fields))
	let content = $derived(proxy.get('text'))
	let ariaLabel = $derived(proxy.get('label') ?? content)
	let icon = $derived(proxy.get('icon'))
	let image = $derived(proxy.get('image'))
</script>

{#if icon}
	<Icon name={icon} label={ariaLabel} />
{:else if image}
	<img src={image} alt={ariaLabel} />
{/if}
{#if content}
	<p>{content}</p>
{/if}
