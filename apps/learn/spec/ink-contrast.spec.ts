import { describe, it, expect } from 'vitest'
import { loadConfig, inkContrast, inkRampProblems } from '@rokkit/unocss'
import learnConfig from '../rokkit.config.js'

/**
 * The learn site's skins hold the ink contract: every ink tone reads at AA on paper and
 * paper-soft in both modes, strongest first (see @rokkit/unocss inkRampProblems).
 */
const config = loadConfig(learnConfig)

describe.each(Object.entries(learnConfig.skins))('learn skin %s', (_name, mapping) => {
	it.each(['light', 'dark'] as const)('every ink tone is readable on paper and paper-soft in %s', (mode) => {
		expect(inkRampProblems(inkContrast(config, mapping, mode))).toEqual([])
	})
})
