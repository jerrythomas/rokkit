<script>
	import { fade } from 'svelte/transition'
	import { cubicIn, cubicOut } from 'svelte/easing'
	import { alerts } from '@rokkit/stores'
	import { dismissable } from '@rokkit/actions'
	import { defaultFields, getComponent } from '@rokkit/core'
	import Item from './Item.svelte'

	export let fields = defaultFields
	export let using = { default: Item }

	export let arrival
	export let departure

	function dismissAll() {
		alerts.set([])
	}

	$: arrive = arrival?.animation ?? fade
	$: depart = departure?.animation ?? fade
	$: optionsForIn = {
		duration: arrival?.duration ?? 300,
		easing: arrival?.easing ?? cubicIn,
		delay: arrival?.delay ?? 0
	}
	$: optionsForOut = {
		duration: departure?.duration ?? 300,
		easing: departure?.easing ?? cubicOut,
		delay: departure?.delay ?? 0
	}
</script>

<alert-list
	class="absolute z-10 flex flex-col gap-2"
	use:dismissable
	on:dismiss={dismissAll}
>
	{#each alerts as alert}
		{@const component = getComponent(alert, fields, using)}
		<alert
			class={alert.type}
			in:arrive={optionsForIn}
			out:depart={optionsForOut}
			role="alert"
			aria-label="Dismissable alert message"
			aria-live="assertive"
		>
			<svelte:component this={component} value={alert} {fields} />
		</alert>
	{/each}
</alert-list>
