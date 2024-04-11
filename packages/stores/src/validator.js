import { writable } from 'svelte/store'
import { omit } from 'ramda'

const TYPE_VALIDATORS = {
	string: (input) => typeof input === 'string',
	number: (input) => input !== null && !isNaN(input),
	email: getPatternValidator(/^[^@]+@[^@]+\.[^@]+$/),
	url: getPatternValidator(/^(https?:\/\/\S+)$/),
	color: getPatternValidator(/^#[0-9a-fA-F]{6}$/),
	date: (input) => input !== null && !isNaN(new Date(input).getTime()),
	array: (input) => Array.isArray(input),
	object: (input) => input !== null && typeof input === 'object' && !Array.isArray(input)
}

/**
 * Get a validator function that takes a regex expression and returns a validation function
 *
 * @param {string|RegExp} pattern
 * @returns {import('./types').ValidationFunction}
 */
export function getPatternValidator(pattern) {
	if (typeof pattern === 'string') {
		return (input) => input && input.match(pattern) !== null
	} else if (pattern instanceof RegExp) {
		return (input) => input && pattern.test(input)
	} else {
		throw new Error('Invalid pattern')
	}
}

/**
 * Check if the input is a valid number
 *
 * @param {*} input
 * @returns {boolean}
 */
function isValidNumber(input) {
	return input !== null && input !== undefined && !isNaN(input)
}

/**
 * Get a validator function that takes a min and max value and returns a validation function
 *
 * @param {number} min
 * @param {number} max
 * @returns {import('./types').ValidationFunction}
 */
export function getRangeValidator(min, max) {
	if (!isValidNumber(min)) return (input) => isValidNumber(input) && input <= max
	if (!isValidNumber(max)) return (input) => isValidNumber(input) && input >= min
	return (input) => isValidNumber(input) && input >= min && input <= max
}

/**
 * Get a validator function that takes a type and returns a validation function
 *
 * @param {string} type
 * @returns {import('./types').ValidationFunction}
 * @throws {Error} - If the type is invalid
 */
export function getTypeValidator(type) {
	if (type in TYPE_VALIDATORS) return TYPE_VALIDATORS[type]

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
	const { validator, pattern = null, min = null, max = null, type = null } = rule
	const strategies = [
		{ satisfies: typeof validator === 'function', validator },
		{ satisfies: pattern !== null, validator: getPatternValidator(pattern ?? '*') },
		{ satisfies: min !== null || max !== null, validator: getRangeValidator(min, max) },
		{ satisfies: type !== null, validator: getTypeValidator(type) }
	]

	const result = strategies.find((x) => x.satisfies)
	if (result) return result.validator

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
	let status = 'pass'
	let validations = []

	rules.forEach((rule) => {
		const valid = rule.validator(value)
		const result = {
			text: rule.text,
			valid,
			status: valid ? 'pass' : rule.optional ? 'warn' : 'fail'
		}

		if (status !== 'fail' && !valid) status = result.status
		validations.push(result)
	})

	return { value, status, validations, isValid: status === 'pass' }
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

	const evaluate = (value) => result.set(evaluateRules(value, rules))

	evaluate(input)

	return {
		...omit(['set'], result),
		update: evaluate
	}
}
