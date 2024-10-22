<script>
	import { run } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte'
	import { defaultFields, getText } from '@rokkit/core'
	const dispatch = createEventDispatcher()


	
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [items]
	 * @property {any} [fields]
	 */

	/** @type {Props} */
	let { class: className = '', items = [], fields = $bindable({}) } = $props();

	run(() => {
		fields = { ...defaultFields, ...fields }
	});

	function handle(item) {
		dispatch('click', item)
	}
</script>

<button-group class="flex flex-row {className}">
	{#each items as item}
		{@const text = getText(item, fields)}
		<button onclick={() => handle(item)} class="flex cursor-pointer select-none">
			{text}
		</button>
	{/each}
</button-group>
