import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { getLogger } from '../src/logger'
import { LoggingLevels, ZERO_LOGGER } from '../src/constants'
import { logged_data } from './helpers'

/**
 * @vitest-environment jsdom
 */
describe('Logger on browser', () => {
	const levels = Object.entries(LoggingLevels)
	const running_on = 'browser'
	const writer = {
		write: vi.fn()
	}
	let sequence = 1
	let date = new Date()

	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(date)
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.useRealTimers()
	})

	it('should create a logger', () => {
		const logger = getLogger(writer)
		expect(Object.keys(logger)).toEqual(Object.keys(LoggingLevels))

		expect(logger.error({})).toBeTruthy()
		expect(writer.write).toHaveBeenCalledWith(
			logged_data('error', date, {}, sequence++, running_on)
		)
		expect(logger.info({})).toBeTruthy()
		expect(logger.warn({})).toBeTruthy()
		expect(logger.debug({})).toBeTruthy()
		expect(logger.trace({})).toBeTruthy()
		expect(writer.write).toHaveBeenCalledOnce()
	})

	it('should create a logger when invalid level is passed', () => {
		const logger = getLogger(writer, { level: 'invalid' })

		expect(logger.error({})).toBeTruthy()
		expect(writer.write).toHaveBeenCalledWith(
			logged_data('error', date, {}, sequence++, running_on)
		)
		expect(logger.info({})).toBeTruthy()
		expect(logger.warn({})).toBeTruthy()
		expect(logger.debug({})).toBeTruthy()
		expect(logger.trace({})).toBeTruthy()
		expect(writer.write).toHaveBeenCalledOnce()
	})

	it.each(levels)(
		'should create a logger using level = "%s" on browser env',
		(level, count) => {
			const logger = getLogger(writer, { level })
			Object.entries(LoggingLevels).map(([name, value]) => {
				logger[name]({ l: sequence })
				if (level >= value)
					expect(writer.write).toHaveBeenCalledWith(
						logged_data('error', date, { l: sequence }, sequence++, running_on)
					)
			})
			expect(writer.write).toHaveBeenCalledTimes(count)
		}
	)

	it('should create a zero logger', () => {
		const logger = ZERO_LOGGER
		expect(logger.error({})).toBeTruthy()
		expect(logger.info({})).toBeTruthy()
		expect(logger.warn({})).toBeTruthy()
		expect(logger.debug({})).toBeTruthy()
		expect(logger.trace({})).toBeTruthy()
	})
})
