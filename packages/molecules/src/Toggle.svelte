<script>
	import { FieldMapper, noop } from '@rokkit/core'
	import { keyboard } from '@rokkit/actions'
	import { Item } from '@rokkit/atoms'

	/**
	 * @typedef {Object} Props
	 * @property {any}        value
	 * @property {string}     [class]
	 * @property {Array<any>} [options]
	 * @property {FieldMapper} [mapping]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		value = $bindable(null),
		options = [false, true],
		mapping = new FieldMapper(),
		onchange = noop
	} = $props()

	const keyMappings = {
		next: ['ArrowRight', 'ArrowDown'], // button handles space an denter by emitting click event
		prev: ['ArrowLeft', 'ArrowUp']
	}

	function toggle(direction = 1) {
		let nextIndex
		const index = options.indexOf(value)

		if (index == -1) {
			nextIndex = direction == -1 ? options.length - 1 : 0
		} else {
			nextIndex = (index + direction + options.length) % options.length
		}

		value = options[nextIndex]
		onchange(value)
	}
</script>

<rk-toggle class={className}>
	<button
		use:keyboard={keyMappings}
		onnext={() => toggle()}
		onprev={() => toggle(-1)}
		onclick={() => toggle()}
	>
		<Item {value} {mapping} />
	</button>
</rk-toggle>
