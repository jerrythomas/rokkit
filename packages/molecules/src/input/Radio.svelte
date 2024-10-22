<script>
	import { run } from 'svelte/legacy';

	import { defaultFields, defaultStateIcons, getValue, getText } from '@rokkit/core'

	
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} value
	 * @property {any} name
	 * @property {any} [id]
	 * @property {any} [fields]
	 * @property {any} [options]
	 * @property {boolean} [readOnly]
	 * @property {boolean} [textAfter]
	 * @property {any} [stateIcons]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		value = $bindable(),
		name,
		id = null,
		fields = $bindable(defaultFields),
		options = [],
		readOnly = false,
		textAfter = true,
		stateIcons = defaultStateIcons.radio
	} = $props();

	run(() => {
		fields = { ...defaultFields, ...fields }
	});
	let flexDirection = $derived(textAfter ? 'flex-row' : 'flex-row-reverse')
</script>

<radio-group
	{id}
	class="flex flex-col cursor-pointer select-none {className}"
	class:disabled={readOnly}
>
	{#each options as item}
		{@const itemValue = getValue(item, fields)}
		{@const label = getText(item, fields)}
		{@const state = itemValue === value ? 'on' : 'off'}

		<label class="flex {flexDirection} items-center gap-2">
			<input hidden type="radio" {name} bind:group={value} value={itemValue} {readOnly} />
			<icon class={stateIcons[state]}></icon>
			<p>{label}</p>
		</label>
	{/each}
</radio-group>
