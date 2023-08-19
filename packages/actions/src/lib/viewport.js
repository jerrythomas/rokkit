export class ViewPort {
	constructor(count, availableSize, defaultSize = 40) {
		this._defaultSize = defaultSize
		this._availableSize = availableSize
		this._previousStart = -1
		this._previousEnd = -1
		this._visibleCount = 1
		this._start = 0
		this._end = -1
		this._visibleSize = this._availableSize
		this._spaceBefore = 0
		this._spaceAfter = 0
		this.reset(count)
		// this.updateStartEnd(0, 0)
	}

	/**
	 * @param {number} value
	 */
	set count(value) {
		this.updateCount(value)
	}

	/**
	 * @param {number} value
	 */
	set availableSize(value) {
		this._availableSize = value
		this.adjustViewport()
	}

	get index() {
		return this._index
	}
	set index(value) {
		if (this._sizes.length > 0)
			this._index = Math.max(0, Math.min(this._sizes.length - 1, value))
		else this._index = -1

		if (this._index > -1) this.adjustForCurrentPosition()
	}

	get visibleCount() {
		return this._visibleCount
	}
	get averageSize() {
		return this._averageSize
	}
	get visibleSize() {
		return this._visibleSize
	}
	get spaceBefore() {
		return this._spaceBefore
	}
	get spaceAfter() {
		return this._spaceAfter
	}
	get start() {
		return this._start
	}
	get end() {
		return this._end
	}
	get viewChanged() {
		return (
			this._start !== this._previousStart || this._end !== this._previousEnd
		)
	}

	calculateSum(start, end) {
		return this._sizes
			.slice(start, end)
			.map((size) => size ?? this._averageSize)
			.reduce((acc, size) => acc + size, 0)
	}

	updateCount(count = null) {
		if (count === null || count === this._sizes.length) return
		this._previousStart = this.start
		this._previousEnd = this.end

		if (count > this._sizes.length) {
			this._sizes = this._sizes.concat(
				Array(count - this._sizes.length).fill(null)
			)
		} else {
			this.reset(count)
		}
		if (this.end > count) {
			this._end = count
			this._start = Math.max(0, this._end - this._visibleCount)
		}
		this.updateAverage()
	}

	reset(count) {
		this._averageSize = this._defaultSize
		this._sizes = Array(count).fill(null)
		this._index = -1
	}

	updateStartEnd(newStart, newEnd) {
		this._previousStart = this._start
		this._previousEnd = this._end
		this._start = newStart ?? this._start
		this._end = newEnd ?? this._end
		this.adjustViewport()
	}

	moveByOffset(offset) {
		let position = Math.max(
			0,
			Math.min(this._index + offset, this._sizes.length - 1)
		)
		this.index = position
	}

	updateAverage() {
		let totalSize = this._sizes.reduce(
			(acc, size) => acc + (size ?? this._averageSize),
			0
		)
		this._averageSize =
			this._sizes.length > 0
				? totalSize / this._sizes.length
				: this._defaultSize
	}

	updateSizes(elements, prop) {
		elements.forEach((element, index) => {
			if (index + this.start < this._sizes.length)
				this._sizes[index + this.start] = element[prop]
		})
		this.updateAverage()
		this.adjustViewport()
	}

	calculate() {
		this._visibleSize = this.calculateSum(this._start, this._end)
		this._spaceBefore = this.calculateSum(0, this._start)
		this._spaceAfter = this.calculateSum(this._end, this._sizes.length)
	}

	adjustForCurrentPosition() {
		if (this._index > this._end - 1) {
			this._end = Math.min(this._index + 1, this._sizes.length)
			this._start = this._end - this._visibleCount
		} else if (this._index < this._start) {
			this._start = Math.max(0, this._index)
			this._end = this._start + this._visibleCount
		}
		this.calculate()
	}

	adjustViewport() {
		this._visibleCount = Math.ceil(this._availableSize / this._averageSize)
		this._end = Math.min(this._start + this._visibleCount, this._sizes.length)
		this.calculate()
	}

	next() {
		this.moveByOffset(1)
	}
	previous() {
		this.moveByOffset(-1)
	}
	first() {
		this.moveByOffset(-this._sizes.length)
	}
	last() {
		this.moveByOffset(this._sizes.length)
	}
	nextPage() {
		this.moveByOffset(this.visibleCount)
	}
	previousPage() {
		this.moveByOffset(-this.visibleCount)
	}
}

export class ResizableViewport extends ViewPort {
	constructor(count, availableSize, maxVisible, defaultSize) {
		super(count, availableSize, defaultSize)
		this._visibleCount = maxVisible
		this.updateStartEnd(0, 0)
	}

	adjustViewport() {
		// if (!this._visibleCount) return

		this._end = Math.min(this._start + this._visibleCount, this._sizes.length)
		if (this._end < this._start + this._visibleCount)
			this._start = Math.max(0, this._end - this._visibleCount)
		this.calculate()
	}
}

export class FillableViewport extends ViewPort {
	adjustViewport() {
		this._visibleCount = Math.ceil(this._availableSize / this._averageSize)
		this._end = Math.min(this._start + this._visibleCount, this._sizes.length)

		let visible = this.calculateSum(this._start, this._end)

		if (visible < this._availableSize) {
			if (this._end === this._sizes.length) {
				while (visible < this._availableSize && this._start > 0) {
					this._start--
					this._visibleCount--
					visible += this._sizes[this._start] ?? this._averageSize
				}
			} else {
				while (
					visible < this._availableSize &&
					this._end < this._sizes.length
				) {
					this._end += 1
					this._visibleCount += 1
					visible += this._sizes[this._end] ?? this._averageSize
				}
			}
		} else {
			let lastSize = this._sizes[this._end - 1] ?? this._averageSize

			while (
				visible - lastSize > this._availableSize &&
				this._end > this._start
			) {
				visible -= lastSize
				this._end -= 1
				this._visibleCount -= 1
				lastSize = this._sizes[this._end - 1] ?? this._averageSize
			}
		}
		this.calculate()
	}
}

export function ViewportFactory(
	count,
	availableSize,
	maxVisible = null,
	defaultSize = 40
) {
	if (maxVisible) {
		// console.log('factory', maxVisible)
		return new ResizableViewport(count, availableSize, maxVisible, defaultSize)
	} else {
		return new FillableViewport(count, availableSize, defaultSize)
	}
}
