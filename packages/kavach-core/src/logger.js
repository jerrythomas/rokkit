import { DEFAULT_LOG_LEVEL, LoggingLevels, no_log } from './constants'

const running_on = typeof window === 'undefined' ? 'server' : 'browser'

/** @type {Object<string, number>} */
let sessions = {}

/**
 *
 * @param {string} session
 * @returns
 */
export function getSessionSequence(session) {
	if (session in sessions) {
		sessions[session]++
	} else {
		sessions[session] = 1
	}
	return sessions[session]
}

/**
 * @param {import('./types').LogWriter} writer
 * @param {String} level
 * @param {Object} message
 */
export async function log(writer, level, message, session = 'anonymous') {
	const currentDate = new Date()
	const logged_at = currentDate.toISOString()
	const sequence = getSessionSequence(session)
	await writer.write({
		level,
		running_on,
		logged_at,
		sequence,
		session,
		message
	})
}

/**
 * Get a logger object using a writer an dlog level
 *
 * @param {*} writer  Any writer object with a write method
 * @param {import('./types').LoggerOptions} options
 * @returns {import('./types').Logger}
 */
export function getLogger(writer, options = {}) {
	const level = options?.level ?? DEFAULT_LOG_LEVEL

	const levelValue =
		level in LoggingLevels
			? LoggingLevels[level]
			: LoggingLevels[DEFAULT_LOG_LEVEL]

	const logger = Object.entries(LoggingLevels)
		.map(([logLevel, value]) => ({
			[logLevel]:
				value <= levelValue
					? async (/** @type {Object} */ message) =>
							await log(writer, logLevel, message)
					: no_log
		}))
		.reduce((acc, orig) => ({ ...acc, ...orig }), {})

	// @ts-ignore
	return logger
}
