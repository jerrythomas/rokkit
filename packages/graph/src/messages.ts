/**
 * Graph's words live in `messages.graph` (`@rokkit/states`), so a locale can replace any of
 * them. Templates name their values in braces — `Open {name}` — and `fill` puts them in.
 */
import { messages } from '@rokkit/states'

/** The graph namespace of the active locale. Reactive: read it where the text is shown. */
export type GraphMessages = typeof messages.graph
export type GraphMessageKey = keyof GraphMessages

/** `template` with each `{token}` replaced; a token with no value stays as written. */
export function fill(template: string, values: Record<string, string | number>): string {
	return template.replace(/\{(\w+)\}/g, (whole, token: string) =>
		token in values ? String(values[token]) : whole
	)
}

/** `{n} node` or `{n} nodes`, from the active locale. */
export function counted(n: number, one: GraphMessageKey, many: GraphMessageKey): string {
	return fill(messages.graph[n === 1 ? one : many], { n })
}

/** One graph string, filled. */
export function say(key: GraphMessageKey, values: Record<string, string | number> = {}): string {
	return fill(messages.graph[key], values)
}
