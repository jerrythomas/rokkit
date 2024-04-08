import { identity, clone as copy } from 'ramda'
import { getDeepScanSample } from './infer'
import { getType } from './utils'

/**
 * A model is a representation of a dataset
 * @returns an object with methods to manipulate the model
 */
export function model() {
	let data = []

	const actions = {
		get: () => data,
		/*
		 * Creates a clone from another model
		 * @param {Object} other - the other model object to clone from
		 */
		clone: (other) => {
			data = copy(other.get())
			return actions
		},
		/**
		 * Renames the reference names using a renamer
		 * @param {Function} rename - the renamer function
		 */
		renameUsing: (rename = identity) => {
			if (rename !== identity) {
				data = data.map((x) => ({ ...x, name: rename(x.name) }))
			}
			return actions
		},
		/**
		 * Analyzes the input data and derives a model from it
		 *
		 * @param {Array|Object} value      - the data to derive the model from
		 * @param {boolean}      sparseData - indicates that rows may have missing attributes
		 * @returns {Object}     this
		 */
		from: (value, sparseData) => {
			data = deriveModel(value, sparseData)
			return actions
		},
		/**
		 * Merges the model with another model
		 *
		 * @param {Array}   other    - the model to merge with
		 * @param {Boolean} override - whether to override the type of the first model
		 * @returns {Object} this
		 */
		merge: (other, override = false) => {
			data = mergeModels(data, other.get(), override)
			return actions
		}
	}
	return actions
}

/**
 * Derives a model from the input data
 *
 * @param {Array|Object} data  - the data to derive the model from
 * @param {Boolean}      sparse - whether the data set contains sparse data
 * @returns {Array}             - the derived model
 */
function deriveModel(data, sparse = false) {
	const model = []
	let item = data

	if (Array.isArray(data)) item = sparse ? getDeepScanSample(data) : data[0]

	const kv = Object.entries(item)
	kv.forEach(([key, value]) => {
		model.push({
			name: key,
			type: getType(value)
		})
	})
	return model
}

/**
 * Merges two models, returning a new model
 *
 * @param {Array} first      - the first model
 * @param {Array} second     - the second model
 * @param {Boolean} override - whether to override the type of the first model
 * @returns {Array}      - the merged model
 */
function mergeModels(first, second, override = false) {
	second.forEach(({ name, type }) => {
		const existing = first.find((x) => x.name === name)
		if (existing) {
			if (existing.type !== type) existing.mixedTypes = true
			if (override) existing.type = type
		} else {
			first.push({ name, type })
		}
	})
	return first
}
