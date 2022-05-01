const KEYS = ['x', 'y', 'keyframe', 'fill', 'pattern', 'color']

// Input will be an array of values, having a unique key attribute or a group attribute
// in case of charts that are based on summarized data
//
//
// 1. Find unique id's
// 2. Group by keyframe key
// 3. For each frame add dummy row for missing key, if key exists in previous row copy over the key data to next frame

// each chart type requires a different aggregation
// 1: we group by keyframe
// 2: (if agg metric) we group by and aggregate using the group key
// 3: impute missing values (defaults need to be identified for each type)
// 4: impute should carry over values from previous frame (applies to most cases where )
// 5: sort by grouping key to ensure consistency in case of animations
//
// Sorting is optional when keyframes are not present

class Chart {
	#data = []
	#uniqueKeys = []
	#computed = writable([])

	constructor(data, key) {
		this.#uniqueKeys = [...new Set(data.map((item) => item[key]))]
		this.data = data
	}

	fields(kv) {
		const keys = keys.map((key) => {
			this.keys[key] = kv[key]
		})
		if (keyframe in kv) {
			nest()
		}
		return this
	}
	aes() {
		return this
	}
	compute() {
		return this
	}
	aggregate(agg) {
		return this
	}

	data() {
		return this.#computed
	}
}

// let kf = chart(data)
// 	.aes(x, y, value, fill, color)
// 	.timelapse(time, group)
// 	.compute()
// 	.keyframes()

// let d = tweened(kf[0], { delay: 0, duration: 200, easing: cubicOut })

// TimerComponent()
// timer(kf.length, inderval)

// // timelapse with aggregation may need to rely on the grouped data coming from db
