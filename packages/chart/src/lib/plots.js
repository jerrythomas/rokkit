import * as Plot from '@observablehq/plot'

export function plotter(node, options) {
	let { data, aes, type, opts } = options
	// let chart = Plot.lineY(options.data).plot({ grid: true })

	function render() {
		const chart = Plot[type](data, aes).plot({
			color: { scheme: 'turbo', range: [0.1, 0.9] },
			...opts
		})
		node.firstChild?.remove() // remove old chart, if any
		node.append(chart)
	}
	render()

	return {
		update: (options) => {
			data = options.data
			aes = options.aes
			type = options.type
			opts = options.opts
			render()
		}
	}
}
