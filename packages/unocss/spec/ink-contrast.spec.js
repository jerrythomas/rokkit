import { describe, it, expect } from 'vitest'
import { inkContrast, inkRampProblems } from '../src/contrast.js'
import { loadConfig } from '../src/config.js'
import { BUILTIN_SKINS } from '../src/builtin-skins.js'

/**
 * Every ink tone is a text tone: ink, ink-mute, ink-soft and ink-faint each clear WCAG AA
 * (4.5:1) against paper AND paper-soft, in both modes, and keep rokkit's order — ink reads
 * strongest, ink-faint weakest, each step distinct. `inkRampProblems` states that contract;
 * the cli's zen-sumi starter and the learn app's config are held to it in their own specs.
 */
const TONES = ['ink', 'ink-mute', 'ink-soft', 'ink-faint']

describe('inkContrast', () => {
	it('measures each ink tone against paper and paper-soft', () => {
		const config = loadConfig({
			palettes: {
				grey: {
					50: '#ffffff',
					100: '#ffffff',
					600: '#000000',
					700: '#000000',
					800: '#000000',
					900: '#000000'
				}
			}
		})
		const rows = inkContrast(config, { surface: 'grey', ink: 'grey' }, 'light')
		expect(rows).toEqual(TONES.map((token) => ({ token, paper: 21, paperSoft: 21 })))
	})

	it('resolves a dual palette to the side for the mode', () => {
		const config = loadConfig({
			palettes: {
				day: { 50: '#ffffff', 100: '#ffffff', 600: '#000000', 700: '#000000', 800: '#000000', 900: '#000000' },
				night: { 50: '#000000', 100: '#000000', 600: '#000000', 700: '#000000', 800: '#000000', 900: '#000000' }
			}
		})
		const mapping = { surface: { light: 'day', dark: 'night' }, ink: { light: 'day', dark: 'night' } }
		expect(inkContrast(config, mapping, 'light')[0].paper).toBe(21)
		expect(inkContrast(config, mapping, 'dark')[0].paper).toBe(1)
	})
})

describe('inkRampProblems', () => {
	const row = (token, paper, paperSoft = paper) => ({ token, paper, paperSoft })

	it('is empty for a readable ramp in order', () => {
		expect(inkRampProblems([row('ink', 16), row('ink-mute', 9), row('ink-soft', 6.5), row('ink-faint', 5.4)])).toEqual([])
	})

	it('names a tone under AA on paper or on paper-soft', () => {
		expect(
			inkRampProblems([row('ink', 16), row('ink-mute', 9), row('ink-soft', 4.6, 4.4), row('ink-faint', 2)])
		).toEqual([
			'ink-soft on paper-soft is 4.40:1 (need 4.5)',
			'ink-faint on paper is 2.00:1 (need 4.5)',
			'ink-faint on paper-soft is 2.00:1 (need 4.5)'
		])
	})

	it('names a tone that does not read weaker than the one before it', () => {
		expect(
			inkRampProblems([row('ink', 16), row('ink-mute', 9), row('ink-soft', 9.1), row('ink-faint', 5)])
		).toEqual(['ink-soft (9.10:1) does not read weaker than ink-mute (9.00:1)'])
	})
})

describe.each(Object.entries(BUILTIN_SKINS))('built-in skin %s', (_name, mapping) => {
	it.each(['light', 'dark'])('every ink tone is readable on paper and paper-soft in %s', (mode) => {
		expect(inkRampProblems(inkContrast(loadConfig({}), mapping, mode))).toEqual([])
	})
})
