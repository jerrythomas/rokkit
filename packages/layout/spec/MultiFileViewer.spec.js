import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import MultiFileViewer from '../src/MultiFileViewer.svelte'

describe('MultiFileViewer.svelte', () => {
	const fields = { text: 'file', icon: 'language' }
	const items = [
		{ file: 'App.svelte', language: 'svelte', code: '<script>...</script>' },
		{ file: 'main.js', language: 'js', code: 'console.log("Hello world!")' }
	]
	beforeEach(() => {
		cleanup()
	})

	it('should render', () => {
		const { container } = render(MultiFileViewer, {
			items,
			fields,
			value: items[0]
		})
		expect(container).toMatchSnapshot()
	})
})
