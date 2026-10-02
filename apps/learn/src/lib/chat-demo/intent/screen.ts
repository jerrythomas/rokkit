/* What is on screen is not stored: it is the last `demo` block the conversation shows. A
 * resumed conversation therefore knows its screen with nothing extra persisted.
 */
import type { ChatTurn, DemoBlock } from '../types'
import type { Screen } from './types'

export function screenFrom(turns: ChatTurn[]): Screen | null {
	for (let t = turns.length - 1; t >= 0; t--) {
		const turn = turns[t]
		if (turn.role !== 'assistant') continue
		const block = turn.blocks.findLast((b): b is DemoBlock => b.kind === 'demo')
		if (block) {
			const { kind: _, ...screen } = block
			return screen
		}
	}
	return null
}
