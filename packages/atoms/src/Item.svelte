<script>
	import Icon from './Icon.svelte'
	import { FieldMapper } from '@rokkit/core'

	/**
	 * @type {Object} Props
	 * @property {string|Object} [value]
	 * @property {FieldMapper}   [mapping]
	 */
	let { value, mapping = new FieldMapper() } = $props()
</script>

{#if mapping.hasIcon(value)}
	<Icon name={mapping.getIcon(value)} label={mapping.getLabel(value)} />
{:else if mapping.hasImage(value)}
	<img src={mapping.getImage(value)} alt={mapping.getLabel(value)} />
{/if}
<p>{mapping.getText(value)}</p>
