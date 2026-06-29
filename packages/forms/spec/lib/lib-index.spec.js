import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all exports to verify barrel completeness
import * as libExports from '../../src/lib/index.js'

describe('forms lib barrel (src/lib/index.js)', () => {
	it('exports FormBuilder', () => {
		expect(libExports.FormBuilder).toBeDefined()
	})

	it('exports evaluateCondition', () => {
		expect(libExports.evaluateCondition).toBeDefined()
	})

	it('exports validation utilities', () => {
		expect(libExports.validateField).toBeDefined()
		expect(libExports.validateAll).toBeDefined()
		expect(libExports.createMessage).toBeDefined()
		expect(libExports.patterns).toBeDefined()
	})

	it('exports schema utilities', () => {
		expect(libExports.deriveSchemaFromValue).toBeDefined()
		expect(libExports.deriveLayoutFromValue).toBeDefined()
		expect(libExports.getSchemaWithLayout).toBeDefined()
	})

	it('exports FormRenderer and Input components', () => {
		expect(libExports.FormRenderer).toBeDefined()
		expect(libExports.Input).toBeDefined()
	})
})
