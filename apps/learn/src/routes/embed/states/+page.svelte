<script lang="ts">
	/**
	 * Isolated List state matrix — the fixture for the computed-style snapshot
	 * gate (`e2e/list-state-snapshot.e2e.ts`, issue #153 Phase 0).
	 *
	 * WHY THIS EXISTS
	 * The state-pattern migration rewrites ~790 lines of per-theme List CSS into
	 * shared base rules + tokens, under the acceptance criterion "no visual
	 * regression". The only other appearance gate we have,
	 * `e2e/theme-contrast.e2e.ts`, is a WCAG-contrast ratchet — it CANNOT catch
	 * "the active mark changed from a 2px inset bar to a gradient fill", because
	 * both pass contrast. This page renders each List state in isolation so the
	 * gate can record the computed values that actually encode the look.
	 *
	 * CONTRACT WITH THE COLLECTOR
	 * The page is the single source of truth for the case matrix; the collector
	 * discovers cases from the DOM rather than duplicating the list. Each case is
	 * a wrapper carrying:
	 *   data-state-id    `<case>::<icon-kind>` — unique, becomes the snapshot key
	 *   data-state-case  case name
	 *   data-state-icon  `class` | `literal`
	 *   data-state-spec  JSON instructions:
	 *     { measure: selector — the subtree the case is ABOUT; the collector
	 *                 records it plus the list container, and nothing else
	 *       set?: [[selector, attr, value], …]   applied before measuring
	 *       interact?: 'none'|'hover'|'focus'|'press'
	 *       on?: selector (relative to the case) receiving the interaction }
	 *
	 * Selectors in the spec are relative to the case wrapper. `set` exists for
	 * states no component drives: nothing emits
	 * `[data-list-item][data-selected='true']` today (verified — `data-selected`
	 * is emitted by Toggle/Swatch/Tabs/Select/MultiSelect/Table on their own
	 * hooks, and by ItemToggle on `[data-item-toggle-option]`), yet all five
	 * themes ship List multi-selection rules. Setting the attribute directly on
	 * the real component DOM snapshots those rules so the migration cannot
	 * silently change them.
	 *
	 * URL params mirror /embed/gallery: ?style= &skin= &mode=
	 */
	import { page } from '$app/state'
	import { vibe } from '@rokkit/states'
	import { List } from '@rokkit/ui'

	const style = $derived(page.url.searchParams.get('style') ?? 'zen-sumi')
	const skin = $derived(page.url.searchParams.get('skin') ?? 'default')
	const mode = $derived(page.url.searchParams.get('mode') ?? 'light')

	// CRITICAL (same reason as /embed/gallery): this page renders inside the app's
	// <body>, which the root layout's `themable` action pins to `vibe`. A
	// wrapper-only data-style would collide with that outer scope — both
	// `[data-style='X'] [part]` and `[data-style='<vibe>'] [part]` match at equal
	// specificity, so the later-emitted rule wins and we would snapshot a style
	// MIX. Drive `vibe` itself so there is exactly one style scope on the page.
	$effect(() => {
		vibe.style = style
		vibe.mode = mode
		vibe.skin = skin
	})

	/**
	 * Two icon kinds because the themes style them through separate selectors:
	 * `[data-item-icon]` (a UnoCSS icon class) and `[data-item-icon-literal]` (a
	 * single grapheme — `isIconClass` splits on grapheme count > 1). rokkit and
	 * frosted give the literal its own `:focus-within` / hover rules, so it needs
	 * the full case matrix rather than a hand-picked subset — a subset would bake
	 * today's CSS into the safety net and miss a literal rule added later.
	 */
	const ICON_KINDS = ['class', 'literal'] as const
	type IconKind = (typeof ICON_KINDS)[number]
	const ICONS: Record<IconKind, string> = { class: 'i-glyph:diskette', literal: '禅' }

	/**
	 * Every item carries icon + subtext + badge so each theme's sub-element rules
	 * ([data-item-icon], [data-item-icon-literal], [data-item-description],
	 * [data-item-badge]) have a measurable target in every state.
	 */
	function leaf(kind: IconKind, n: number, extra: Record<string, unknown> = {}) {
		return {
			label: `Item ${n}`,
			value: `i${n}`,
			icon: ICONS[kind],
			description: 'Secondary line',
			badge: '3',
			...extra
		}
	}

	const TARGET = "[data-list-item]:nth-of-type(1)"
	// A second item, used as the focus decoy for the `-groupfocus` cases: the
	// list gets :focus-within without the measured item itself matching :focus,
	// which is exactly the element-vs-group distinction the token tiers describe
	// (--state-current-mark-active / -passive).
	const DECOY = "[data-list-item]:nth-of-type(2)"
	const GROUP = '[data-list-group]'

	type Case = {
		name: string
		spec: Record<string, unknown>
		/** activates item 1 via the value prop */
		current?: boolean
		/** item 1 gets `disabled: true` */
		disable?: boolean
		/** render a collapsible group header instead of root-level leaves */
		group?: boolean
		/** append a separator + spacer (theme-styled, non-state; free coverage) */
		extras?: boolean
	}

	/**
	 * The case matrix. Covers the doc's 8-state vocabulary as it applies to List,
	 * plus the group-focus variants — which is where the per-theme CSS diverges
	 * most and where a retokening is most likely to break.
	 *
	 * `read-only` is deliberately absent: 18-state-patterns.md scopes
	 * `[data-readonly]` to form fields, and List has no read-only concept, so a
	 * case for it would assert nothing.
	 *
	 * `pressed` (`:active`) is kept even though no theme's list.css styles it —
	 * it is in the vocabulary, it costs one interaction, and it pins the fact
	 * that today it is unstyled.
	 */
	const CASES: Case[] = [
		{ name: 'idle', spec: { interact: 'none' }, extras: true },
		{ name: 'hover', spec: { interact: 'hover', on: TARGET } },
		{ name: 'focus', spec: { interact: 'focus', on: TARGET } },
		{ name: 'pressed', spec: { interact: 'press', on: TARGET } },
		{ name: 'disabled', spec: { interact: 'none' }, disable: true },
		{ name: 'current-passive', spec: { interact: 'none' }, current: true },
		{ name: 'current-groupfocus', spec: { interact: 'focus', on: DECOY }, current: true },
		{ name: 'current-focus', spec: { interact: 'focus', on: TARGET }, current: true },
		{ name: 'current-hover', spec: { interact: 'hover', on: TARGET }, current: true },
		{
			name: 'selected-passive',
			spec: { set: [[TARGET, 'data-selected', 'true']], interact: 'none' }
		},
		{
			name: 'selected-groupfocus',
			spec: { set: [[TARGET, 'data-selected', 'true']], interact: 'focus', on: DECOY }
		},
		{
			name: 'selected-hover',
			spec: { set: [[TARGET, 'data-selected', 'true']], interact: 'hover', on: TARGET }
		},
		// Group headers are only interactive when the list is collapsible — a
		// non-collapsible group gets data-disabled, which the themes' group-hover
		// selectors explicitly exclude via :not([data-disabled='true']).
		{ name: 'group-idle', spec: { interact: 'none' }, group: true },
		{ name: 'group-hover', spec: { interact: 'hover', on: GROUP }, group: true }
	]

	function itemsFor(c: Case, kind: IconKind) {
		if (c.group) {
			return [{ label: 'Group', value: 'g1', children: [leaf(kind, 1), leaf(kind, 2)] }]
		}
		const items: Record<string, unknown>[] = [
			leaf(kind, 1, c.disable ? { disabled: true } : {}),
			leaf(kind, 2)
		]
		if (c.extras) items.push({ type: 'separator' }, { type: 'spacer' })
		return items
	}
</script>

<svelte:head><title>List states · {style} · {mode}</title></svelte:head>

<div data-state-harness data-style={style} data-mode={mode} data-skin={skin}>
	<!-- Neutral parking spot: the collector hovers this to clear :hover between
	     cases. Needs real size and must not be inside any case. -->
	<div data-state-sink></div>

	{#each CASES as c (c.name)}
		{#each ICON_KINDS as kind (kind)}
			<div
				class="case"
				data-state-id={`${c.name}::${kind}`}
				data-state-case={c.name}
				data-state-icon={kind}
				data-state-spec={JSON.stringify({ measure: c.group ? GROUP : TARGET, ...c.spec })}
			>
				<List
					items={itemsFor(c, kind)}
					value={c.current ? 'i1' : undefined}
					collapsible={c.group ?? false}
				/>
			</div>
		{/each}
	{/each}
</div>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
	}

	[data-state-harness] {
		background: var(--paper);
		color: var(--ink);
		min-height: 100vh;
		padding: 24px;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 24px;
		align-items: start;
		font-family: var(--font-ui, sans-serif);
	}

	[data-state-sink] {
		grid-column: 1 / -1;
		height: 48px;
	}

	.case {
		min-width: 0;
	}

	/* Transitions make computed styles time-dependent: base/list.css animates
	   background-color and color over 150ms, so a read taken right after
	   page.hover() would capture a mid-transition value and the snapshot would
	   flake. Transitions on state change are explicitly out of scope in
	   18-state-patterns.md, so killing them here loses no coverage and makes
	   every measurement the deterministic end state. */
	:global([data-state-harness] *),
	:global([data-state-harness] *::before),
	:global([data-state-harness] *::after) {
		transition: none !important;
		animation: none !important;
	}
</style>
