/** @type {import('./types').LogLevel} */
export const DEFAULT_LOG_LEVEL = 'error'

/** @type {Object<import('./types').LogLevel, number>} */
export const LoggingLevels = {
	error: 1,
	warn: 2,
	info: 3,
	debug: 4,
	trace: 5
}
