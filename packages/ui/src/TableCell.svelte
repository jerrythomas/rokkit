<script>
	import { identity } from 'ramda'
	import { defaultMapping } from './constants'
	import Connector from './Connector.svelte'
	import Icon from './Icon.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} value
	 * @property {any} [fields]
	 * @property {any} [formatter]
	 * @property {any} [using]
	 * @property {any} [levels]
	 * @property {boolean} [isParent]
	 * @property {boolean} [isExpanded]
	 * @property {number} [depth]
	 * @property {any} [path]
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		value = $bindable(),
		mapping = defaultMapping,
		formatter = identity,
		levels = [],
		isParent = false,
		isExpanded = false,
		depth = 0,
		path = null
	} = $props()

	const Template = $derived(mapping.getComponent(value))
</script>

<td class={classes}>
	<rk-cell>
		{#if path}
			{#each levels.slice(0, -1) as _}
				<Connector type="empty" />
			{/each}
			{#if isParent}
				<Icon name={isExpanded ? 'node-opened' : 'node-closed'} class="small cursor-pointer" />
			{:else if depth > 0}
				<Connector type="empty" />
			{/if}
		{/if}
		<Template bind:value {mapping} {formatter} />
	</rk-cell>
</td>
