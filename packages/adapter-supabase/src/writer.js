import { createClient } from '@supabase/supabase-js'

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
 * @typedef SupabaseLogWriterOptions
 * @property {string} [schema]
 * @property {string} table
 */

/**
 *
 * @param {*} config
 * @param {SupabaseLogWriterOptions} options
 * @returns
 */
export function getLogWriter(config, options) {
	const client = createClient(config.supabaseUrl, config.supabaseAnonKey)
	const write = async (/** @type {LogData} */ data) => {
		await client.from(options.table).insert(data)
	}

	return { write }
}
