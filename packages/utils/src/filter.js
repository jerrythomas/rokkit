export const filterOperations = {
	'=': (value, pattern) => value === pattern,
	'<': (value, pattern) => value < pattern,
	'>': (value, pattern) => value > pattern,
	'<=': (value, pattern) => value <= pattern,
	'>=': (value, pattern) => value >= pattern,
	'!=': (value, pattern) => value !== pattern,
	'~*': (value, pattern) => pattern.test(value),
	'~': (value, pattern) => pattern.test(value),
	'!~*': (value, pattern) => !pattern.test(value),
	'!~': (value, pattern) => !pattern.test(value)
}
