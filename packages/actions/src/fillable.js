/**
 * @typedef FillOptions
 * @property {Array<string>} options available options to fill
 * @property {integer} current       index of option to be filled
 * @property {boolean} check         validate filled values
 */
/**
 * Action for filling a <del>?</del> element in html block.
 *
 * @param {*} node
 * @param {FillOptions} options
 * @returns
 */
export function fillable(node, { options, current, check }) {
	let data = { options, current, check }
	let blanks = node.getElementsByTagName('del')

	function click(event) {
		if ('?' !== event.target.innerHTML) {
			clear(event, node)
		}
	}

	initialize(blanks, click)

	return {
		update({ options, current }) {
			data.options = options
			data.current = current
			data.check = check

			fill(blanks, data.options, data.current)
			if (data.check) validate(blanks, data)
		},
		destroy() {
			Object.keys(blanks).map((ref) => {
				blanks[ref].removeEventListener('click', click)
			})
		}
	}
}

/**
 * Initialize empty fillable element style and add listener for click
 *
 * @param {*} blanks
 * @param {*} click
 */
function initialize(blanks, click) {
	Object.keys(blanks).map((ref) => {
		blanks[ref].addEventListener('click', click)
		blanks[ref].classList.add('empty')
		blanks[ref].name = 'fill-' + ref
		blanks[ref]['data-index'] = ref
	})
}

/**
 * Fill current blank with provided option
 *
 * @param {*} blanks
 * @param {*} options
 * @param {*} current
 */
function fill(blanks, options, current) {
	if (current > -1 && current < Object.keys(blanks).length) {
		let index = options.findIndex(({ actualIndex }) => actualIndex == current)
		if (index > -1) {
			blanks[current].innerHTML = options[index].value
			blanks[current].classList.remove('empty')
			blanks[current].classList.add('filled')
		}
	}
}

/**
 * Clear all fillable elements
 *
 * @param {*} event
 * @param {*} node
 */
function clear(event, node) {
	event.target.innerHTML = '?'
	event.target.classList.remove('filled')
	event.target.classList.remove('pass')
	event.target.classList.remove('fail')
	event.target.classList.add('empty')
	node.dispatchEvent(
		new CustomEvent('remove', {
			detail: {
				index: event.target.name.split('-')[1],
				value: event.target['data-index']
			}
		})
	)
}

/**
 * Validate the filled values
 *
 * @param {*} blanks
 * @param {*} data
 */
function validate(blanks, data) {
	Object.keys(blanks).map((ref) => {
		let index = data.options.findIndex(({ actualIndex }) => actualIndex == ref)
		if (index > -1)
			blanks[ref].classList.add(
				data.options[index].expectedIndex == data.options[index].actualIndex
					? 'pass'
					: 'fail'
			)
	})
}
