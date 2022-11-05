import { describe, expect, it, vi, afterEach } from 'vitest'
import { getLogger } from '../src/logger'
import { LoggingLevels } from '../src/constants'

describe('Logger', () => {
	const levels = Object.entries(LoggingLevels)
	const writer = {
		write: vi.fn()
	}

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('should create a logger', () => {
		const logger = getLogger(writer)
		expect(Object.keys(logger)).toEqual(Object.keys(LoggingLevels))
		logger.error({})
		expect(writer.write).toHaveBeenCalledOnce()
		logger.info({})
		logger.warn({})
		logger.debug({})
		logger.trace({})
		expect(writer.write).toHaveBeenCalledOnce()
	})

	it('should create a logger when invalid level is passed', () => {
		const logger = getLogger(writer, { level: 'invalid' })
		logger.error({})
		logger.info({})
		logger.warn({})
		logger.debug({})
		logger.trace({})
		expect(writer.write).toHaveBeenCalledOnce()
	})

	it.each(levels)(
		'should create a logger with level = "%s"',
		(level, count) => {
			const logger = getLogger(writer, { level })

			logger.error({})
			logger.warn({})
			logger.info({})
			logger.debug({})
			logger.trace({})
			expect(writer.write).toHaveBeenCalledTimes(count)
		}
	)
})
