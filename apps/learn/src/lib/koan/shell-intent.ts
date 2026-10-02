/* What the Koan /app shell does with a message, read by the chat's local interpreter
 * (`chat-demo/intent`) against the demo on the canvas. The shell renders its own conversation,
 * so a reading becomes one of four shell actions rather than chat blocks.
 */
import { interpretLocally } from '$lib/chat-demo/intent/local'
import { validate } from '$lib/chat-demo/intent/validate'
import { hrefOf } from '$lib/chat-demo/intent/demos'
import type { Interpretation, Screen } from '$lib/chat-demo/intent/types'

export type ShellAction =
	/** Open a demo (and variant). */
	| { kind: 'goto'; href: string }
	/** Set props on the demo on the canvas. */
	| { kind: 'tweak'; props: Record<string, unknown> }
	/** Open a demo's docs view. */
	| { kind: 'docs'; href: string }
	/** Ask back: the message did not place. */
	| { kind: 'ask' }

const withVariant = (demo: string, variant?: string) =>
	`${hrefOf(demo)}${variant ? `?variant=${encodeURIComponent(variant)}` : ''}`

const ACTIONS: Record<Interpretation['intent'], (i: Interpretation) => ShellAction> = {
	show: (i) => ({ kind: 'goto', href: withVariant(i.demo as string, i.variant) }),
	modify: (i) => (i.variant ? { kind: 'goto', href: withVariant(i.demo as string, i.variant) } : { kind: 'tweak', props: i.props ?? {} }),
	explain: (i) => ({ kind: 'docs', href: hrefOf(i.demo as string) }),
	// The canvas holds no dataset to reshape.
	reshape: () => ({ kind: 'ask' }),
	clarify: () => ({ kind: 'ask' })
}

export function shellAction(message: string, canvas: Screen | null): ShellAction {
	const reading = validate(interpretLocally(message, canvas), canvas)
	return ACTIONS[reading.intent](reading)
}
