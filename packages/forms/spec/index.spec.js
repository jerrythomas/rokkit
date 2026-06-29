import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all exports to verify barrel completeness
import * as formsExports from '../src/index.js'

describe('forms barrel (src/index.js)', () => {
	it('exports FormBuilder', () => {
		expect(formsExports.FormBuilder).toBeDefined()
	})

	it('exports createLookup and createLookupManager and clearLookupCache', () => {
		expect(formsExports.createLookup).toBeDefined()
		expect(formsExports.createLookupManager).toBeDefined()
		expect(formsExports.clearLookupCache).toBeDefined()
	})

	it('exports validation utilities', () => {
		expect(formsExports.validateField).toBeDefined()
		expect(formsExports.validateAll).toBeDefined()
		expect(formsExports.createMessage).toBeDefined()
		expect(formsExports.patterns).toBeDefined()
	})

	it('exports renderer utilities', () => {
		expect(formsExports.defaultRenderers).toBeDefined()
		expect(formsExports.resolveRenderer).toBeDefined()
	})

	it('exports schema and layout utilities', () => {
		expect(formsExports.getSchemaWithLayout).toBeDefined()
		expect(formsExports.findAttributeByPath).toBeDefined()
		expect(formsExports.deriveSchemaFromValue).toBeDefined()
		expect(formsExports.deriveLayoutFromValue).toBeDefined()
	})

	it('exports Svelte component constructors', () => {
		expect(formsExports.FormRenderer).toBeDefined()
		expect(formsExports.Input).toBeDefined()
		expect(formsExports.InputField).toBeDefined()
		expect(formsExports.InfoField).toBeDefined()
		expect(formsExports.StatusList).toBeDefined()
		expect(formsExports.StepIndicator).toBeDefined()
	})

	it('exports display components', () => {
		expect(formsExports.DisplayValue).toBeDefined()
		expect(formsExports.DisplaySection).toBeDefined()
		expect(formsExports.DisplayCardGrid).toBeDefined()
		expect(formsExports.DisplayList).toBeDefined()
	})

	it('exports input components', () => {
		expect(formsExports.InputText).toBeDefined()
		expect(formsExports.InputNumber).toBeDefined()
		expect(formsExports.InputCheckbox).toBeDefined()
		expect(formsExports.InputSelect).toBeDefined()
	})
})
