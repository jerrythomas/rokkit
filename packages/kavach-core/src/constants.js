export const no_log = async () => {}

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

export const ZERO_LOGGER = {
	info: no_log,
	warn: no_log,
	debug: no_log,
	error: no_log,
	trace: no_log
}
