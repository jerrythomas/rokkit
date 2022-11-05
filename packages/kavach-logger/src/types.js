/** @typedef {'info'|'debug'|'trace'|'error'|'warn'} LogLevel */

/**
 * @typedef Logger
 * @property {(message?) => Promise<void>} info
 * @property {(message?) => Promise<void>} warn
 * @property {(message?) => Promise<void>} error
 * @property {(message?) => Promise<void>} debug
 * @property {(message?) => Promise<void>} trace
 */

/**
 * @typedef LogWriter
 * @property {(message) => Promise<void>} write
 */

/**
 * @typedef LoggerOptions
 * @property {LogLevel} [level]
 */

/**
 * @typedef LogData
 * @property {string} level
 * @property {boolean} browser
 * @property {number} sequence
 * @property {string} occurred_at
 * @property {string} session
 * @property {string} [ip_address]
 * @property {*} message
 */

/**
 * @method LogMethod
 * @param {LogData} message
 * @returns {Promise<void>}
 *
 */

export default {}
