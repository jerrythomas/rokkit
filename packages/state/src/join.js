function validateCondition(condition) {
	if (typeof condition !== 'function') {
		throw new TypeError('Condition must be a function')
	}
}
/**
 * Joins two datasets together based on a condition. Result includes all rows from the first
 * dataset and matching rows from the second dataset. In case of multiple matches, all
 * combinations are returned. When combining the rows, the columns from the first dataset take
 * precedence.
 *
 * inner: only the rows that have a match in both datasets.
 * outer: all rows from the first dataset and matching rows from the second dataset.
 *
 * @param {Array}    first     - The first dataset to join.
 * @param {Array}    second    - The second dataset to join.
 * @param {Function} condition - The condition to join the datasets on.
 * @returns {Object}           - An object with the inner and outer join result.
 */
export function joinData(first, second, condition) {
	let inner = []
	const outer = []
	validateCondition(condition)

	first.forEach((f) => {
		const matches = second.filter((s) => condition(f, s)).map((m) => ({ ...m, ...f }))
		inner = inner.concat(matches)
		if (matches.length === 0) outer.push(f)
	})
	return { inner, outer }
}

/**
 * Filters the results of the first dataset based on the condition using the second dataset.
 *
 * @param {Array}    first     - The first dataset to filter.
 * @param {Array}    second    - The second dataset to filter by.
 * @param {Function} condition - The condition to filter the first dataset by.
 * @returns {Array}            - The filtered dataset.
 */
export function antiJoin(first, second, condition) {
	validateCondition(condition)
	return first.filter((f) => !second.find((s) => condition(f, s)))
}

/**
 * Joins two datasets together based on a condition. Result includes all rows from the first
 * dataset and matching rows from the second dataset. In case of multiple matches, all
 * combinations are returned. When combining the rows, the columns from the first dataset take
 * precedence.
 *
 * @param {Array}    first     - The first dataset to join.
 * @param {Array}    second    - The second dataset to join.
 * @param {Function} condition - The condition to join the datasets on.
 * @returns {Array}            - The joined dataset.
 */
export function innerJoin(first, second, condition) {
	const { inner } = joinData(first, second, condition)
	return inner
}

/**
 * Performs a left join on two datasets based on a condition. Result includes all rows from the first
 * dataset and matching rows from the second dataset. In case of multiple matches, all combinations
 * are returned. When combining the rows, the columns from the first dataset take precedence.
 * If there is no match in the second dataset, only the row from the first dataset is returned.
 *
 * This can be used to perform a right join by swapping the datasets.
 *
 * @param {Array}    first     - The first dataset to join.
 * @param {Array}    second    - The second dataset to join.
 * @param {Function} condition - The condition to join the datasets on.
 * @returns {Array}            - The joined dataset.
 */
export function leftJoin(first, second, condition) {
	const { inner, outer } = joinData(first, second, condition)
	return inner.concat(outer)
}

/**
 * Performs a right join on two datasets based on a condition.
 *   - Result includes all rows from the second dataset and matching rows from the first dataset.
 *   - In case of multiple matches, all combinations are returned.
 *   - When combining the rows, the columns from the first dataset take precedence.
 *   If there is no match in the first dataset, only the row from the second dataset is returned.
 *
 * @param {Array}    first     - The first dataset to join.
 * @param {Array}    second    - The second dataset to join.
 * @param {Function} condition - The condition to join the datasets on.
 * @returns {Array}            - The joined dataset.
 */
export function rightJoin(first, second, condition) {
	return leftJoin(second, first, condition)
}
/**
 * Performs a full join on two datasets based on a condition. Result includes all rows from both
 * datasets. In case of multiple matches, all combinations are returned. When combining the rows,
 * the columns from the first dataset take precedence. If there is no match in the second dataset,
 * only the row from the first dataset is returned. If there is no match in the first dataset, only
 * the row from the second dataset is returned.
 *
 * @param {Array}    first     - The first dataset to join.
 * @param {Array}    second    - The second dataset to join.
 * @param {Function} condition - The condition to join the datasets on.
 * @returns {Array}            - The joined dataset.
 */
export function fullJoin(first, second, condition) {
	const { inner, outer } = joinData(first, second, condition)
	const rightOuter = antiJoin(second, first, condition)
	return inner.concat(outer).concat(rightOuter)
}

/**
 * Performs a cross join on two datasets. Result includes all combinations of rows from both datasets.
 *
 * @param {Array} first  - The first dataset to join.
 * @param {Array} second - The second dataset to join.
 * @returns {Array}      - The joined dataset.
 */
export function crossJoin(first, second) {
	return first.map((f) => second.map((s) => ({ ...f, ...s }))).flat()
}

/**
 * Performs a semi join on two datasets based on a condition. Result includes all rows from the first
 * dataset that have a match in the second dataset.
 *
 * @param {Array}    first     - The first dataset to join.
 * @param {Array}    second    - The second dataset to join.
 * @param {Function} condition - The condition to join the datasets on.
 * @returns {Array}            - The joined dataset.
 */
export function semiJoin(first, second, condition) {
	validateCondition(condition)
	return first.filter((f) => second.find((s) => condition(f, s)))
}

/**
 * Performs a nested join on two datasets based on a condition. Result includes all rows from the first
 * dataset that have a match in the second dataset. The result is nested with the matching rows from the
 * second dataset.
 *
 * @param {Array}    first            - The first dataset to join.
 * @param {Array}    second           - The second dataset to join.
 * @param {Function} condition        - The condition to join the datasets on.
 * @param {String}   [key='children'] - The key to nest the matching rows under.
 * @returns {Array}            - The joined dataset.
 */
export function nestedJoin(first, second, condition, key = 'children') {
	validateCondition(condition)
	const result = first.map((f) => ({
		...f,
		[key]: second.filter((s) => condition(f, s))
	}))
	return result
}
