<script>
	// import { createEventDispatcher } from 'svelte'
	import { defaultFields, defaultStateIcons, getComponent, createEmitter } from '@rokkit/core'
	import { Icon } from '@rokkit/atoms'
	import Item from './Item.svelte'

	// const dispatch = createEventDispatcher()

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} value
	 * @property {any} [fields]
	 * @property {any} [using]
	 * @property {boolean} [removable]
	 * @property {boolean} [selected]
	 * @property {any} [index]
	 * @property {any} [icons]
	 * @event {any} onremove =
	 */

	/** @type {Props} */
	let {
		class: className = '',
		value = $bindable(),
		fields = defaultFields,
		using = { default: Item },
		removable = false,
		selected = false,
		index = null,
		icons = defaultStateIcons.action,
		...events
	} = $props()

	const emitter = $derived(createEmitter(events, ['remove']))

	function handleClick() {
		console.log('clicked on remove')
		console.log('remove', value)
		emitter.remove(value)
	}

	let icon = $derived(icons?.remove ?? defaultStateIcons.action.remove)
	let component = $derived(getComponent(value, fields, using))

	const SvelteComponent = $derived(component)
</script>

<wrap-item
	class="flex flex-row items-center {className}"
	role="option"
	aria-selected={selected}
	data-path={index}
>
	<item class="flex flex-row items-center">
		<SvelteComponent bind:value {fields} />
	</item>
	{#if removable}
		<Icon name={icon} role="button" label="Remove" size="small" onclick={handleClick} />
	{/if}
</wrap-item>
