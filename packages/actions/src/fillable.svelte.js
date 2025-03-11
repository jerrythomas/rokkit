import { on } from 'svelte/events'
/**
 * Initialize empty fillable element style and add listener for click
 *
 * @param {HTMLCollection} blanks
 * @param {EventListener} click
 */
function initialize(blanks, click) {
	const registry = []
	Array.from(blanks).forEach((blank, ref) => {
		blank.innerHTML = '?'
		blank.classList.add('empty')
		blank.name = `fill-${ref}`
		blank['data-index'] = ref
		const cleanup = on(blank, 'click', click)
		registry.push(cleanup)
	})
	return registry
}

/**
 * Fill current blank with provided option
 *
 * @param {HTMLCollection} blanks
 * @param {Array<import('./types.js').FillableData>} options
 * @param {*} current
 */
function fill(blanks, { options, current }, node) {
	if (current > -1 && current < Object.keys(blanks).length) {
		const index = options.findIndex(({ actualIndex }) => actualIndex === current)
		if (index > -1) {
			blanks[current].innerHTML = options[index].value
			blanks[current].classList.remove('empty')
			blanks[current].classList.add('filled')
			node.dispatchEvent(
				new CustomEvent('fill', {
					detail: {
						index: current,
						value: options[index].value
					}
				})
			)
		}
	}
}

/**
 * Clear all fillable elements
 *
 * @param {EventListener} event
 * @param {HTMLElement} node
 */
function clear(event, node, options) {
	const item = options.find(({ value }) => value === event.target.innerHTML)
	event.target.innerHTML = '?'
	event.target.classList.remove('filled')
	event.target.classList.remove('pass')
	event.target.classList.remove('fail')
	event.target.classList.add('empty')

	node.dispatchEvent(
		new CustomEvent('remove', {
			detail: {
				index: event.target['data-index'],
				value: item.value
			}
		})
	)
}

/**
 * Validate the filled values
 *
 * @param {HTMLCollection} blanks
 * @param {import('./types').FillOptions} data
 */
function validate(blanks, data) {
	Object.keys(blanks).forEach((_, ref) => {
		const index = data.options.findIndex(({ actualIndex }) => actualIndex === ref)
		if (index > -1)
			blanks[ref].classList.add(
				data.options[index].expectedIndex === data.options[index].actualIndex ? 'pass' : 'fail'
			)
	})
}

/**
 * Action for filling a <del>?</del> element in html block.
 *
 * @param {HTMLElement} node
 * @param {import('./types').FillOptions} options
 * @returns
 */
export function fillable(node, data) {
	const blanks = node.getElementsByTagName('del')

	function click(event) {
		if (event.target.innerHTML !== '?') {
			clear(event, node, data.options)
		} else {
			data.current = event.target['data-index']
			fill(blanks, data, node)
		}
	}

	$effect(() => {
		const registry = initialize(blanks, click)

		if (data.check) validate(blanks, data)

		return () => {
			registry.forEach((cleanup) => cleanup())
		}
	})
}
