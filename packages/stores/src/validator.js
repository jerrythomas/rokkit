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
 *
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
 *
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
	return (input) => typeof input === type
}

/**
 * Get a validator function for the given rule.
 *
 * @param {import('./types').ValidationRule} rule - The rule to get the validator for.
 * @returns {import('./types').ValidationFunction} - The validator function.
 * @throws {Error} - If the rule is invalid.
 */
function getValidator(rule) {
	if (typeof rule.validator === 'function') return rule.validator
	if (rule.pattern) return getPatternValidator(rule.pattern)
	if (rule.min || rule.max) return getRangeValidator(rule.min, rule.max)
	if (rule.type) return getTypeValidator(rule.type)

	throw new Error('Invalid rule')
}

/**
 * Evaluate the validation rules for the given value.
 *
 * @param {*} value - The value to evaluate.
 * @param {Array<import('./types').ValidationRule>} rules - An array of validation rules.
 * @returns {import('./types').ValidationResult} - The result of the evaluation.
 */
function evaluateRules(value, rules) {
	let status = 'passed'
	let validations = []

	rules.map((rule) => {
		const valid = rule.validator(value)
		const result = {
			text: rule.text,
			valid,
			status: valid ? 'passed' : rule.optional ? 'warning' : 'failed'
		}

		if (status !== 'failed' && !valid) status = result.status
		validations.push(result)
	})

	return { value, status, validations, isValid: status === 'passed' }
}

/**
 * Create a custom Svelte store with validation rules.
 * @param {*} value - The initial value for the store.
 * @param {Array<import('./types').ValidationRule>} rules - An array of validation rules.
 * @returns {import('svelte').Writable<import('./types').ValidationResult>} - The custom Svelte store.
 */
export function verifiable(input, rules) {
	const result = writable({ value: input })

	rules = (rules ?? []).map((rule) => ({
		...rule,
		validator: getValidator(rule)
	}))

	const evaluate = (input) => result.set(evaluateRules(input, rules))

	evaluate(input)

	return {
		...omit(['set'], result),
		update: evaluate
	}
}
