/* The Koan /app shell reads a message with the chat's local interpreter: a show opens any
 * catalogue demo (it used to reach only 14, and opened Tabs for everything else), a modify sets
 * the demo's props or variant, an explain opens its docs, and anything unclear is asked back.
 */
import { describe, it, expect } from 'vitest'
import { shellAction } from '../../src/lib/koan/shell-intent'

const tabs = { demo: 'tabs', props: {} }

describe('shellAction', () => {
	it('opens any catalogue demo — not only the 14 the shell knew', () => {
		expect(shellAction('pick a date', null)).toEqual({ kind: 'goto', href: '/app/date' })
		expect(shellAction('show me badges', null)).toEqual({ kind: 'goto', href: '/app/badge' })
	})

	it('opens a variant by its query parameter', () => {
		expect(shellAction('show me vertical tabs', null)).toMatchObject({ kind: 'goto', href: '/app/tabs' })
		expect(shellAction('with icons please', tabs)).toEqual({ kind: 'goto', href: '/app/tabs?variant=with-icons' })
	})

	it('sets the demo’s props in place', () => {
		expect(shellAction('align them to the end', tabs)).toEqual({ kind: 'tweak', props: { align: 'end' } })
	})

	it('opens the docs of the demo a how-to is about', () => {
		expect(shellAction('how does keyboard navigation work?', tabs)).toEqual({ kind: 'docs', href: '/app/tabs' })
		expect(shellAction('how does the tree work?', tabs)).toEqual({ kind: 'docs', href: '/app/tree' })
	})

	it('asks back instead of opening Tabs for a message it cannot place', () => {
		expect(shellAction('hmm', null)).toEqual({ kind: 'ask' })
		expect(shellAction('choose several options', null)).toEqual({ kind: 'ask' })
	})
})

/* Parity with the grammar the shell used to parse tweaks with (`parseTweakIntent`): for every
 * enum and boolean prop in the catalogue, its phrasings still set that value — directly, or by
 * opening a variant that sets it.
 */
import { catalog } from '../../src/lib/koan/catalog'
import { variantsOf } from '../../src/lib/chat-demo/intent/demos'

describe('shellAction — the old tweak phrasings, across the catalogue', () => {
	const cases = catalog.flatMap((meta) =>
		Object.entries(meta.props ?? {}).flatMap(([name, schema]) => {
			if (schema.type === 'enum')
				return schema.options.flatMap((o) => [
					[meta.id, name, o, `set ${name} to ${o}`],
					[meta.id, name, o, `${name} = ${o}`]
				])
			if (schema.type === 'boolean')
				return [
					[meta.id, name, true, `turn ${name} on`],
					[meta.id, name, false, `disable ${name}`]
				]
			return []
		})
	) as [string, string, unknown, string][]

	it.each(cases)('%s: %s → %s ("%s")', (demo, name, value, message) => {
		const action = shellAction(message, { demo, props: {} })
		const viaVariant = (href: string) => {
			const id = new URL(href, 'http://x').searchParams.get('variant')
			return variantsOf(demo).find((v) => v.id === id)?.props?.[name] === value
		}
		const ok = (action.kind === 'tweak' && action.props[name] === value) || (action.kind === 'goto' && viaVariant(action.href))
		expect(ok, JSON.stringify(action)).toBe(true)
	})
})
