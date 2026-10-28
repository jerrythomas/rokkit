import { describe, it, expect } from 'vitest'
import { loadConfig, inkContrast, inkRampProblems } from '@rokkit/unocss'
import { generateZenSumiConfig } from '../src/init.js'

/**
 * The zen-sumi starter `rokkit init` writes holds the ink contract: every ink tone reads at AA
 * on paper and paper-soft in both modes, strongest first (see @rokkit/unocss inkRampProblems).
 */
describe('zen-sumi starter', () => {
	const starter = generateZenSumiConfig()
	const config = loadConfig(starter)

	it.each(['light', 'dark'])('every ink tone is readable on paper and paper-soft in %s', (mode) => {
		expect(inkRampProblems(inkContrast(config, starter.skin, mode))).toEqual([])
	})
})
