<script>
	import Icon from './Icon.svelte'
	import { FieldMapper } from '@rokkit/core'

	/**
	 * @typedef {Object} Props
	 * @property {string|Object} [value]
	 * @property {FieldMapper}   [mapping]
	 */

	/** @type {Props} */
	let { value, mapping = new FieldMapper() } = $props()
	let content = $derived(mapping.getText(value))
	let ariaLabel = $derived(mapping.getLabel(value) ?? content)
</script>

{#if mapping.hasIcon(value)}
	<Icon name={mapping.getIcon(value)} label={ariaLabel} />
{:else if mapping.hasImage(value)}
	<img src={mapping.getImage(value)} alt={ariaLabel} />
{/if}
{#if content}
	<p>{content}</p>
{/if}
