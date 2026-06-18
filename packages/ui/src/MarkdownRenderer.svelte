<script lang="ts">
	import { marked } from 'marked'
	import type { Token, Tokens, TokensList } from 'marked'
	import type { Component, Snippet } from 'svelte'
	import type { MarkdownPlugin } from './markdown-plugin.js'
	import DOMPurify from 'dompurify'

	interface Props {
		markdown: string
		plugins?: MarkdownPlugin[]
		/** Optional wrapper component (e.g. CrossFilter from @rokkit/chart) for grouping
		 *  co-labelled plot blocks. When provided, plot code blocks whose JSON contains a
		 *  `crossfilter` field with the same value are wrapped in a shared instance. */
		crossfilterWrapper?: Component<{ children?: Snippet }>
	}

	let { markdown, plugins = [], crossfilterWrapper }: Props = $props()

	const pluginMap = $derived(
		Object.fromEntries(plugins.map((p) => [p.language.toLowerCase(), p.component]))
	)

	const tokens = $derived(marked.lexer(markdown))

	// DOMPurify ships as a fully-initialised object in browser environments and
	// as a factory function on the server (it needs to be bound to a DOM window
	// — usually jsdom — before .sanitize is available). To stay SSR-safe without
	// pulling jsdom into every consumer's build, fall back to a pass-through
	// when .sanitize is unavailable. Consumers rendering untrusted markdown in
	// SSR contexts should pre-sanitize before passing it to this component;
	// post-hydration the client runs the real sanitiser regardless.
	const sanitize: (raw: string) => string =
		typeof DOMPurify?.sanitize === 'function'
			? (raw) => DOMPurify.sanitize(raw) as string
			: (raw) => raw

	function tokenToSafeHtml(token: Token): string {
		const tokenList = Object.assign([token], {
			links: (tokens as TokensList).links ?? {}
		}) as TokensList
		const raw = marked.parser(tokenList)
		return sanitize(raw)
	}

	/** Extract crossfilter group ID from a code token's text, or null if absent/invalid. */
	function getCfGroup(token: Token): string | null {
		if (token.type !== 'code') return null
		const lang = (token.lang ?? '').toLowerCase()
		if (!pluginMap[lang]) return null
		try {
			const spec = JSON.parse(token.text)
			return typeof spec?.crossfilter === 'string' ? spec.crossfilter : null
		} catch {
			return null
		}
	}

	/**
	 * When crossfilterWrapper is provided, pre-pass tokens into segments:
	 * - { type: 'group', id, tokens[] } — plot tokens sharing a crossfilter ID
	 * - { type: 'token', token } — all other tokens
	 */
	type Segment =
		| { type: 'group'; id: string; items: Tokens.Code[] }
		| { type: 'token'; token: Token }

	const segments = $derived.by((): Segment[] => {
		if (!crossfilterWrapper) return tokens.map((t) => ({ type: 'token', token: t }))

		const result: Segment[] = []
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const groupMap = new Map<string, { type: 'group'; id: string; items: Tokens.Code[] }>()

		for (const token of tokens) {
			const cfId = getCfGroup(token)
			// getCfGroup only returns a non-null id for `type: 'code'` tokens,
			// so a grouped token is always a Code token (carries lang + text).
			if (cfId) {
				let group = groupMap.get(cfId)
				if (!group) {
					group = { type: 'group', id: cfId, items: [] }
					groupMap.set(cfId, group)
					result.push(group)
				}
				group.items.push(token as Tokens.Code)
			} else {
				result.push({ type: 'token', token })
			}
		}
		return result
	})
</script>

<div class="markdown-renderer" data-markdown>
	{#each segments as seg (seg.type === 'group' ? `cf-${  seg.id}` : segments.indexOf(seg))}
		{#if seg.type === 'group'}
			{@const Wrapper = crossfilterWrapper}
			<Wrapper>
				{#each seg.items as token, i (i)}
					{@const Plugin = pluginMap[(token.lang ?? '').toLowerCase()]}
					{#if Plugin}<Plugin code={token.text} />{/if}
				{/each}
			</Wrapper>
		{:else}
			{@const token = seg.token}
			{#if token.type === 'code'}
				{@const lang = (token.lang ?? '').toLowerCase()}
				{@const Plugin = pluginMap[lang]}
				{#if Plugin}
					<Plugin code={token.text} />
				{:else}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html tokenToSafeHtml(token)}
				{/if}
			{:else}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html tokenToSafeHtml(token)}
			{/if}
		{/if}
	{/each}
</div>
