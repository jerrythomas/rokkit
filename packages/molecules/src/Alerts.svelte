<script>
	import { run } from 'svelte/legacy';

	import { fade } from 'svelte/transition'
	import { cubicIn, cubicOut } from 'svelte/easing'
	import { alerts } from '@rokkit/stores'
	import { dismissable } from '@rokkit/actions'
	import { defaultFields, getComponent } from '@rokkit/core'
	import { pick } from 'ramda'
	import Item from './Item.svelte'

	

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [fields]
	 * @property {any} [using]
	 * @property {any} [arrival]
	 * @property {any} [departure]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		fields = defaultFields,
		using = { default: Item },
		arrival = $bindable({}),
		departure = $bindable({})
	} = $props();

	function dismissAll() {
		alerts.clear()
	}

	run(() => {
		arrival = {
			animation: fade,
			duration: 300,
			easing: cubicIn,
			delay: 0,
			...arrival
		}
	});
	run(() => {
		departure = {
			animation: fade,
			duration: 300,
			easing: cubicOut,
			delay: 0,
			...departure
		}
	});

	let arrive = $derived(arrival.animation)
	let depart = $derived(departure.animation)
	let optionsForIn = $derived(pick(['duration', 'easing', 'delay'], arrival))
	let optionsForOut = $derived(pick(['duration', 'easing', 'delay'], departure))
</script>

<alert-list
	class="absolute z-10 flex flex-col gap-2 {className}"
	use:dismissable
	ondismiss={dismissAll}
>
	{#each $alerts as alert}
		{@const component = getComponent(alert, fields, using)}
		{@const SvelteComponent = component}
		<alert
			class={alert.type}
			in:arrive={optionsForIn}
			out:depart={optionsForOut}
			role="alert"
			aria-label="Dismissable alert message"
			aria-live="assertive"
		>
			<SvelteComponent value={alert.message} {fields} />
		</alert>
	{/each}
</alert-list>
