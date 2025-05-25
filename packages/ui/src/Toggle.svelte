<script>
	import { keyboard } from '@rokkit/actions'
	import Item from './Item.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {any}         value
	 * @property {string}      [class]
	 * @property {boolean}     [disabled] = false
	 * @property {Array<any>}  [options]
	 * @property {FieldMapper} [mapping]
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		value = $bindable(null),
		options = [false, true],
		fields,
		disabled = false,
		label = 'toggle',
		onchange
	} = $props()

	const keyMappings = {
		next: ['ArrowRight', 'ArrowDown'], // button handles space an denter by emitting click event
		prev: ['ArrowLeft', 'ArrowUp']
	}

	function toggle(direction = 1) {
		if (disabled) return

		let nextIndex
		const index = options.indexOf(value)

		if (index == -1) {
			nextIndex = direction == -1 ? options.length - 1 : 0
		} else {
			nextIndex = (index + direction + options.length) % options.length
		}

		value = options[nextIndex]
		onchange?.(value)
	}
</script>

<div data-toggle-root data-disabled={disabled} class={classes}>
	<button
		use:keyboard={keyMappings}
		onnext={() => toggle()}
		onprev={() => toggle(-1)}
		onclick={() => toggle()}
		aria-label={label}
	>
		<Item {value} {fields} />
	</button>
</div>
