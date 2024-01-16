import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { generateIndex } from '../src/lib'
import TreeTable from '../src/TreeTable.svelte'

describe('TreeTable.svelte', () => {
	beforeEach(() => cleanup())

	it('should render using default field mapping', () => {
		const data = generateIndex([
			{ scope: '#/root', key: 'root', type: 'object' },
			{ scope: '#/root/one', key: 'one', type: 'string', value: 'one' },
			{ scope: '#/root/two', key: 'two', type: 'string', value: 200 }
		])
		const { container } = render(TreeTable, {
			data,
			columns: [
				{ key: 'scope', label: 'path', path: true, width: '50%', fields: { text: 'key' } },
				{ key: 'value', label: 'Value', width: '50%' }
			]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render using field mappings', () => {})
	it('should render items using custom component', () => {})
	it('should expand and collapse', () => {})
	it('should autoclose others', () => {})
	it('should pass select and change events', () => {})
})
