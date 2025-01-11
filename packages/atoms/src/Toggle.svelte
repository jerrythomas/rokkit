<script>
	import { FieldMapper, noop } from '@rokkit/core'
	import { keyboard } from '@rokkit/actions'
	import Item from './Item.svelte'

	/**
	 * @type {Object} Props
	 * @property {any}        value
	 * @property {string}     [class]
	 * @property {Array<any>} [options]
	 * @property {FieldMapper} [mapping]
	 */
	let {
		class: className = '',
		value = $bindable(null),
		options = [false, true],
		mapping = new FieldMapper(),
		onchange = noop
	} = $props()

	const keyMappings = {
		next: ['ArrowRight', 'ArrowDown', ' ', 'Enter'],
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

<rkt-toggle class={className}>
	<button
		use:keyboard={keyMappings}
		onnext={() => toggle()}
		onprev={() => toggle(-1)}
		onclick={() => toggle(1)}
	>
		<Item {value} {mapping} />
	</button>
</rkt-toggle>
