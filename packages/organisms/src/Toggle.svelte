<script>
	import { defaultFields } from '@rokkit/core'
	import { switchable } from '@rokkit/actions'
	import { Item } from '@rokkit/molecules'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	/** @type {[any,any]} */
	export let options = [false, true]
	export let value = options[0]
	export let fields = {}
	export let using = {}
	export let description = 'Toggle'
	export let tabindex = 0
	export let disabled = false
	export let minimal = false

	function handle(e) {
		// console.log('toggle clicked', value, e.detail)
		value = e.detail
		dispatch('change', value)
	}
	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Item, ...using }
</script>

<toggle
	role="switch"
	class={className}
	aria-checked={value === options[1]}
	aria-label={description}
	aria-disabled={disabled}
	{tabindex}
	use:switchable={{ value, options, disabled }}
	on:change={handle}
	class:minimal
>
	<Item {value} {fields} />
</toggle>
