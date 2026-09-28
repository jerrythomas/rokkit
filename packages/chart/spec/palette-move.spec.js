import { describe, it, expect } from 'vitest'
import { assignColors } from '../src/lib/brewing/colors.js'

// The palette moved to @rokkit/core. These are the colours chart resolved BEFORE the
// move, recorded so the move is provably value-preserving. If this fails, the move
// changed chart's output — which is the one thing it must not do.
describe('chart colours survive the palette move', () => {
	it('assigns the same light-mode fill/stroke pairs as before the move', () => {
		const colors = assignColors(['a', 'b', 'c'], 'light')

		expect(colors.get('a')).toEqual({ fill: '#99e0ff', stroke: '#0061bd' })
		expect(colors.get('b')).toEqual({ fill: '#9be8c6', stroke: '#13943c' })
		expect(colors.get('c')).toEqual({ fill: '#fad7c8', stroke: '#b34242' })
	})
})
