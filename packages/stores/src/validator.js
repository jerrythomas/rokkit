import { writable } from 'svelte/store'
import { omit } from 'ramda'

/**
 * Get a validator function that takes a regex expression and returns a validation function
 *
 * @param {string|RegExp} pattern
 * @returns {import('./types').ValidationFunction}
 */
export function getPatternValidator(pattern) {
	if (typeof pattern === 'string') {
		return (input) => input && input.match(pattern) != null
	} else if (pattern instanceof RegExp) {
		return (input) => input && pattern.test(input)
	} else {
		throw new Error('Invalid pattern')
	}
}

/**
 * Get a validator function that takes a min and max value and returns a validation function
 * @param {number} min
 * @param {number} max
 * @returns {import('./types').ValidationFunction}
 */
export function getRangeValidator(min, max) {
	if (min == null)
		return (input) => input !== null && !isNaN(input) && input <= max
	if (max == null)
		return (input) => input !== null && !isNaN(input) && input >= min
	return (input) =>
		input !== null && !isNaN(input) && input >= min && input <= max
}

/**
 * Get a validator function that takes a type and returns a validation function
 * @param {string} type
 * @returns {import('./types').ValidationFunction}
 * @throws {Error} - If the type is invalid
 */
export function getTypeValidator(type) {
	if (type === 'number') return (input) => input !== null && !isNaN(input)
	if (type === 'email') return getPatternValidator(/^[^@]+@[^@]+\.[^@]+$/)
	if (type === 'url') return getPatternValidator(/^(https?:\/\/\S+)$/)
	if (type === 'color') return getPatternValidator(/^#[0-9a-fA-F]{6}$/)
	if (type === 'array') return (input) => Array.isArray(input)
	if (type === 'object')
		return (input) =>
			input !== null && typeof input === 'object' && !Array.isArray(input)
}
/**
 * Evaluate the validation rules for the given value.
 * @param {*} value - The value to evaluate.
 * @param {Array<import('./types').ValidationRule>} rules - An array of validation rules.
 * @returns {import('./types').ValidationResult} - The result of the evaluation.
 */
function evaluateRules(value, rules) {
	let status = 'success'
	let validations = []

	rules.map((rule) => {
		let valid = rule.validator(value)
		let props = rule.optional ? { optional: rule.optional } : {}
		if (status !== 'error' && !valid) {
			status = rule.optional ? 'warning' : 'error'
		}
		validations.push({ text: rule.text, valid, ...props })
	})

	return { value, status, validations, isValid: status === 'success' }
}

/**
 * Get a validator function for the given rule.
 * @param {import('./types').ValidationRule} rule - The rule to get the validator for.
 * @returns {import('./types').ValidationFunction} - The validator function.
 * @throws {Error} - If the rule is invalid.
 */
function getValidator(rule) {
	if (rule.validator) return rule.validator
	if (rule.pattern) return getPatternValidator(rule.pattern)
	if (rule.min || rule.max) return getRangeValidator(rule.min, rule.max)
	if (rule.type) return getTypeValidator(rule.type)

	throw new Error('Invalid rule')
}

/**
 * Create a custom Svelte store with validation rules.
 * @param {*} value - The initial value for the store.
 * @param {ValidationRule[]} rules - An array of validation rules.
 * @returns {Writable<import('./types').ValidationResult>} - The custom Svelte store.
 */
export function verifiable(input, rules) {
	const result = writable({ value: input })

	rules = rules.map((rule) => ({
		...rule,
		validator: getValidator(rule)
	}))

	result.set(evaluateRules(input, rules))

	return {
		...omit(['set'], result),
		update: (value) => {
			result.set(evaluateRules(value, rules))
		}
	}
}
