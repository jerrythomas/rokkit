<script>
	import { fade } from 'svelte/transition'
	import { cubicIn, cubicOut } from 'svelte/easing'
	import { alerts } from '@rokkit/stores'
	import { dismissable } from '@rokkit/actions'
	import { defaultFields, getComponent } from '@rokkit/core'
	import { pick } from 'ramda'
	import Item from './Item.svelte'

	export let fields = defaultFields
	export let using = { default: Item }

	export let arrival = {}
	export let departure = {}

	function dismissAll() {
		alerts.clear()
	}

	$: arrival = {
		animation: fade,
		duration: 300,
		easing: cubicIn,
		delay: 0,
		...arrival
	}
	$: departure = {
		animation: fade,
		duration: 300,
		easing: cubicOut,
		delay: 0,
		...departure
	}

	$: arrive = arrival.animation
	$: depart = departure.animation
	$: optionsForIn = pick(['duration', 'easing', 'delay'], arrival)
	$: optionsForOut = pick(['duration', 'easing', 'delay'], departure)
</script>

<alert-list
	class="absolute z-10 flex flex-col gap-2"
	use:dismissable
	on:dismiss={dismissAll}
>
	{#each $alerts as alert}
		{@const component = getComponent(alert, fields, using)}
		<alert
			class={alert.type}
			in:arrive={optionsForIn}
			out:depart={optionsForOut}
			role="alert"
			aria-label="Dismissable alert message"
			aria-live="assertive"
		>
			<svelte:component this={component} value={alert.message} {fields} />
		</alert>
	{/each}
</alert-list>
