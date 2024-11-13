import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import Alerts from '../src/Alerts.svelte'
import { alerts } from '@rokkit/stores'
import { fade } from 'svelte/transition'

describe('Alerts.svelte', () => {
	const messages = [
		'A simple message',
		{ text: 'Message object', data: ['foo', 'bar'] },
		{ text: 'Message object with type', type: 'danger' },
		{ text: 'Message object with timeout', timeout: 5000 }
	]
	beforeEach(() => {
		cleanup()
		alerts.clear()
	})

	// Problem with svelte animations
	it('should render alerts', async () => {
		const { container } = render(Alerts)
		alerts.send(messages[0])
		await tick()
		expect(container).toMatchSnapshot()
	})

	// it('should render alerts with custom entry animation', async () => {
	// 	const { container } = render(Alerts, { props: { arrival: { animation: fade } } })
	// 	alerts.send(messages[1], 'info')
	// 	await tick()
	// 	expect(container).toMatchSnapshot()
	// })

	// it('should render alerts with custom exit animation', async () => {
	// 	const { container } = render(Alerts, { props: { departure: { animation: fade } } })
	// 	alerts.send(messages[2])
	// 	await tick()
	// 	expect(container).toMatchSnapshot()
	// })
})
