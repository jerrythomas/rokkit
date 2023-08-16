export class SizeManager {
	constructor(count, defaultSize = 40) {
		this.defaultSize = defaultSize
		this.reset(count)
	}

	reset(count) {
		this.averageSize = this.defaultSize
		this.sizes = Array(count).fill(null)
	}

	updateCount(count = null) {
		if (count === null || count === this.sizes.length) return

		if (count > this.sizes.length) {
			this.sizes = this.sizes.concat(
				Array(count - this.sizes.length).fill(null)
			)
		} else {
			this.reset(count)
		}
		this.updateAverage()
	}

	updateSizes(elements, prop, start = 0) {
		elements.forEach((element, index) => {
			if (index + start < this.sizes.length)
				this.sizes[index + start] = element[prop]
		})
		this.updateAverage()
	}

	updateAverage() {
		let totalSize = this.sizes.reduce(
			(acc, size) => acc + (size ?? this.averageSize),
			0
		)
		this.averageSize = totalSize / (this.sizes.length || 1)
	}

	calculateSum(start, end) {
		return this.sizes
			.slice(start, end)
			.map((size) => size ?? this.averageSize)
			.reduce((acc, size) => acc + size, 0)
	}
}
