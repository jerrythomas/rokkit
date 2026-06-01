<script lang="ts">
	import type { Snippet, Component } from 'svelte'
	import {
		ChatComposer,
		ChatMessage,
		ChatResponse,
		ChatHistory,
		ChatStream,
		Chips,
		configureWho
	} from '$lib/chat'

	// Brand the assistant once for this surface; every ChatMessage with
	// kind='info' picks it up.
	configureWho({ assistant: 'Rokkit' })
	import { Tabs, Table, Tree, MultiSelect, Select, List, Button, AlertList, Stepper, CodeBlock, Toggle, MarkdownRenderer } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import { BarChart } from '@rokkit/chart'
	import { alerts } from '@rokkit/states'
	import RokkitWordmark from '$lib/components/RokkitWordmark.svelte'
	import { theme } from '$lib/stores/theme.svelte'
	import { vibe } from '@rokkit/states'
	import { koan } from '$lib/koan/store.svelte'
	import { runMatch } from '$lib/koan/match.svelte'
	import { parseTweakIntent } from '$lib/koan/tweak-parser'
	import { findById, DEMO_ROUTE as CATALOG_DEMO_ROUTE } from '$lib/koan/catalog'
	import CatalogGrid from '$lib/koan/components/CatalogGrid.svelte'
	import APIPanel from '$lib/koan/components/APIPanel.svelte'
	import { shell } from '$lib/koan/shell.svelte'
	import {
		conversations,
		bucketByRecency,
		recencyLabel,
		startNew,
		appendAssistant,
		appendTweak,
		clearTweaksFor,
		loadConversation,
		setCurrentId,
		getCurrentId,
		getCurrentConversation,
		type Conversation
	} from '$lib/koan/conversations.svelte'
	import ComposerSuggestions from '$lib/koan/components/ComposerSuggestions.svelte'
	import DetailsSlab from '$lib/koan/components/DetailsSlab.svelte'
	import type { DemoMeta } from '$lib/koan/types'
	import ThemeWizardCard from '$lib/koan/demos/theme-wizard/ThemeWizardCard.svelte'
	import { savePreset, resetPreset, downloadTokensCss, exportTokensCss } from '$lib/koan/demos/theme-wizard/store.svelte'
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'

	interface Props {
		children?: Snippet
	}
	const { children }: Props = $props()

	// Style / density used to bind to ChatChrome's controls here — those
	// moved into the global SiteHeader (rendered by the root layout). The
	// theme store still tracks the active mode for the `koan` canvas's
	// chart rendering, so keep the vibe→theme.mode bridge.
	const mode = $derived<'light' | 'dark'>(theme.mode === 'dark' ? 'dark' : 'light')

	$effect(() => {
		if (vibe.mode !== theme.mode) theme.setMode(vibe.mode)
	})

	let thinkingTimer: ReturnType<typeof setTimeout> | null = null

	type DemoKind =
		| 'tabs' | 'theme-wizard' | 'table' | 'tree' | 'multi-select' | 'list' | 'toasts'
		| 'form' | 'select' | 'chart' | 'combo' | 'date-picker' | 'stepper'
		| 'button' | 'badge' | 'pill' | 'avatar' | 'divider' | 'message' | 'swatch'
		| 'range' | 'rating' | 'switch' | 'toggle'
		| 'breadcrumbs' | 'menu' | 'toolbar' | 'floating-action' | 'floating-navigation'
		| 'stack' | 'grid' | 'card' | 'carousel'
		| 'lazy-tree' | 'status-list' | 'timeline'
		| 'code' | 'markdown-renderer' | 'search-filter' | 'palette-manager'
		| 'dropdown' | 'progress' | 'upload-progress' | 'upload-target'
		| 'button-group' | 'tooltip' | 'code-group' | 'effects'
	const DEMO_ROUTE = CATALOG_DEMO_ROUTE as Record<DemoKind, string>

	function pickDemoKind(query: string): DemoKind {
		const top = runMatch(query)[0]?.id
		if (top === 'theme-wizard') return 'theme-wizard'
		if (top === 'table') return 'table'
		if (top === 'tree') return 'tree'
		if (top === 'multi-select') return 'multi-select'
		if (top === 'list') return 'list'
		if (top === 'toasts') return 'toasts'
		if (top === 'form') return 'form'
		if (top === 'select') return 'select'
		if (top === 'chart') return 'chart'
		if (top === 'combo') return 'combo'
		if (top === 'date-picker') return 'date-picker'
		if (top === 'stepper') return 'stepper'
		return 'tabs'
	}

	function submitQuery(value: string) {
		const trimmed = value.trim()
		if (!trimmed) return

		// Chat-driven prop tweak short-circuit. When the user is already
		// on a demo (response phase) and the input parses as a tweak
		// intent against the active demo's schema, apply it directly —
		// no thinking phase, no goto. The setTweak helper writes the
		// in-memory state and persists a TweakTurn so the canvas restores
		// to the same values on reload.
		if (shell.phase === 'response' && shell.demoType && propsSchema) {
			const intent = parseTweakIntent(trimmed, propsSchema)
			if (intent) {
				setTweak(intent.name, intent.value)
				shell.composerValue = ''
				return
			}
		}

		koan.query = trimmed
		shell.lastQuery = trimmed
		shell.composerValue = ''
		shell.phase = 'thinking'
		shell.demoType = null
		shell.demoVariant = null

		startNew('app', trimmed)

		const nextKind = pickDemoKind(trimmed)
		if (thinkingTimer) clearTimeout(thinkingTimer)
		thinkingTimer = setTimeout(() => {
			goto(DEMO_ROUTE[nextKind])
		}, 1500)
	}

	function startNewConversation() {
		if (thinkingTimer) {
			clearTimeout(thinkingTimer)
			thinkingTimer = null
		}
		shell.lastQuery = ''
		shell.composerValue = ''
		koan.query = ''
		setCurrentId(null)
		goto('/app')
	}

	// Walk the conversation to find the latest user query (used for the chat-
	// left header sub-line). Falls back to the conversation title for safety.
	function lastUserText(conv: Conversation | undefined): string {
		if (!conv) return ''
		for (let i = conv.turns.length - 1; i >= 0; i--) {
			const t = conv.turns[i]
			if (t.kind === 'user') return t.text
		}
		return conv.title
	}

	function resumeConversation(conv: Conversation) {
		if (conv.surface === 'chat') {
			loadConversation(conv.id)
			goto('/chat')
			return
		}
		const lastDemo = [...conv.turns]
			.reverse()
			.find((t) => t.kind === 'assistant' && t.body.kind === 'demo')
		if (!lastDemo || lastDemo.kind !== 'assistant' || lastDemo.body.kind !== 'demo') return
		loadConversation(conv.id)
		shell.lastQuery = lastUserText(conv)
		shell.composerValue = ''
		shell.demoType = lastDemo.body.demoType
		shell.demoVariant = lastDemo.body.variant
		shell.phase = 'response'
		const route = DEMO_ROUTE[lastDemo.body.demoType as DemoKind]
		const variant = lastDemo.body.variant
		goto(variant ? `${route}?variant=${variant}` : route)
	}

	// Sidebar history — derived from the shared conversations store. Both
	// /app and /chat surfaces appear here; clicking routes back to the right
	// surface. recencyLabel formats the trailing "12m / yest / Mon" badge.
	const buckets = $derived(
		conversations.length > 0
			? bucketByRecency()
			: { today: [], yesterday: [], earlier: [] }
	)
	const allConv = $derived([...buckets.today, ...buckets.yesterday, ...buckets.earlier])

	function demoIcon(demoType: string | null): string {
		if (!demoType) return 'i-mdi:chat-outline'
		return findById(demoType)?.icon ?? 'i-mdi:chat-outline'
	}

	function convIcon(conv: Conversation): string {
		if (conv.surface === 'chat') return 'i-mdi:chat-processing-outline'
		const lastDemo = [...conv.turns]
			.reverse()
			.find((t) => t.kind === 'assistant' && t.body.kind === 'demo')
		if (lastDemo && lastDemo.kind === 'assistant' && lastDemo.body.kind === 'demo') {
			return demoIcon(lastDemo.body.demoType)
		}
		return 'i-mdi:chat-outline'
	}

	// Emit the assistant turn after both demoType and demoVariant have
	// settled. Fires on /app/<demo> mount and on ?variant=X changes. The
	// rules below keep conversations honest:
	//   - user turn → append the first assistant demo turn (initial response)
	//   - same demoType, different variant → append (variant pick is a turn)
	//   - different demoType → treat as side-trip browsing, no append
	//     (new demos are reached via submitQuery which calls startNew)
	$effect(() => {
		if (shell.phase !== 'response' || !shell.demoType) return
		const id = getCurrentId()
		if (!id) return
		const current = conversations.find((c) => c.id === id)
		if (!current) return
		const last = current.turns.at(-1)
		const dt = shell.demoType
		const dv = shell.demoVariant
		if (last?.kind === 'user') {
			appendAssistant({ kind: 'demo', demoType: dt, variant: dv })
			return
		}
		if (
			last?.kind === 'assistant' &&
			last.body.kind === 'demo' &&
			last.body.demoType === dt &&
			last.body.variant !== dv
		) {
			appendAssistant({ kind: 'demo', demoType: dt, variant: dv })
		}
	})

	// Welcome flow is input-first. As the user types, ComposerSuggestions
	// matches against the catalog and surfaces the closest demos. Clicking
	// a suggestion submits its title as the query, going through the same
	// thinking → goto path as a typed submission. The dedicated /app/catalog
	// route (TBD) gives the same demos a sidebar-browse entry point for
	// users who prefer to scan visually.
	function pickSuggestion(demo: DemoMeta) {
		submitQuery(demo.title)
	}

	// Tabs demo state — mounted in the canvas response card.
	// Each item carries `content` so the active panel has something to render.
	// `with-icons` variant adds an `icon` field that Tabs picks up automatically.
	const baseTabsItems = [
		{
			label: 'Overview',
			value: 'overview',
			icon: 'i-mdi:layers-outline',
			content:
				'A Tabs component renders multiple panels from one items array. Selection is bound; click or arrow-key to switch.'
		},
		{
			label: 'Theming',
			value: 'theming',
			icon: 'i-mdi:palette',
			content:
				'Style comes from the data-style attribute on the parent. Flip skin (zen-sumi / minimal / material) to see the same Tabs re-render against new tokens.'
		},
		{
			label: 'Anatomy',
			value: 'anatomy',
			icon: 'i-mdi:shape-outline',
			content:
				'<Tabs> is a Wrapper + Navigator composition: Wrapper owns focusedKey + flatView; Navigator handles DOM events and scrolls items into view.'
		},
		{
			label: 'A11y',
			value: 'a11y',
			icon: 'i-mdi:accessibility',
			content:
				'role="tablist" on the strip, role="tab" + aria-selected on each trigger, role="tabpanel" on each panel. Arrow keys move focus along the orientation axis.'
		},
		{
			label: 'API',
			value: 'api',
			icon: 'i-mdi:code-tags',
			content:
				'Props: options, value (bindable), orientation, position, align. Snippets: itemContent, tabPanel, [named] per-item override. Events: onchange, onselect.'
		}
	]
	let activeTab = $state<unknown>('theming')

	// Look up the active variant for the current demo (set via ?variant= URL
	// param by the route page). Dynamic variants merge their props into the
	// mounted component; route variants navigate to a sub-route instead.
	const activeVariant = $derived.by(() => {
		if (!shell.demoType || !shell.demoVariant) return null
		const meta = findById(shell.demoType)
		return meta?.variants?.find((v) => v.id === shell.demoVariant) ?? null
	})

	// Generic prop bag for any dynamic variant. Each demo branch spreads this
	// after its base props so variants flow through with no per-demo plumbing.
	const variantProps = $derived<Record<string, unknown>>(
		activeVariant?.mode === 'dynamic' ? (activeVariant.props ?? {}) : {}
	)

	// Live tweak overrides — written by the inline Tweaks editor that
	// sits anchored above the composer. Keyed by demo id so each demo
	// keeps its own tweak set across navigations within the same
	// session. Spreads AFTER variantProps so user tweaks win over a
	// picked variant.
	let tweaksByDemo = $state<Record<string, Record<string, unknown>>>({})
	const tweakProps = $derived<Record<string, unknown>>(
		shell.demoType ? (tweaksByDemo[shell.demoType] ?? {}) : {}
	)

	const propsSchema = $derived(
		shell.demoType ? findById(shell.demoType)?.props : undefined
	)
	const demoApi = $derived(shell.demoType ? findById(shell.demoType)?.api : undefined)
	const demoDocs = $derived(shell.demoType ? findById(shell.demoType)?.docs : undefined)
	const currentMeta = $derived(shell.demoType ? findById(shell.demoType) : undefined)

	// The 13 demos that ship with a hand-rolled canvas-body branch in
	// this layout (rich variant/tweak logic). All other catalog entries
	// fall through to the generic dynamic-mount branch — they just
	// load `meta.load()` and render the resulting component as the
	// canvas content. Lets us keep the demo catalog open-ended without
	// growing the layout file by hundreds of lines per addition.
	const RICH_DEMOS = new Set([
		'tabs', 'theme-wizard', 'table', 'stepper', 'date-picker',
		'combo', 'chart', 'select', 'form', 'toasts', 'list',
		'multi-select', 'tree'
	])
	const isDynamicDemo = $derived(
		shell.demoType !== null && !RICH_DEMOS.has(shell.demoType as string)
	)

	// Load the component for the active dynamic demo. `meta.load()`
	// returns a Promise — keep the Promise in a local state so the
	// template's `{#await}` block can render a small loading state
	// while the chunk fetches, and we re-resolve only when demoType
	// changes (not every reactive update).
	let dynamicDemoPromise = $state<Promise<{ default: Component }> | null>(null)
	$effect(() => {
		const type = shell.demoType
		if (!type || RICH_DEMOS.has(type)) {
			dynamicDemoPromise = null
			return
		}
		const meta = findById(type)
		dynamicDemoPromise = meta?.load() ?? null
	})

	// Canvas-view toggle options — always include `live`, conditionally
	// include `code` (when snippets exist) and `api` (when api meta
	// exists). Keeps the toggle compact when a demo hasn't filled in
	// one of the sections yet.
	// `code` option is gated on whether the demo has a `*Code`
	// constant (all 13 currently do — see activeDemoCode below).
	// `api` option is gated on whether the demo's meta has filled
	// in `api`.
	const hasActiveCode = $derived(Boolean(shell.demoType))
	const canvasViewOptions = $derived.by(() => {
		const opts: Array<{ label: string; value: 'live' | 'code' | 'api' | 'docs' }> = [
			{ label: 'Live', value: 'live' }
		]
		if (hasActiveCode) opts.push({ label: 'Code', value: 'code' })
		if (demoApi && demoApi.props.length > 0) opts.push({ label: 'API', value: 'api' })
		if (demoDocs) opts.push({ label: 'Docs', value: 'docs' })
		return opts
	})

	// Whether the chat-left slab has anything to show (Tweaks only —
	// API moved to canvas, Source moved to the Code mode there).
	const hasDetails = $derived(
		Boolean(propsSchema && Object.keys(propsSchema).length > 0)
	)

	// The details slab is opt-in: the user clicks the icon on the
	// composer to surface it (no layout disruption when closed). Reset
	// to closed when navigating to a different demo so we don't carry
	// state across demos.
	let tweaksOpen = $state(false)
	// Canvas view mode — `live` mounts the demo, `code` shows the
	// snippets, `api` swaps to the reference panel. Reset to `live`
	// when the demo changes so view state doesn't bleed across demos.
	let canvasView = $state<'live' | 'code' | 'api' | 'docs'>('live')
	$effect(() => {
		void shell.demoType
		tweaksOpen = false
		canvasView = 'live'
	})

	// Hydrate `tweaksByDemo` from any persisted TweakTurn rows on the
	// current conversation. Runs when the active demo or conversation
	// changes (e.g. on resume), so the canvas remounts with the same
	// values the conversation's chat log shows.
	$effect(() => {
		const demoType = shell.demoType
		const conv = getCurrentConversation()
		if (!demoType || !conv) return
		const replayed: Record<string, unknown> = {}
		for (const turn of conv.turns) {
			if (turn.kind === 'tweak' && turn.demoType === demoType) {
				replayed[turn.name] = turn.to
			}
		}
		// Only assign when persisted state differs from the in-memory
		// scratch — avoids a self-firing effect loop on every keystroke.
		const current = tweaksByDemo[demoType] ?? {}
		const sameKeys = Object.keys(replayed).length === Object.keys(current).length
		const sameVals = sameKeys && Object.keys(replayed).every((k) => current[k] === replayed[k])
		if (!sameVals) tweaksByDemo[demoType] = replayed
	})

	// Count of props the user has tweaked away from default for the active
	// demo. Drives the canvas strip ("N tweaks active — Reset"). Tweaks
	// still persist as TweakTurn rows in the conversation store so the
	// trail survives reload — they just no longer render as chat
	// messages (felt noisy when clicking through enum values).
	const tweakCount = $derived(Object.keys(tweakProps).length)

	function setTweak(name: string, value: unknown) {
		if (!shell.demoType) return
		const cur = tweaksByDemo[shell.demoType] ?? {}
		// Determine "from" — current tweak value, falling back to the
		// active variant's value, then the schema default — so the diff
		// reads as the user perceives it.
		const schema = propsSchema?.[name]
		const from = cur[name] ?? variantProps[name] ?? schema?.default
		if (from === value) return // no-op: nothing actually changed
		tweaksByDemo[shell.demoType] = { ...cur, [name]: value }
		appendTweak(shell.demoType, name, from, value)
	}

	function resetTweaks() {
		if (!shell.demoType) return
		const nextTweaks = { ...tweaksByDemo }
		delete nextTweaks[shell.demoType]
		tweaksByDemo = nextTweaks
		clearTweaksFor(shell.demoType)
	}

	async function copyTweaks() {
		const merged = { ...variantProps, ...tweakProps }
		await navigator.clipboard.writeText(JSON.stringify(merged, null, 2)).catch(() => {
			// Clipboard write can reject on insecure contexts or denied permissions;
			// silently no-op — the user can use the source view's copy as a fallback.
		})
	}

	// Variant suggestions rendered in the chat panel (one chip per declared
	// variant for the active demo). Replaces the per-demo static tryChips row.
	const variantChipItems = $derived.by(() => {
		if (!shell.demoType) return []
		const meta = findById(shell.demoType)
		const variants = meta?.variants ?? []
		return variants.map((v) => ({
			label: v.label,
			icon: 'i-mdi:auto-fix',
			id: v.id,
			active: activeVariant?.id === v.id
		}))
	})

	function pickVariant(item: { id?: string; active?: boolean }) {
		if (!shell.demoType || !item.id) return
		const route = DEMO_ROUTE[shell.demoType as DemoKind]
		if (!route) return
		goto(item.active ? route : `${route}?variant=${item.id}`)
	}

	// Used by the "Canvas →" callout in each chat MOUNTED message. Clears any
	// active variant to return the canvas to its default state.
	function resetVariant() {
		if (!shell.demoType) return
		const route = DEMO_ROUTE[shell.demoType as DemoKind]
		if (!route) return
		goto(route)
	}

	// `with-icons` variant has no `props` to merge — it changes the items shape
	// instead (Tabs auto-renders an icon when present). Strip icons for other
	// variants so the rendered snippet matches what we ship.
	const tabsItems = $derived(
		activeVariant?.id === 'with-icons'
			? baseTabsItems
			: baseTabsItems.map(({ label, value, content }) => ({ label, value, content }))
	)

	// Reflect the actual props the running Tabs receives. Re-derives when the
	// variant flips so the user sees the snippet for THIS variant, not a fixed
	// example.
	const tabsCode = $derived.by(() => {
		const propLines: string[] = ['bind:value']
		for (const [k, v] of Object.entries(variantProps)) {
			propLines.push(`${k}="${v}"`)
		}
		const tabsTag = `<Tabs options={items} ${propLines.join(' ')} />`
		const itemsBlock = tabsItems
			.map((it) => {
				const fields = [`label: '${it.label}'`, `value: '${it.value}'`]
				if ('icon' in it && it.icon) fields.push(`icon: '${it.icon}'`)
				fields.push(`content: '…'`)
				return `    { ${fields.join(', ')} }`
			})
			.join(',\n')
		return `<script>
  import { Tabs } from '@rokkit/ui'

  let items = $state([
${itemsBlock}
  ])
  let value = $state('${String(activeTab)}')
<\/script>

${tabsTag}`
	})

	// Table demo state — sortable products table on the canvas. The `mapping`
	// variant remaps column headers + adds an inventory derived field.
	const tableShort = [
		{ name: 'Laptop', price: 1299, stock: 45 },
		{ name: 'Phone', price: 899, stock: 120 },
		{ name: 'Tablet', price: 599, stock: 78 },
		{ name: 'Monitor', price: 449, stock: 32 },
		{ name: 'Keyboard', price: 129, stock: 210 },
		{ name: 'Mouse', price: 59, stock: 340 }
	]
	const tableLong = [
		...tableShort,
		{ name: 'Headphones', price: 199, stock: 67 },
		{ name: 'Speaker', price: 249, stock: 41 },
		{ name: 'Webcam', price: 89, stock: 158 },
		{ name: 'Microphone', price: 149, stock: 22 },
		{ name: 'Stand', price: 39, stock: 274 },
		{ name: 'Lamp', price: 49, stock: 96 },
		{ name: 'Charger', price: 29, stock: 412 },
		{ name: 'Cable', price: 12, stock: 938 }
	]
	const tableData = $derived(activeVariant?.id === 'sticky-header' ? tableLong : tableShort)
	const tableMappedColumns = [
		{ name: 'name', label: 'Product Name', sortable: true },
		{ name: 'price', label: 'Unit Price (USD)', sortable: true, align: 'end' },
		{ name: 'stock', label: 'On Hand', sortable: true, align: 'end' }
	]
	const tableColumns = $derived(activeVariant?.id === 'mapping' ? tableMappedColumns : undefined)

	const tableCode = $derived.by(() => {
		if (activeVariant?.id === 'mapping') {
			return `<script>
  import { Table } from '@rokkit/ui'

  const products = [ /* same 6 rows */ ]

  const columns = [
    { name: 'name',  label: 'Product Name',    sortable: true },
    { name: 'price', label: 'Unit Price (USD)', sortable: true, align: 'end' },
    { name: 'stock', label: 'On Hand',          sortable: true, align: 'end' }
  ]
<\/script>

<Table data={products} {columns} caption="Products" />`
		}
		if (activeVariant?.id === 'sticky-header') {
			return `<script>
  import { Table } from '@rokkit/ui'
  // 14 rows
  const products = [ /* … */ ]
<\/script>

<div style="max-height:340px;overflow:auto" class="sticky-wrap">
  <Table data={products} caption="Products" />
</div>

<style>
  .sticky-wrap :global([data-table-header-row]) {
    position: sticky; top: 0; z-index: 1;
    background: var(--paper);
  }
</style>`
		}
		if (activeVariant?.id === 'striped') {
			return `<script>
  import { Table } from '@rokkit/ui'
  const products = [ /* same 6 rows */ ]
<\/script>

<Table data={products} striped caption="Products" />`
		}
		return `<script>
  import { Table } from '@rokkit/ui'

  const products = [
    { name: 'Laptop',   price: 1299, stock:  45 },
    { name: 'Phone',    price:  899, stock: 120 },
    { name: 'Tablet',   price:  599, stock:  78 },
    { name: 'Monitor',  price:  449, stock:  32 },
    { name: 'Keyboard', price:  129, stock: 210 },
    { name: 'Mouse',    price:   59, stock: 340 }
  ]
<\/script>

<Table data={products} caption="Products" />`
	})

	// Tree demo state — file-tree shape with deep nesting
	const treeShallow = [
		{
			name: 'src',
			id: 'src',
			children: [
				{
					name: 'components',
					id: 'components',
					children: [
						{ name: 'Button.svelte', id: 'button' },
						{ name: 'Input.svelte', id: 'input' },
						{ name: 'Tabs.svelte', id: 'tabs' }
					]
				},
				{
					name: 'utilities',
					id: 'utilities',
					children: [
						{ name: 'format.ts', id: 'format' },
						{ name: 'parse.ts', id: 'parse' }
					]
				},
				{ name: 'index.ts', id: 'index' }
			]
		},
		{
			name: 'docs',
			id: 'docs',
			children: [
				{ name: 'getting-started.md', id: 'getting-started' },
				{ name: 'api-reference.md', id: 'api-reference' }
			]
		},
		{ name: 'package.json', id: 'package' },
		{ name: 'README.md', id: 'readme' }
	]
	const treeDeep = [
		{
			name: 'monorepo', id: 'monorepo',
			children: [
				{
					name: 'packages', id: 'packages',
					children: [
						{
							name: 'ui', id: 'ui',
							children: [
								{
									name: 'src', id: 'ui-src',
									children: [
										{ name: 'components', id: 'ui-comp', children: [
											{ name: 'Button.svelte', id: 'd-button' },
											{ name: 'Select.svelte', id: 'd-select' }
										] },
										{ name: 'types.ts', id: 'd-types' }
									]
								}
							]
						},
						{ name: 'states', id: 'states', children: [ { name: 'src', id: 'states-src', children: [ { name: 'wrapper.svelte.ts', id: 'd-wrapper' } ] } ] }
					]
				},
				{ name: 'docs', id: 'd-docs', children: [ { name: 'design', id: 'd-design', children: [ { name: '01-overview.md', id: 'd-overview' } ] } ] }
			]
		}
	]
	const treeItems = $derived(activeVariant?.id === 'deep' ? treeDeep : treeShallow)
	const treeFields = { label: 'name', value: 'id' }
	let treeValue = $state<unknown>(null)

	// Stepper demo state — 4-step signup flow
	const stepperBlurbs: Record<string, string> = {
		Account: 'Pick a username + password. Email verification will be sent after submit.',
		Profile: 'Display name, time zone, and an optional avatar. All editable later.',
		Preferences: 'Tell us how you want to be notified — email, in-app, or both.',
		Review: 'Confirm what you entered, then click Finish to create the account.'
	}
	let stepperSteps = $state([
		{ text: 'Account', completed: true },
		{ text: 'Profile', completed: true },
		{ text: 'Preferences' },
		{ text: 'Review' }
	])
	let stepperCurrent = $state(2)

	function stepperAdvance() {
		stepperSteps[stepperCurrent] = { ...stepperSteps[stepperCurrent], completed: true }
		if (stepperCurrent < stepperSteps.length - 1) stepperCurrent++
	}

	const stepperCode = $derived.by(() => {
		const orientation = (variantProps.orientation as string | undefined) ?? 'horizontal'
		const showContent = activeVariant?.id === 'with-content'
		const orientLine = orientation === 'horizontal' ? '' : ` orientation="${orientation}"`
		const contentBlock = showContent
			? `
  {#snippet content(step, index)}
    <p>{blurbs[step.text]}</p>
  {/snippet}`
			: ''
		return `<script>
  import { Stepper, Button } from '@rokkit/ui'

  let steps = $state([
    { text: 'Account',     completed: true },
    { text: 'Profile',     completed: true },
    { text: 'Preferences'                  },
    { text: 'Review'                       }
  ])
  let current = $state(2)
<\/script>

<Stepper {steps} bind:current${orientLine} onclick={(i) => current = i}>${contentBlock}
</Stepper>
<Button onclick={advance}>Complete &amp; Next</Button>`
	})

	// Date Picker demo state — event scheduling form. Variants swap the schema
	// shape: 'with-validation' adds min/max, 'range' adds a checkOut field.
	let dateData = $state({
		eventDate: '2026-06-15',
		startsAt: '2026-06-15T14:30',
		checkOut: '2026-06-22'
	})
	const dateSchemaDefault = {
		type: 'object',
		properties: {
			eventDate: { type: 'string', format: 'date', required: true },
			startsAt: { type: 'string', format: 'date-time', required: true }
		}
	}
	const dateSchemaValidation = {
		type: 'object',
		properties: {
			eventDate: {
				type: 'string',
				format: 'date',
				required: true,
				minimum: '2026-06-01',
				maximum: '2026-12-31'
			},
			startsAt: {
				type: 'string',
				format: 'date-time',
				required: true
			}
		}
	}
	const dateSchemaRange = {
		type: 'object',
		properties: {
			eventDate: { type: 'string', format: 'date', required: true },
			checkOut: { type: 'string', format: 'date', required: true }
		}
	}
	const dateSchema = $derived(
		activeVariant?.id === 'with-validation'
			? dateSchemaValidation
			: activeVariant?.id === 'range'
				? dateSchemaRange
				: dateSchemaDefault
	)

	const dateCode = $derived.by(() => {
		if (activeVariant?.id === 'with-validation') {
			return `<script>
  import { FormRenderer } from '@rokkit/forms'

  let data = $state({
    eventDate: '2026-06-15',
    startsAt: '2026-06-15T14:30'
  })

  const schema = {
    type: 'object',
    properties: {
      eventDate: {
        type: 'string', format: 'date', required: true,
        minimum: '2026-06-01', maximum: '2026-12-31'
      },
      startsAt: { type: 'string', format: 'date-time', required: true }
    }
  }
<\/script>

<FormRenderer bind:data {schema} />`
		}
		if (activeVariant?.id === 'range') {
			return `<script>
  import { FormRenderer } from '@rokkit/forms'

  let data = $state({ eventDate: '2026-06-15', checkOut: '2026-06-22' })

  const schema = {
    type: 'object',
    properties: {
      eventDate: { type: 'string', format: 'date', required: true },
      checkOut:  { type: 'string', format: 'date', required: true }
    }
  }
<\/script>

<FormRenderer bind:data {schema} />`
		}
		return `<script>
  import { FormRenderer } from '@rokkit/forms'

  let data = $state({
    eventDate: '2026-06-15',
    startsAt: '2026-06-15T14:30'
  })

  const schema = {
    type: 'object',
    properties: {
      eventDate: { type: 'string', format: 'date',      required: true },
      startsAt:  { type: 'string', format: 'date-time', required: true }
    }
  }
<\/script>

<FormRenderer bind:data {schema} />`
	})

	// Combo demo state — filterable Select with country list
	const countryItems = [
		'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil',
		'Canada', 'Chile', 'China', 'Colombia', 'Denmark',
		'Egypt', 'Finland', 'France', 'Germany', 'Greece',
		'India', 'Indonesia', 'Ireland', 'Israel', 'Italy',
		'Japan', 'Kenya', 'Mexico', 'Netherlands', 'New Zealand',
		'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines',
		'Poland', 'Portugal', 'South Africa', 'South Korea', 'Spain',
		'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'United Kingdom',
		'United States', 'Vietnam'
	].map((label) => ({ label, value: label.toLowerCase().replace(/\s+/g, '-') }))
	let comboValue = $state<unknown>(null)

	const comboCode = `<script>
  import { Select } from '@rokkit/ui'

  const countries = [
    'Argentina', 'Australia', 'Brazil', 'Canada', 'France',
    'Germany', 'India', 'Japan', 'Spain', 'United Kingdom',
    'United States', /* …42 total… */
  ].map(label => ({ label, value: label.toLowerCase().replace(/\\s+/g, '-') }))

  let value = $state(null)
<\/script>

<Select
  items={countries}
  bind:value
  filterable
  placeholder="Type to search countries"
/>`

	// Chart demo state — quarterly revenue, BarChart
	const chartFlat = [
		{ quarter: 'Q1', revenue: 42 },
		{ quarter: 'Q2', revenue: 58 },
		{ quarter: 'Q3', revenue: 51 },
		{ quarter: 'Q4', revenue: 73 }
	]
	const chartByProduct = [
		{ quarter: 'Q1', product: 'Hardware', revenue: 24 },
		{ quarter: 'Q1', product: 'Software', revenue: 18 },
		{ quarter: 'Q2', product: 'Hardware', revenue: 31 },
		{ quarter: 'Q2', product: 'Software', revenue: 27 },
		{ quarter: 'Q3', product: 'Hardware', revenue: 28 },
		{ quarter: 'Q3', product: 'Software', revenue: 23 },
		{ quarter: 'Q4', product: 'Hardware', revenue: 39 },
		{ quarter: 'Q4', product: 'Software', revenue: 34 }
	]

	// Chart variants 'grouped' and 'stacked' want a fill field, so swap the dataset.
	const chartData = $derived(
		activeVariant?.id === 'grouped' || activeVariant?.id === 'stacked'
			? chartByProduct
			: chartFlat
	)

	const chartCode = $derived.by(() => {
		const isGrouped = activeVariant?.id === 'grouped' || activeVariant?.id === 'stacked'
		const propLine = ['data={sales}', 'x="quarter"', 'y="revenue"']
		if (isGrouped) propLine.push('fill="product"', 'legend')
		if (activeVariant?.id === 'stacked') propLine.push('stack')
		if (activeVariant?.id === 'with-labels') propLine.push('label')
		const rows = isGrouped
			? `    { quarter: 'Q1', product: 'Hardware', revenue: 24 },\n    { quarter: 'Q1', product: 'Software', revenue: 18 },\n    /* …8 rows total */`
			: `    { quarter: 'Q1', revenue: 42 },\n    { quarter: 'Q2', revenue: 58 },\n    { quarter: 'Q3', revenue: 51 },\n    { quarter: 'Q4', revenue: 73 }`
		return `<script>
  import { BarChart } from '@rokkit/chart'

  const sales = [
${rows}
  ]
<\/script>

<BarChart ${propLine.join(' ')} />`
	})

	// Select demo state — 20 flat options (default), with icons (with-icons),
	// or organized into 3 groups (grouped). The shape is what changes; the
	// component is the same.
	const selectFlatItems = Array.from({ length: 20 }, (_, i) => ({
		label: `Option ${String(i + 1).padStart(2, '0')}`,
		value: `opt-${i + 1}`
	}))
	const selectIcons = [
		'i-mdi:home', 'i-mdi:cog', 'i-mdi:account', 'i-mdi:bell-outline',
		'i-mdi:folder-outline', 'i-mdi:image-outline', 'i-mdi:file-document-outline',
		'i-mdi:cloud-outline', 'i-mdi:lock-outline', 'i-mdi:key-outline',
		'i-mdi:database', 'i-mdi:chart-bar', 'i-mdi:calendar-outline',
		'i-mdi:email-outline', 'i-mdi:phone', 'i-mdi:tag-outline',
		'i-mdi:bookmark-outline', 'i-mdi:heart-outline', 'i-mdi:star-outline',
		'i-mdi:check-circle-outline'
	]
	const selectIconItems = selectFlatItems.map((it, i) => ({ ...it, icon: selectIcons[i] }))
	const selectGroupedItems = [
		{
			label: 'Frontend',
			children: [
				{ label: 'Svelte', value: 'svelte' },
				{ label: 'React', value: 'react' },
				{ label: 'Vue', value: 'vue' },
				{ label: 'Solid', value: 'solid' }
			]
		},
		{
			label: 'Backend',
			children: [
				{ label: 'Bun', value: 'bun' },
				{ label: 'Node.js', value: 'node' },
				{ label: 'Deno', value: 'deno' },
				{ label: 'Go', value: 'go' }
			]
		},
		{
			label: 'Database',
			children: [
				{ label: 'Postgres', value: 'postgres' },
				{ label: 'SQLite', value: 'sqlite' },
				{ label: 'MongoDB', value: 'mongodb' }
			]
		}
	]
	const selectItems = $derived(
		activeVariant?.id === 'with-icons'
			? selectIconItems
			: activeVariant?.id === 'grouped'
				? selectGroupedItems
				: selectFlatItems
	)
	let selectValue = $state<unknown>(null)

	const selectCode = $derived.by(() => {
		if (activeVariant?.id === 'with-icons') {
			return `<script>
  import { Select } from '@rokkit/ui'

  const items = [
    { label: 'Option 01', value: 'opt-1',  icon: 'i-mdi:home' },
    { label: 'Option 02', value: 'opt-2',  icon: 'i-mdi:cog'  },
    /* …20 rows */
  ]
  let value = $state(null)
<\/script>

<Select {items} bind:value placeholder="Pick an option" />`
		}
		if (activeVariant?.id === 'grouped') {
			return `<script>
  import { Select } from '@rokkit/ui'

  const items = [
    { label: 'Frontend', children: [
      { label: 'Svelte', value: 'svelte' },
      { label: 'React',  value: 'react'  },
      /* … */
    ]},
    { label: 'Backend',  children: [ /* … */ ] },
    { label: 'Database', children: [ /* … */ ] }
  ]
  let value = $state(null)
<\/script>

<Select {items} bind:value placeholder="Pick a tool" />`
		}
		return `<script>
  import { Select } from '@rokkit/ui'

  const items = Array.from({ length: 20 }, (_, i) => ({
    label: \`Option \${String(i + 1).padStart(2, '0')}\`,
    value: \`opt-\${i + 1}\`
  }))
  let value = $state(null)
<\/script>

<Select {items} bind:value placeholder="Pick an option" />`
	})

	// Form demo state — sign-up form driven by schema
	let formData = $state({
		name: '',
		email: '',
		role: 'user',
		newsletter: true
	})
	const formSchema = {
		type: 'object',
		properties: {
			name: { type: 'string', required: true },
			email: { type: 'string', format: 'email', required: true },
			role: { type: 'string', enum: ['admin', 'editor', 'viewer', 'user'] },
			newsletter: { type: 'boolean' }
		}
	}

	const formCode = `<script>
  import { FormRenderer } from '@rokkit/forms'

  let data = $state({
    name: '',
    email: '',
    role: 'user',
    newsletter: true
  })

  const schema = {
    type: 'object',
    properties: {
      name:       { type: 'string', required: true },
      email:      { type: 'string', format: 'email', required: true },
      role:       { type: 'string', enum: ['admin', 'editor', 'viewer', 'user'] },
      newsletter: { type: 'boolean' }
    }
  }
<\/script>

<FormRenderer bind:data {schema} />`

	// Toasts demo state — handlers + code snippet
	type ToastTone = 'success' | 'warning' | 'error' | 'info'
	const toastMessages: Record<ToastTone, string> = {
		success: 'Changes saved successfully.',
		warning: 'Your session expires in 5 minutes.',
		error: 'Failed to connect — please retry.',
		info: 'A new version is available.'
	}

	function showToast(tone: ToastTone) {
		const timeout = activeVariant?.id === 'auto-dismiss' ? 3000 : 0
		alerts.push({
			type: tone,
			text: toastMessages[tone],
			dismissible: true,
			timeout
		})
	}

	// Toasts variant 'bottom-right' moves the shell's AlertList. Re-derived so
	// the position flips live as the user clicks the chip.
	const alertListPosition = $derived(
		shell.demoType === 'toasts' && activeVariant?.id === 'bottom-right'
			? 'bottom-right'
			: 'top-right'
	)

	function handleSaveWizardPreset() {
		savePreset()
		alerts.push({ type: 'success', text: 'Theme preset saved.' })
	}

	function handleExportTokensCss() {
		downloadTokensCss()
		alerts.push({ type: 'info', text: 'tokens.css download started.' })
	}

	function handleResetWizardPreset() {
		resetPreset()
		alerts.push({ type: 'info', text: 'Theme preset reset to defaults.' })
	}

	const toastsCode = `<script>
  import { Button, AlertList } from '@rokkit/ui'
  import { alerts } from '@rokkit/states'

  function notify(tone) {
    alerts.push({ type: tone, text: 'Changes saved successfully.' })
  }
<\/script>

<AlertList position="top-right" />

<Button variant="primary" onclick={() => notify('success')}>
  Show success
</Button>`

	// List demo state — settings menu with collapsible groups
	const listGroupedItems = [
		{
			label: 'General',
			icon: 'i-mdi:cog-outline',
			children: [
				{ label: 'Profile', icon: 'i-mdi:account-outline' },
				{ label: 'Account', icon: 'i-mdi:shield-account-outline' },
				{ label: 'Notifications', icon: 'i-mdi:bell-outline' }
			]
		},
		{
			label: 'Appearance',
			icon: 'i-mdi:palette-outline',
			children: [
				{ label: 'Theme', icon: 'i-mdi:invert-colors' },
				{ label: 'Density', icon: 'i-mdi:format-line-spacing' },
				{ label: 'Typography', icon: 'i-mdi:format-font' }
			]
		},
		{
			label: 'Advanced',
			icon: 'i-mdi:tune',
			children: [
				{ label: 'Keyboard shortcuts', icon: 'i-mdi:keyboard-outline' },
				{ label: 'Developer', icon: 'i-mdi:code-tags' }
			]
		}
	]
	const listFlatItems = [
		{ label: 'Profile', icon: 'i-mdi:account-outline' },
		{ label: 'Account', icon: 'i-mdi:shield-account-outline' },
		{ label: 'Notifications', icon: 'i-mdi:bell-outline' },
		{ label: 'Theme', icon: 'i-mdi:invert-colors' },
		{ label: 'Density', icon: 'i-mdi:format-line-spacing' },
		{ label: 'Typography', icon: 'i-mdi:format-font' },
		{ label: 'Keyboard shortcuts', icon: 'i-mdi:keyboard-outline' },
		{ label: 'Developer', icon: 'i-mdi:code-tags' }
	]
	const listItems = $derived(
		activeVariant?.id === 'flat' ? listFlatItems : listGroupedItems
	)
	let listValue = $state<unknown>(null)

	const listCode = $derived.by(() => {
		if (activeVariant?.id === 'flat') {
			return `<script>
  import { List } from '@rokkit/ui'

  // No children — List renders a flat list.
  const items = [
    { label: 'Profile',       icon: 'i-mdi:account-outline'        },
    { label: 'Account',       icon: 'i-mdi:shield-account-outline' },
    { label: 'Notifications', icon: 'i-mdi:bell-outline'           },
    /* …8 items */
  ]
  let value = $state(null)
<\/script>

<List {items} bind:value />`
		}
		if (activeVariant?.id === 'snippets') {
			return `<script>
  import { List } from '@rokkit/ui'
  const items = [/* same grouped settings menu */]
  let value = $state(null)
<\/script>

<List {items} collapsible bind:value>
  {#snippet itemContent(proxy)}
    <span class={proxy.get('icon')} aria-hidden="true"></span>
    <span class="custom-label">{proxy.label}</span>
    <span class="custom-badge">{proxy.get('badge') ?? ''}</span>
  {/snippet}
</List>`
		}
		return `<script>
  import { List } from '@rokkit/ui'

  const items = [
    {
      label: 'General',
      icon: 'i-mdi:cog-outline',
      children: [
        { label: 'Profile',       icon: 'i-mdi:account-outline'         },
        { label: 'Account',       icon: 'i-mdi:shield-account-outline'  },
        { label: 'Notifications', icon: 'i-mdi:bell-outline'            }
      ]
    },
    {
      label: 'Appearance',
      icon: 'i-mdi:palette-outline',
      children: [
        { label: 'Theme',      icon: 'i-mdi:invert-colors'        },
        { label: 'Density',    icon: 'i-mdi:format-line-spacing'  },
        { label: 'Typography', icon: 'i-mdi:format-font'          }
      ]
    }
  ]
  let value = $state(null)
<\/script>

<List {items} collapsible bind:value />`
	})

	// MultiSelect demo state — colors with chip overflow
	const colorItems = [
		{ label: 'Red', value: 'red' },
		{ label: 'Orange', value: 'orange' },
		{ label: 'Yellow', value: 'yellow' },
		{ label: 'Green', value: 'green' },
		{ label: 'Blue', value: 'blue' },
		{ label: 'Indigo', value: 'indigo' },
		{ label: 'Violet', value: 'violet' },
		{ label: 'Pink', value: 'pink' }
	]
	let selectedColors = $state<string[]>(['red', 'blue'])

	const multiSelectCode = `<script>
  import { MultiSelect } from '@rokkit/ui'

  const items = [
    { label: 'Red',    value: 'red'    },
    { label: 'Orange', value: 'orange' },
    { label: 'Yellow', value: 'yellow' },
    { label: 'Green',  value: 'green'  },
    { label: 'Blue',   value: 'blue'   },
    { label: 'Indigo', value: 'indigo' },
    { label: 'Violet', value: 'violet' },
    { label: 'Pink',   value: 'pink'   }
  ]
  let value = $state(['red', 'blue'])
<\/script>

<MultiSelect {items} bind:value placeholder="Select colors" />`

	const treeCode = `<script>
  import { Tree } from '@rokkit/ui'

  const items = [
    {
      name: 'src', id: 'src',
      children: [
        {
          name: 'components', id: 'components',
          children: [
            { name: 'Button.svelte', id: 'button' },
            { name: 'Input.svelte',  id: 'input'  }
          ]
        },
        { name: 'index.ts', id: 'index' }
      ]
    }
  ]

  const fields = { label: 'name', value: 'id' }
  let value = $state(null)
<\/script>

<Tree {items} {fields} bind:value />`

	/**
	 * Single source code string that mirrors the LIVE canvas mount —
	 * tracks variant + tweak state so the user sees exactly the code
	 * they'd paste to recreate the current preview, not a static
	 * example. Reads the matching `*Code` $derived constant per demo.
	 */
	const activeDemoCode = $derived.by(() => {
		switch (shell.demoType) {
			case 'tabs':          return tabsCode
			case 'table':         return tableCode
			case 'tree':          return treeCode
			case 'stepper':       return stepperCode
			case 'date-picker':   return dateCode
			case 'combo':         return comboCode
			case 'chart':         return chartCode
			case 'select':        return selectCode
			case 'form':          return formCode
			case 'toasts':        return toastsCode
			case 'list':          return listCode
			case 'multi-select':  return multiSelectCode
			default:              return ''
		}
	})

	onMount(() => {
		if (!browser) return
		const params = new URL(window.location.href).searchParams
		const modeParam = params.get('mode')
		const collapsedParam = params.get('collapsed')
		const q = params.get('q')

		const persistedMode = theme.mode === 'dark' ? 'dark' : 'light'
		const initialMode = modeParam === 'dark' || modeParam === 'light' ? modeParam : persistedMode
		if (theme.mode !== initialMode) theme.setMode(initialMode)
		if (vibe.mode !== initialMode) vibe.mode = initialMode

		if (collapsedParam === 'true' || collapsedParam === '1') {
			shell.collapsed = true
		}
		if (q) {
			koan.query = q
			shell.lastQuery = q
		}
	})
</script>

<svelte:head>
	<title>Koan — Rokkit demo</title>
</svelte:head>

<div class="koan-shell">
	<div class="stage">
		<ChatHistory bind:collapsed={shell.collapsed} onnew={startNewConversation}>
			{#if allConv.length === 0}
				<div class="conv-empty">
					<span class="i-mdi:chat-plus-outline" aria-hidden="true"></span>
					<span>No history yet — ask Rokkit something to start.</span>
				</div>
			{/if}
			{#if buckets.today.length > 0}
				<div class="group-label">Today</div>
				{#each buckets.today as conv (conv.id)}
					<button
						type="button"
						class="conv"
						class:conv-active={conv.id === getCurrentId()}
						data-conv-item
						onclick={() => resumeConversation(conv)}
					>
						<span class="conv-icon {convIcon(conv)}" aria-hidden="true"></span>
						<span class="conv-title">{conv.title}</span>
						<span class="conv-when">{recencyLabel(conv)}</span>
					</button>
				{/each}
			{/if}
			{#if buckets.yesterday.length > 0}
				<div class="group-label">Yesterday</div>
				{#each buckets.yesterday as conv (conv.id)}
					<button
						type="button"
						class="conv"
						class:conv-active={conv.id === getCurrentId()}
						data-conv-item
						onclick={() => resumeConversation(conv)}
					>
						<span class="conv-icon {convIcon(conv)}" aria-hidden="true"></span>
						<span class="conv-title">{conv.title}</span>
						<span class="conv-when">{recencyLabel(conv)}</span>
					</button>
				{/each}
			{/if}
			{#if buckets.earlier.length > 0}
				<div class="group-label">Earlier</div>
				{#each buckets.earlier as conv (conv.id)}
					<button
						type="button"
						class="conv"
						class:conv-active={conv.id === getCurrentId()}
						data-conv-item
						onclick={() => resumeConversation(conv)}
					>
						<span class="conv-icon {convIcon(conv)}" aria-hidden="true"></span>
						<span class="conv-title">{conv.title}</span>
						<span class="conv-when">{recencyLabel(conv)}</span>
					</button>
				{/each}
			{/if}
			{#snippet collapsedBody()}
				{#each allConv.slice(0, 8) as conv (conv.id)}
					<button
						type="button"
						class="conv-mini"
						class:conv-mini-active={conv.id === getCurrentId()}
						title={conv.title}
						onclick={() => resumeConversation(conv)}
					>
						<span class="conv-icon {convIcon(conv)}" aria-hidden="true"></span>
					</button>
				{/each}
			{/snippet}
			{#snippet footer()}
				<span>{allConv.length} {allConv.length === 1 ? 'conversation' : 'conversations'}</span>
			{/snippet}
		</ChatHistory>

		<aside class="chat-left">
			<div class="chat-header">
				<span class="chat-title">
					Conversation
					{#if shell.phase !== 'welcome'}
						<span class="chat-sub">· {shell.lastQuery}</span>
					{/if}
				</span>
			</div>

			{#if shell.phase === 'welcome'}
				<div class="welcome-stream">
					<h2 class="welcome-hello">Welcome back.</h2>
					<p class="welcome-lede">
						Tell me what you want to build. As you type I'll match
						components from the catalog — or press <kbd>⌘</kbd><kbd>↵</kbd>
						to send.
					</p>

					<ComposerSuggestions
						query={shell.composerValue}
						onpick={pickSuggestion}
					/>

					<a class="welcome-browse" href="/app/catalog">
						<span class="i-mdi:view-grid-outline" aria-hidden="true"></span>
						Browse the full catalog
						<span class="i-mdi:arrow-right" aria-hidden="true"></span>
					</a>
				</div>
			{:else if shell.phase === 'catalog'}
				<div class="welcome-stream">
					<h2 class="welcome-hello">Catalog</h2>
					<p class="welcome-lede">
						Every component in the library. Pick a tile on the right to
						mount it — or filter from the composer below.
					</p>

					<ComposerSuggestions
						query={shell.composerValue}
						onpick={pickSuggestion}
					/>

					<a class="welcome-browse" href="/app">
						<span class="i-mdi:arrow-left" aria-hidden="true"></span>
						Back to welcome
					</a>
				</div>
			{:else if shell.phase === 'thinking'}
				<ChatStream>
					<ChatMessage
						kind="user"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="understood"
						icon="i-mdi:layers-outline"
					>
						Three things — locate the matching component in
						<code>@rokkit/ui</code>, mount it with sample data,
						and surface the Svelte source you'd copy.
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="located"
						icon="i-mdi:magnify"
					>
						Component reads <code>items</code> + binds
						<code>value</code>. Style cascades from
						<code>data-style</code> on the shell.
					</ChatMessage>
					<ChatMessage
						kind="think"
						status="mounting"
					>
						wiring sample data and the style cascade…
					</ChatMessage>
					{#if variantChipItems.length > 0}
						<ChatMessage kind="info" status="try-variants" icon="i-mdi:auto-fix">
							Pick a variant — same canvas, different shape or props. URL
							updates so each pick is bookmarkable.
						</ChatMessage>
						<Chips items={variantChipItems} onselect={pickVariant} />
					{/if}
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'tabs'}
				<ChatStream>
					<ChatMessage
						kind="user"
						ago="2m"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="mounted"
						ago="just now"
						icon="i-mdi:layers-outline"
					>
						<code>&lt;Tabs/&gt;</code> from <code>@rokkit/ui</code> on the canvas.
						Five panes from <code>items</code>. The style on screen is whatever
						<code>data-style</code> is set to — there is no <code>variant</code> prop.
						<button type="button" class="mounted-callout" onclick={resetVariant} disabled={!activeVariant}>
								<span class="callout-label">Canvas →</span>
								<span>Tabs · how the data-driven API works</span>
							</button>
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="explained"
						icon="i-mdi:book-open-variant"
					>
						<strong>Items in, value out.</strong> The component owns selection,
						keyboard nav, focus, a11y. You hand it data, it hands you back
						which one is active.
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="try"
						icon="i-mdi:palette"
					>
						Flip the <em>style</em> at the top of the window — the same Tabs
						re-renders. Or copy the source on the right and paste it in.
					</ChatMessage>
					{#if variantChipItems.length > 0}
						<ChatMessage kind="info" status="try-variants" icon="i-mdi:auto-fix">
							Same component, different shape or props. Pick one to see it
							re-render — bookmarkable via the URL.
						</ChatMessage>
						<Chips items={variantChipItems} onselect={pickVariant} />
					{/if}
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'theme-wizard'}
				<ChatStream>
					<ChatMessage
						kind="user"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="started"
						ago="just now"
						icon="i-mdi:palette"
					>
						Opened the theme wizard on the canvas. Step 02 — Skin — is active.
						Each role on the left can pick its palette and step. Mode-aware:
						light + dark share roles, swap palette steps.
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="glossary"
						icon="i-mdi:book-open-variant"
					>
						<ul class="glossary">
							<li><strong>Palette</strong> — a 50→950 color scale.</li>
							<li>
								<strong>Skin</strong> — roles (paper, ink, accent…) mapped to a
								palette + step. Optionally dual-mapped for light + dark.
							</li>
							<li>
								<strong>Style</strong> — the thematic character: zen-sumi
								(underline), rokkit (block), minimal, material.
							</li>
							<li><strong>Density</strong> — padding rhythm. Chrome-wide attribute.</li>
						</ul>
					</ChatMessage>
					{#if variantChipItems.length > 0}
						<ChatMessage kind="info" status="try-variants" icon="i-mdi:auto-fix">
							Want to see the wizard in a different shape? Pick one — same
							canvas, different presentation.
						</ChatMessage>
						<Chips items={variantChipItems} onselect={pickVariant} />
					{/if}
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'table'}
				<ChatStream>
					<ChatMessage
						kind="user"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="mounted"
						ago="just now"
						icon="i-mdi:table"
					>
						<code>&lt;Table/&gt;</code> from <code>@rokkit/ui</code> on the canvas.
						Columns inferred from the rows. Click a header to sort; shift-click
						to sort by multiple columns.
						<button type="button" class="mounted-callout" onclick={resetVariant} disabled={!activeVariant}>
								<span class="callout-label">Canvas →</span>
								<span>Sortable Products table</span>
							</button>
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="explained"
						icon="i-mdi:book-open-variant"
					>
						<strong>Data in, sortable grid out.</strong> No column config needed
						for the common case — Table reads the first row to derive columns,
						types, and alignment. Override with <code>columns</code> when you
						need formatters, fixed widths, or custom snippets.
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="try"
						icon="i-mdi:gesture-tap"
					>
						Sort by <em>price</em>, then shift-click <em>stock</em> to add a
						secondary sort. Or copy the source on the right.
					</ChatMessage>
					{#if variantChipItems.length > 0}
						<ChatMessage kind="info" status="try-variants" icon="i-mdi:auto-fix">
							Pick a variant — same canvas, different shape or props. URL
							updates so each pick is bookmarkable.
						</ChatMessage>
						<Chips items={variantChipItems} onselect={pickVariant} />
					{/if}
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'stepper'}
				<ChatStream>
					<ChatMessage
						kind="user"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="mounted"
						ago="just now"
						icon="i-mdi:stairs"
					>
						<code>&lt;Stepper/&gt;</code> from <code>@rokkit/ui</code> on the
						canvas. Four steps — Account / Profile / Preferences / Review —
						with two marked <code>completed</code>. Bind <code>current</code>
						for two-way nav; pass <code>onclick</code> to handle step taps.
						<button type="button" class="mounted-callout" onclick={resetVariant} disabled={!activeVariant}>
								<span class="callout-label">Canvas →</span>
								<span>4-step sign-up flow</span>
							</button>
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="explained"
						icon="i-mdi:book-open-variant"
					>
						<strong>Steps are data, not markup.</strong> The array of
						<code>{'{ label, completed }'}</code> drives the display. Set
						<code>completed: true</code> as the user finishes each step;
						clicking a completed step jumps back. The "Complete &amp; Next"
						button below shows the imperative pattern for advancing
						programmatically.
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="try"
						icon="i-mdi:gesture-tap"
					>
						Click "Complete &amp; Next" to mark the active step done and
						advance. Click any completed step header to revisit it.
					</ChatMessage>
					{#if variantChipItems.length > 0}
						<ChatMessage kind="info" status="try-variants" icon="i-mdi:auto-fix">
							Pick a variant — same canvas, different shape or props. URL
							updates so each pick is bookmarkable.
						</ChatMessage>
						<Chips items={variantChipItems} onselect={pickVariant} />
					{/if}
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'date-picker'}
				<ChatStream>
					<ChatMessage
						kind="user"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="mounted"
						ago="just now"
						icon="i-mdi:calendar"
					>
						<code>&lt;FormRenderer/&gt;</code> on the canvas with two fields —
						<em>eventDate</em> uses <code>format: 'date'</code> and
						<em>startsAt</em> uses <code>format: 'date-time'</code>. The
						format hint dispatches to <code>InputDate</code> and
						<code>InputDateTime</code> respectively — same string-type schema,
						different renderer.
						<button type="button" class="mounted-callout" onclick={resetVariant} disabled={!activeVariant}>
								<span class="callout-label">Canvas →</span>
								<span>Event date + start time</span>
							</button>
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="explained"
						icon="i-mdi:book-open-variant"
					>
						<strong>Format-driven dispatch.</strong> The schema's
						<code>format</code> property picks the right input — <em>date</em>,
						<em>date-time</em>, <em>email</em>, <em>uri</em>, etc. Bound values
						are ISO-8601 strings (yyyy-mm-dd or yyyy-mm-ddThh:mm). Compose with
						<code>required</code>, <code>min</code>, <code>max</code> for
						validation.
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="try"
						icon="i-mdi:gesture-tap"
					>
						Click a field to open the native browser calendar / time picker.
						Edit either one — the bound <code>data</code> updates live.
					</ChatMessage>
					{#if variantChipItems.length > 0}
						<ChatMessage kind="info" status="try-variants" icon="i-mdi:auto-fix">
							Pick a variant — same canvas, different shape or props. URL
							updates so each pick is bookmarkable.
						</ChatMessage>
						<Chips items={variantChipItems} onselect={pickVariant} />
					{/if}
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'combo'}
				<ChatStream>
					<ChatMessage
						kind="user"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="mounted"
						ago="just now"
						icon="i-mdi:magnify"
					>
						<code>&lt;Select filterable/&gt;</code> from <code>@rokkit/ui</code>
						on the canvas with a country list of 42 options. Same Select
						component as before — the <code>filterable</code> prop is the
						only difference. Type to narrow.
						<button type="button" class="mounted-callout" onclick={resetVariant} disabled={!activeVariant}>
								<span class="callout-label">Canvas →</span>
								<span>Countries · type-to-filter</span>
							</button>
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="when-to-use"
						icon="i-mdi:compare-horizontal"
					>
						<strong>Combobox</strong> when the option count is too large for a
						casual scan — typing is faster than navigating. <strong>Plain
						Select</strong> for short fixed lists (under ~10 options) where
						the user just picks from what's visible.
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="try"
						icon="i-mdi:gesture-tap"
					>
						Open the dropdown. Start typing — e.g. "ne" narrows to Netherlands,
						New Zealand. Arrow keys walk the filtered set; Enter selects;
						Escape clears the filter without closing.
					</ChatMessage>
					{#if variantChipItems.length > 0}
						<ChatMessage kind="info" status="try-variants" icon="i-mdi:auto-fix">
							Pick a variant — same canvas, different shape or props. URL
							updates so each pick is bookmarkable.
						</ChatMessage>
						<Chips items={variantChipItems} onselect={pickVariant} />
					{/if}
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'chart'}
				<ChatStream>
					<ChatMessage
						kind="user"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="mounted"
						ago="just now"
						icon="i-mdi:chart-bar"
					>
						<code>&lt;BarChart/&gt;</code> from <code>@rokkit/chart</code> on the
						canvas. Four rows of quarterly revenue, mapped to <code>x</code>
						and <code>y</code> fields — the SVG is built from the data.
						Palette colors, gridlines, and hover tooltips come for free.
						<button type="button" class="mounted-callout" onclick={resetVariant} disabled={!activeVariant}>
								<span class="callout-label">Canvas →</span>
								<span>Quarterly revenue · Q1–Q4</span>
							</button>
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="explained"
						icon="i-mdi:book-open-variant"
					>
						<strong>Field-mapped, declarative.</strong> No D3 boilerplate, no
						manual axis math. The data shape drives everything via
						<code>x</code>, <code>y</code>, <code>fill</code>, <code>label</code>,
						<code>stack</code>, and <code>stat</code> props. Aggregations and
						color grouping are one keyword each.
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="try"
						icon="i-mdi:gesture-tap"
					>
						Hover a bar for the tooltip. Flip the chrome <em>style</em> to see
						the chart re-skin via palette tokens — same data, different look.
					</ChatMessage>
					{#if variantChipItems.length > 0}
						<ChatMessage kind="info" status="try-variants" icon="i-mdi:auto-fix">
							Pick a variant — same canvas, different shape or props. URL
							updates so each pick is bookmarkable.
						</ChatMessage>
						<Chips items={variantChipItems} onselect={pickVariant} />
					{/if}
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'select'}
				<ChatStream>
					<ChatMessage
						kind="user"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="mounted"
						ago="just now"
						icon="i-mdi:menu-down"
					>
						<code>&lt;Select/&gt;</code> from <code>@rokkit/ui</code> on the canvas
						— single-pick counterpart to MultiSelect. Twenty options stress-test
						the scroll + keyboard navigation; <code>maxRows</code> caps the
						visible window at 8 by default.
						<button type="button" class="mounted-callout" onclick={resetVariant} disabled={!activeVariant}>
								<span class="callout-label">Canvas →</span>
								<span>20 options · scroll for the rest</span>
							</button>
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="explained"
						icon="i-mdi:book-open-variant"
					>
						<strong>One value, many options.</strong> Same items + fields shape
						as MultiSelect, but a single value binding. The dropdown caps its
						height to <code>maxRows × item-height</code> and overflows with
						scroll. Override per-component with the <code>maxRows</code> prop,
						or globally with <code>--select-dropdown-max-height</code>.
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="try"
						icon="i-mdi:gesture-tap"
					>
						Open the dropdown. Mouse-scroll to the bottom; arrow keys walk;
						Home / End jump; type a few characters for prefix-match navigation.
					</ChatMessage>
					{#if variantChipItems.length > 0}
						<ChatMessage kind="info" status="try-variants" icon="i-mdi:auto-fix">
							Pick a variant — same canvas, different shape or props. URL
							updates so each pick is bookmarkable.
						</ChatMessage>
						<Chips items={variantChipItems} onselect={pickVariant} />
					{/if}
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'form'}
				<ChatStream>
					<ChatMessage
						kind="user"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="mounted"
						ago="just now"
						icon="i-mdi:form-textbox"
					>
						<code>&lt;FormRenderer/&gt;</code> from <code>@rokkit/forms</code> on
						the canvas. JSON-Schema-ish object in; the right input per type
						(text / email / select / checkbox) is rendered, validated, and bound
						to the data object via <code>bind:data</code>.
						<button type="button" class="mounted-callout" onclick={resetVariant} disabled={!activeVariant}>
								<span class="callout-label">Canvas →</span>
								<span>Four fields · sign-up shape</span>
							</button>
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="explained"
						icon="i-mdi:book-open-variant"
					>
						<strong>Schema in, form out.</strong> No template per field, no
						per-input boilerplate. <code>required</code>, <code>format</code>,
						and <code>enum</code> drive validation and rendering. Need more
						control? Pass a <code>layout</code> for ordering / sections, or
						switch to <code>FormBuilder</code> for imperative updates + dirty
						tracking.
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="try"
						icon="i-mdi:gesture-tap"
					>
						Type in the fields. <em>email</em> validates as you type;
						<em>role</em> renders as a select because of the enum;
						<em>newsletter</em> renders as a toggle because of the boolean type.
					</ChatMessage>
					{#if variantChipItems.length > 0}
						<ChatMessage kind="info" status="try-variants" icon="i-mdi:auto-fix">
							Pick a variant — same canvas, different shape or props. URL
							updates so each pick is bookmarkable.
						</ChatMessage>
						<Chips items={variantChipItems} onselect={pickVariant} />
					{/if}
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'toasts'}
				<ChatStream>
					<ChatMessage
						kind="user"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="mounted"
						ago="just now"
						icon="i-mdi:bell-outline"
					>
						<code>&lt;AlertList/&gt;</code> + the <code>alerts</code> store from
						<code>@rokkit/states</code>. Push from anywhere — alerts stack at the
						configured position, dismiss on click or timeout.
						<button type="button" class="mounted-callout" onclick={resetVariant} disabled={!activeVariant}>
								<span class="callout-label">Canvas →</span>
								<span>Four buttons · one per tone</span>
							</button>
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="explained"
						icon="i-mdi:book-open-variant"
					>
						<strong>Imperative, not declarative.</strong> Most components are
						data-bound — Toasts aren't. You push an alert with
						<code>alerts.push(&#123; type, text &#125;)</code> and the AlertList
						mounted anywhere in the tree renders it. One store, many call sites.
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="try"
						icon="i-mdi:gesture-tap"
					>
						Click a button on the canvas. Each tone gets a different border + icon.
						Toasts auto-dismiss after a few seconds, or click them to dismiss early.
					</ChatMessage>
					{#if variantChipItems.length > 0}
						<ChatMessage kind="info" status="try-variants" icon="i-mdi:auto-fix">
							Pick a variant — same canvas, different shape or props. URL
							updates so each pick is bookmarkable.
						</ChatMessage>
						<Chips items={variantChipItems} onselect={pickVariant} />
					{/if}
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'list'}
				<ChatStream>
					<ChatMessage
						kind="user"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="mounted"
						ago="just now"
						icon="i-mdi:format-list-bulleted"
					>
						<code>&lt;List/&gt;</code> from <code>@rokkit/ui</code> on the canvas
						with <code>collapsible</code> turned on. Three group headers — General,
						Appearance, Advanced — each owns its items via <code>children</code>.
						<button type="button" class="mounted-callout" onclick={resetVariant} disabled={!activeVariant}>
								<span class="callout-label">Canvas →</span>
								<span>Settings menu · collapsible groups</span>
							</button>
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="when-to-use"
						icon="i-mdi:compare-horizontal"
					>
						<strong>List with collapsible groups</strong> when the items are the
						focus and the groups are just headings (settings panels, sidebar
						navigation, command palettes). <strong>Tree</strong> when the
						hierarchy itself is the point (file systems, org charts, multi-level
						nesting).
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="try"
						icon="i-mdi:gesture-tap"
					>
						Click a group header to collapse it. Click an item to select.
						Same API works flat — drop the <code>children</code> for a flat list.
					</ChatMessage>
					{#if variantChipItems.length > 0}
						<ChatMessage kind="info" status="try-variants" icon="i-mdi:auto-fix">
							Pick a variant — same canvas, different shape or props. URL
							updates so each pick is bookmarkable.
						</ChatMessage>
						<Chips items={variantChipItems} onselect={pickVariant} />
					{/if}
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'multi-select'}
				<ChatStream>
					<ChatMessage
						kind="user"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="mounted"
						ago="just now"
						icon="i-mdi:select-multiple"
					>
						<code>&lt;MultiSelect/&gt;</code> from <code>@rokkit/ui</code> on the
						canvas. Items mapped via <code>{'{ label, value }'}</code>; selected
						values render as chips inside the trigger. <code>bind:value</code>
						gives you an array of the picked values.
						<button type="button" class="mounted-callout" onclick={resetVariant} disabled={!activeVariant}>
								<span class="callout-label">Canvas →</span>
								<span>Eight colors · two pre-selected</span>
							</button>
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="explained"
						icon="i-mdi:book-open-variant"
					>
						<strong>One component, many choices.</strong> Click the trigger to
						open the dropdown, click an option to toggle it. Click a chip in
						the trigger to remove just that one. Keyboard nav works throughout.
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="try"
						icon="i-mdi:gesture-tap"
					>
						Add a few more colors, then click a chip to remove it. The
						<code>value</code> array updates live — useful for forms or filters.
					</ChatMessage>
					{#if variantChipItems.length > 0}
						<ChatMessage kind="info" status="try-variants" icon="i-mdi:auto-fix">
							Pick a variant — same canvas, different shape or props. URL
							updates so each pick is bookmarkable.
						</ChatMessage>
						<Chips items={variantChipItems} onselect={pickVariant} />
					{/if}
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'tree'}
				<ChatStream>
					<ChatMessage
						kind="user"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="mounted"
						ago="just now"
						icon="i-mdi:file-tree"
					>
						<code>&lt;Tree/&gt;</code> from <code>@rokkit/ui</code> on the canvas.
						Nested items via <code>children</code>; label / value mapped from
						the row shape via <code>fields</code>. Arrow keys + Enter navigate.
						<button type="button" class="mounted-callout" onclick={resetVariant} disabled={!activeVariant}>
								<span class="callout-label">Canvas →</span>
								<span>File tree · expand / collapse</span>
							</button>
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="when-to-use"
						icon="i-mdi:compare-horizontal"
					>
						<strong>Tree</strong> when the hierarchy is the point — multi-level
						nesting, file systems, org charts. <strong>List with collapsible
						groups</strong> for shallow 1–2 level grouping where the items are
						the focus and the groups are just headings.
					</ChatMessage>
					<ChatMessage
						kind="info"
						status="try"
						icon="i-mdi:gesture-tap"
					>
						Click a folder to expand. Arrow keys walk the tree; Enter selects.
						Selection is bound — <em>value</em> updates as you navigate.
					</ChatMessage>
					{#if variantChipItems.length > 0}
						<ChatMessage kind="info" status="try-variants" icon="i-mdi:auto-fix">
							Pick a variant — same canvas, different shape or props. URL
							updates so each pick is bookmarkable.
						</ChatMessage>
						<Chips items={variantChipItems} onselect={pickVariant} />
					{/if}
				</ChatStream>
			{/if}

			{#if shell.phase === 'response' && hasDetails && tweaksOpen && shell.demoType}
				<div class="tweaks-slab" data-glide-in>
					<DetailsSlab
						demoId={shell.demoType}
						propsSchema={propsSchema}
						tweakValues={tweakProps}
						api={demoApi}
						onTweakChange={setTweak}
						onTweakReset={resetTweaks}
						onTweakCopy={copyTweaks}
					/>
				</div>
			{/if}

			<ChatComposer
				bind:value={shell.composerValue}
				placeholder={shell.phase === 'welcome'
					? 'Ask anything · type / for commands'
					: 'Refine · ask follow-ups · request another component'}
				running={shell.phase === 'thinking'}
				onsubmit={submitQuery}
			>
				{#snippet rightActions()}
					{#if shell.phase === 'response' && hasDetails}
						<button
							type="button"
							class="composer-tweak-toggle"
							data-on={tweaksOpen ? '' : undefined}
							aria-pressed={tweaksOpen}
							onclick={() => (tweaksOpen = !tweaksOpen)}
							title={tweaksOpen ? 'Hide details' : 'Show details (tweaks · API · source)'}
						>
							<span class="i-mdi:tune-variant" aria-hidden="true"></span>
							<span class="composer-tweak-label">tweak</span>
						</button>
					{/if}
				{/snippet}
			</ChatComposer>
		</aside>

		<main class="canvas">
			{#if shell.phase === 'response' && canvasViewOptions.length > 1}
				<div class="canvas-view-toggle">
					<Toggle options={canvasViewOptions} bind:value={canvasView} size="sm" />
				</div>
			{/if}

			{#if shell.phase === 'response' && tweakCount > 0}
				<div class="canvas-tweaks-strip" role="status">
					<span class="i-mdi:tune-variant" aria-hidden="true"></span>
					<span class="canvas-tweaks-count">
						{tweakCount} tweak{tweakCount === 1 ? '' : 's'} active
					</span>
					<span class="canvas-tweaks-spacer"></span>
					<button type="button" class="canvas-tweaks-reset" onclick={resetTweaks}>
						Reset
					</button>
				</div>
			{/if}

			{#if shell.phase === 'response' && canvasView === 'api' && demoApi}
				<div class="canvas-head">
					<div class="canvas-eyebrow">API · reference</div>
					<div class="canvas-title">{findById(shell.demoType ?? '')?.title ?? 'Component'} — public surface</div>
					<div class="canvas-sub">
						The props, events, and data-attribute hooks every consumer can rely on.
					</div>
				</div>
				<div class="canvas-body api">
					<APIPanel api={demoApi} />
				</div>
			{:else if shell.phase === 'response' && canvasView === 'code' && activeDemoCode}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Code · current preview</div>
					<div class="canvas-title">{findById(shell.demoType ?? '')?.title ?? 'Component'} — source for this configuration</div>
					<div class="canvas-sub">
						Tracks the variant and tweaks from the Live view — copy and paste to recreate what's
						mounted right now.
					</div>
				</div>
				<div class="canvas-body code">
					<CodeBlock
						code={activeDemoCode}
						filename="{shell.demoType}.demo.svelte"
						language="svelte"
						allowCopy
					/>
				</div>
			{:else if shell.phase === 'response' && canvasView === 'docs' && demoDocs}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Docs · concepts</div>
					<div class="canvas-title">{findById(shell.demoType ?? '')?.title ?? 'Component'} — design intent</div>
					<div class="canvas-sub">
						Long-form notes on the component's design principles, data shape, and when to reach
						for it. Code samples and the API table live in their own canvas modes.
					</div>
				</div>
				<div class="canvas-body docs">
					<article data-demo-docs>
						<MarkdownRenderer markdown={demoDocs} />
					</article>
				</div>
			{:else if shell.phase === 'welcome'}
				<div class="welcome-hero">
					<div class="mark"><RokkitWordmark height={64} /></div>
					<div class="lede">Pass the data. The component does the rest.</div>
					<div class="sub">
						Type a question on the left. The answer mounts here — themed,
						density-tuned, copyable, and identical to what you'd ship.
					</div>
					<div class="meta">
						<span>style</span>
						<span class="meta-value">{vibe.style}</span>
						<span class="meta-sep">·</span>
						<span>47 components</span>
						<span class="meta-sep">·</span>
						<span>Svelte 5 runes</span>
					</div>
				</div>
			{:else if shell.phase === 'catalog'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Browse · catalog</div>
					<div class="canvas-title">Every component, one click away</div>
					<div class="canvas-sub">
						Type to filter, or jump straight into a tile. Each lands you
						on the live demo with the chat on the left and Tweaks at hand.
					</div>
				</div>
				<div class="canvas-body catalog">
					<CatalogGrid filter={shell.composerValue} />
				</div>
			{:else if shell.phase === 'thinking'}
				<div class="canvas-head preparing">
					<div class="canvas-eyebrow">Canvas · preparing</div>
					<div class="canvas-title">{shell.lastQuery}</div>
					<div class="canvas-sub">
						A live preview, the source, and the levers that change its look.
					</div>
				</div>
				<div class="canvas-body thinking">
					<span class="koan-spinner" aria-hidden="true"></span>
					<span class="thinking-step">mounting — step 3 of 4</span>
				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'tabs'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live{#if activeVariant} · variant: {activeVariant.label.toLowerCase()}{/if}</div>
					<div class="canvas-title">Tabs · how the data-driven API works</div>
					<div class="canvas-sub">
						Five panes from one <code>items</code> array. Selection is bound.
						Style comes from <code>data-style</code> on the parent. Flip the
						chrome toggle to see it re-render.
						{#if activeVariant}
							<br /><em>Variant active</em> — {activeVariant.label.toLowerCase()}.
						{/if}
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;Tabs/&gt;"
						meta={`· @rokkit/ui · style=${vibe.style}${activeVariant ? ` · variant=${activeVariant.id}` : ''}`}
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:layers-outline" aria-hidden="true"></span>
						{/snippet}
						<div class="tabs-mount">
							<Tabs options={tabsItems} bind:value={activeTab} {...variantProps} {...tweakProps} />
						</div>
						{#snippet props()}
							<span>items</span><span data-value>[5]</span>
							<span data-sep>·</span>
							<span>style</span><span data-value>{vibe.style}</span>
							{#if activeVariant}
								<span data-sep>·</span>
								<span>variant</span><span data-value>{activeVariant.id}</span>
							{/if}
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
							<button type="button">
								<span class="i-mdi:download" aria-hidden="true"></span>
								Download
							</button>
						{/snippet}
					</ChatResponse>

				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'theme-wizard'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Theme wizard · live preview{#if activeVariant} · variant: {activeVariant.label.toLowerCase()}{/if}</div>
					<div class="canvas-title">Build a theme · step 02 of 04</div>
					<div class="canvas-sub">
						Style chosen; now map roles to palette steps. The right side previews
						each role on the running app.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;ThemeWizard/&gt;"
						meta={`· step 02 · skin${activeVariant ? ` · variant=${activeVariant.id}` : ''}`}
						kicker="WIZARD"
					>
						{#snippet icon()}
							<span class="i-mdi:palette" aria-hidden="true"></span>
						{/snippet}
						<div class="wizard-mount" data-variant={activeVariant?.id ?? undefined}>
							<ThemeWizardCard {mode} />
							{#if activeVariant?.id === 'tokens-preview'}
								<div class="tokens-preview">
									<div class="tokens-preview-head">
										<span class="i-mdi:code-tags" aria-hidden="true"></span>
										<strong>tokens.css</strong>
										<span class="tokens-hint">live preview of the generated stylesheet</span>
									</div>
									<pre class="tokens-pre"><code>{exportTokensCss()}</code></pre>
								</div>
							{/if}
						</div>
						{#snippet props()}
							<span>style</span><span data-value>{vibe.style}</span>
							<span data-sep>·</span>
							<span>palette</span><span data-value>warm-gray + shu</span>
							<span data-sep>·</span>
							<span>columns</span><span data-value>{activeVariant?.id === 'dark-only' ? 'dark only' : 'light + dark'}</span>
							{#if activeVariant}
								<span data-sep>·</span>
								<span>variant</span><span data-value>{activeVariant.id}</span>
							{/if}
						{/snippet}
						{#snippet actions()}
							<button type="button" onclick={handleSaveWizardPreset}>
								<span class="i-mdi:content-save-outline" aria-hidden="true"></span>
								Save preset
							</button>
							<button type="button" onclick={handleExportTokensCss}>
								<span class="i-mdi:download" aria-hidden="true"></span>
								Export tokens.css
							</button>
							<button type="button" onclick={handleResetWizardPreset}>
								<span class="i-mdi:restore" aria-hidden="true"></span>
								Reset to defaults
							</button>
						{/snippet}
					</ChatResponse>
				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'table'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live{#if activeVariant} · variant: {activeVariant.label.toLowerCase()}{/if}</div>
					<div class="canvas-title">Table · sortable, data-driven</div>
					<div class="canvas-sub">
						Six rows of products. Columns inferred from the row shape — no schema
						required. Click a header to sort; shift-click to add secondary sorts.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;Table/&gt;"
						meta={`· @rokkit/ui · style=${vibe.style}${activeVariant ? ` · variant=${activeVariant.id}` : ''}`}
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:table" aria-hidden="true"></span>
						{/snippet}
						<div class="table-mount" data-variant={activeVariant?.id ?? undefined}>
							<Table
								data={tableData}
								columns={tableColumns}
								caption="Products"
								{...variantProps}
							/>
						</div>
						{#snippet props()}
							<span>rows</span><span data-value>[6]</span>
							<span data-sep>·</span>
							<span>columns</span><span data-value>inferred</span>
							<span data-sep>·</span>
							<span>sortable</span><span data-value>yes</span>
							{#if activeVariant}
								<span data-sep>·</span>
								<span>variant</span><span data-value>{activeVariant.id}</span>
							{/if}
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
							<button type="button">
								<span class="i-mdi:download" aria-hidden="true"></span>
								Download
							</button>
						{/snippet}
					</ChatResponse>

				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'stepper'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live{#if activeVariant} · variant: {activeVariant.label.toLowerCase()}{/if}</div>
					<div class="canvas-title">Stepper · sequenced progress</div>
					<div class="canvas-sub">
						Four steps, two already complete. Click a completed step header to
						revisit; click "Complete &amp; Next" to advance.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;Stepper/&gt;"
						meta={`· @rokkit/ui · style=${vibe.style}${activeVariant ? ` · variant=${activeVariant.id}` : ''}`}
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:stairs" aria-hidden="true"></span>
						{/snippet}
						{#snippet stepperContent(step: { text: string }, _index: number)}
							<p class="step-blurb">{stepperBlurbs[step.text] ?? ''}</p>
						{/snippet}
						<div class="stepper-mount" data-orientation={variantProps.orientation ?? 'horizontal'}>
							<Stepper
								steps={stepperSteps}
								bind:current={stepperCurrent}
								onclick={(i: number) => (stepperCurrent = i)}
								content={activeVariant?.id === 'with-content' ? stepperContent : undefined}
								{...variantProps}
							/>
							<Button onclick={stepperAdvance}>Complete &amp; Next</Button>
						</div>
						{#snippet props()}
							<span>steps</span><span data-value>[{stepperSteps.length}]</span>
							<span data-sep>·</span>
							<span>current</span><span data-value>{stepperCurrent}</span>
							<span data-sep>·</span>
							<span>active</span><span data-value>{stepperSteps[stepperCurrent]?.text}</span>
							{#if activeVariant}
								<span data-sep>·</span>
								<span>variant</span><span data-value>{activeVariant.id}</span>
							{/if}
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
						{/snippet}
					</ChatResponse>

				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'date-picker'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live{#if activeVariant} · variant: {activeVariant.label.toLowerCase()}{/if}</div>
					<div class="canvas-title">Date Picker · format-driven</div>
					<div class="canvas-sub">
						Two fields, one schema. <code>format: 'date'</code> →
						<code>&lt;InputDate/&gt;</code>; <code>format: 'date-time'</code>
						→ <code>&lt;InputDateTime/&gt;</code>. Native calendar / time
						pickers, ISO-8601 strings out.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;InputDate/&gt; · &lt;InputDateTime/&gt;"
						meta={`· @rokkit/forms · style=${vibe.style}${activeVariant ? ` · variant=${activeVariant.id}` : ''}`}
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:calendar" aria-hidden="true"></span>
						{/snippet}
						<div class="date-mount">
							<FormRenderer bind:data={dateData} schema={dateSchema} />
						</div>
						{#snippet props()}
							<span>fields</span><span data-value>[2]</span>
							<span data-sep>·</span>
							<span>eventDate</span><span data-value>{dateData.eventDate || '—'}</span>
							<span data-sep>·</span>
							<span>startsAt</span><span data-value>{dateData.startsAt || '—'}</span>
							{#if activeVariant}
								<span data-sep>·</span>
								<span>variant</span><span data-value>{activeVariant.id}</span>
							{/if}
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
						{/snippet}
					</ChatResponse>

				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'combo'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live{#if activeVariant} · variant: {activeVariant.label.toLowerCase()}{/if}</div>
					<div class="canvas-title">Combobox · type-to-filter Select</div>
					<div class="canvas-sub">
						42 countries. Same Select component as before — flip the
						<code>filterable</code> prop and you get a search box at the top
						of the dropdown. Type to narrow.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;Select filterable/&gt;"
						meta={`· @rokkit/ui · style=${vibe.style}${activeVariant ? ` · variant=${activeVariant.id}` : ''}`}
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:magnify" aria-hidden="true"></span>
						{/snippet}
						<div class="combo-mount">
							<Select
								items={countryItems}
								bind:value={comboValue}
								filterable={variantProps.filterable !== false}
								placeholder={activeVariant?.id === 'with-counts'
									? `Type to search · ${countryItems.length} countries available`
									: 'Type to search countries'}
								{...variantProps}
							/>
							{#if activeVariant?.id === 'with-counts' && comboValue}
								<p class="combo-count">Picked: <strong>{String(comboValue)}</strong> · 1 of {countryItems.length}</p>
							{/if}
						</div>
						{#snippet props()}
							<span>options</span><span data-value>[42]</span>
							<span data-sep>·</span>
							<span>filterable</span><span data-value>{variantProps.filterable === false ? 'no' : 'yes'}</span>
							<span data-sep>·</span>
							<span>selected</span><span data-value>{String(comboValue ?? '—')}</span>
							{#if activeVariant}
								<span data-sep>·</span>
								<span>variant</span><span data-value>{activeVariant.id}</span>
							{/if}
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
						{/snippet}
					</ChatResponse>

				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'chart'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live{#if activeVariant} · variant: {activeVariant.label.toLowerCase()}{/if}</div>
					<div class="canvas-title">BarChart · data-driven SVG</div>
					<div class="canvas-sub">
						Quarterly revenue. Pass rows + <code>x</code>/<code>y</code> field
						names; <code>&lt;BarChart/&gt;</code> handles the axes, palette,
						gridlines, and tooltips.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;BarChart/&gt;"
						meta={`· @rokkit/chart · style=${vibe.style}${activeVariant ? ` · variant=${activeVariant.id}` : ''}`}
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:chart-bar" aria-hidden="true"></span>
						{/snippet}
						<div class="chart-mount">
							<BarChart data={chartData} x="quarter" y="revenue" {...variantProps} {...tweakProps} />
						</div>
						{#snippet props()}
							<span>rows</span><span data-value>[4]</span>
							<span data-sep>·</span>
							<span>x</span><span data-value>quarter</span>
							<span data-sep>·</span>
							<span>y</span><span data-value>revenue</span>
							{#if activeVariant}
								<span data-sep>·</span>
								<span>variant</span><span data-value>{activeVariant.id}</span>
							{/if}
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
							<button type="button">
								<span class="i-mdi:download" aria-hidden="true"></span>
								Export SVG
							</button>
						{/snippet}
					</ChatResponse>

				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'select'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live{#if activeVariant} · variant: {activeVariant.label.toLowerCase()}{/if}</div>
					<div class="canvas-title">Select · single-pick dropdown</div>
					<div class="canvas-sub">
						Twenty options to exercise scroll + keyboard navigation. Click the
						trigger to open; arrow keys walk; Enter selects; Home/End jump.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;Select/&gt;"
						meta={`· @rokkit/ui · style=${vibe.style}${activeVariant ? ` · variant=${activeVariant.id}` : ''}`}
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:menu-down" aria-hidden="true"></span>
						{/snippet}
						<div class="select-mount">
							<Select items={selectItems} bind:value={selectValue} placeholder="Pick an option" {...variantProps} {...tweakProps} />
						</div>
						{#snippet props()}
							<span>options</span><span data-value>[20]</span>
							<span data-sep>·</span>
							<span>selected</span><span data-value>{String(selectValue ?? '—')}</span>
							{#if activeVariant}
								<span data-sep>·</span>
								<span>variant</span><span data-value>{activeVariant.id}</span>
							{/if}
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
						{/snippet}
					</ChatResponse>

				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'form'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live{#if activeVariant} · variant: {activeVariant.label.toLowerCase()}{/if}</div>
					<div class="canvas-title">Form · schema-driven</div>
					<div class="canvas-sub">
						Four fields generated from a schema — text, email (validated),
						select (enum-derived), boolean toggle. <code>bind:data</code> for
						two-way binding.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;FormRenderer/&gt;"
						meta={`· @rokkit/forms · style=${vibe.style}${activeVariant ? ` · variant=${activeVariant.id}` : ''}`}
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:form-textbox" aria-hidden="true"></span>
						{/snippet}
						<div class="form-mount">
							<FormRenderer bind:data={formData} schema={formSchema} />
						</div>
						{#snippet props()}
							<span>fields</span><span data-value>[4]</span>
							<span data-sep>·</span>
							<span>name</span><span data-value>{formData.name || '—'}</span>
							<span data-sep>·</span>
							<span>role</span><span data-value>{formData.role}</span>
							{#if activeVariant}
								<span data-sep>·</span>
								<span>variant</span><span data-value>{activeVariant.id}</span>
							{/if}
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
							<button type="button">
								<span class="i-mdi:download" aria-hidden="true"></span>
								Download
							</button>
						{/snippet}
					</ChatResponse>

				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'toasts'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live{#if activeVariant} · variant: {activeVariant.label.toLowerCase()}{/if}</div>
					<div class="canvas-title">Toasts · imperative notifications</div>
					<div class="canvas-sub">
						AlertList renders any pushed alert at the configured position. Four
						tones — success, warning, error, info. Click a button to fire one.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;AlertList/&gt;"
						meta={`· @rokkit/ui · style=${vibe.style}${activeVariant ? ` · variant=${activeVariant.id}` : ''}`}
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:bell-outline" aria-hidden="true"></span>
						{/snippet}
						<div class="toasts-mount">
							<!-- AlertList lives at the shell root so feedback shows from any demo -->
							<div class="toast-buttons">
								<Button variant="primary" onclick={() => showToast('success')}>
									Show success
								</Button>
								<Button variant="default" onclick={() => showToast('warning')}>
									Show warning
								</Button>
								<Button variant="danger" onclick={() => showToast('error')}>
									Show error
								</Button>
								<Button variant="secondary" onclick={() => showToast('info')}>
									Show info
								</Button>
							</div>
						</div>
						{#snippet props()}
							<span>position</span><span data-value>{alertListPosition}</span>
							<span data-sep>·</span>
							<span>tones</span><span data-value>[4]</span>
							<span data-sep>·</span>
							<span>timeout</span><span data-value>{activeVariant?.id === 'auto-dismiss' ? '3s' : 'persist'}</span>
							{#if activeVariant}
								<span data-sep>·</span>
								<span>variant</span><span data-value>{activeVariant.id}</span>
							{/if}
						{/snippet}
						{#snippet actions()}
							<button type="button" onclick={() => alerts.clear()}>
								<span class="i-mdi:close-circle-outline" aria-hidden="true"></span>
								Clear all
							</button>
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
						{/snippet}
					</ChatResponse>

				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'list'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live{#if activeVariant} · variant: {activeVariant.label.toLowerCase()}{/if}</div>
					<div class="canvas-title">List · collapsible groups</div>
					<div class="canvas-sub">
						Settings menu shape — three groups, each with its own items via
						<code>children</code>. Click a group header to collapse. Same
						component renders flat lists when you drop <code>children</code>.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;List/&gt;"
						meta={`· @rokkit/ui · style=${vibe.style}${activeVariant ? ` · variant=${activeVariant.id}` : ''}`}
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:format-list-bulleted" aria-hidden="true"></span>
						{/snippet}
						{#snippet listItemSnippet(proxy: { label: string; get: (k: string) => string | undefined })}
							<span class={proxy.get('icon')} aria-hidden="true" style="margin-right:6px;color:var(--accent)"></span>
							<span style="flex:1">{proxy.label}</span>
							<span style="font:500 10px var(--font-ui);color:var(--accent);background:color-mix(in oklab,var(--accent) 12%,var(--paper-soft));padding:2px 6px;border-radius:4px">CUSTOM</span>
						{/snippet}
						<div class="list-mount">
							<List
								items={listItems}
								collapsible={activeVariant?.id !== 'flat'}
								bind:value={listValue}
								itemContent={activeVariant?.id === 'snippets' ? listItemSnippet : undefined}
								{...variantProps}
							/>
						</div>
						{#snippet props()}
							<span>shape</span><span data-value>{activeVariant?.id === 'flat' ? 'flat' : 'grouped [3]'}</span>
							<span data-sep>·</span>
							<span>collapsible</span><span data-value>{activeVariant?.id === 'flat' ? 'no' : 'yes'}</span>
							<span data-sep>·</span>
							<span>selected</span><span data-value>{String((listValue as { label?: string } | null)?.label ?? '—')}</span>
							{#if activeVariant}
								<span data-sep>·</span>
								<span>variant</span><span data-value>{activeVariant.id}</span>
							{/if}
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
							<button type="button">
								<span class="i-mdi:download" aria-hidden="true"></span>
								Download
							</button>
						{/snippet}
					</ChatResponse>

				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'multi-select'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live{#if activeVariant} · variant: {activeVariant.label.toLowerCase()}{/if}</div>
					<div class="canvas-title">MultiSelect · chips for picked values</div>
					<div class="canvas-sub">
						Eight colors; two start picked. Selected values render as chips
						inside the trigger. Click a chip to remove. Field-mapped via
						<code>{'{ label, value }'}</code>; <code>bind:value</code> gives an array.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;MultiSelect/&gt;"
						meta={`· @rokkit/ui · style=${vibe.style}${activeVariant ? ` · variant=${activeVariant.id}` : ''}`}
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:select-multiple" aria-hidden="true"></span>
						{/snippet}
						<div class="multiselect-mount" data-variant={activeVariant?.id ?? undefined}>
							{#if activeVariant?.id === 'with-counts'}
								<div class="ms-count-row">
									<MultiSelect items={colorItems} bind:value={selectedColors} placeholder="Select colors" {...variantProps} {...tweakProps} />
									<span class="ms-count">{selectedColors.length} of {colorItems.length} picked</span>
								</div>
							{:else}
								<MultiSelect items={colorItems} bind:value={selectedColors} placeholder="Select colors" {...variantProps} {...tweakProps} />
							{/if}
						</div>
						{#snippet props()}
							<span>options</span><span data-value>[8]</span>
							<span data-sep>·</span>
							<span>selected</span><span data-value>[{selectedColors.length}]</span>
							<span data-sep>·</span>
							<span>value</span><span data-value>{selectedColors.join(', ') || '—'}</span>
							{#if activeVariant}
								<span data-sep>·</span>
								<span>variant</span><span data-value>{activeVariant.id}</span>
							{/if}
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
							<button type="button">
								<span class="i-mdi:download" aria-hidden="true"></span>
								Download
							</button>
						{/snippet}
					</ChatResponse>

				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'tree'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live{#if activeVariant} · variant: {activeVariant.label.toLowerCase()}{/if}</div>
					<div class="canvas-title">Tree · hierarchical, navigable</div>
					<div class="canvas-sub">
						Nested folders + files. Click to expand; arrow keys walk the tree;
						Enter selects. Field-mapped via <code>fields={'{'} label, value }</code>.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;Tree/&gt;"
						meta={`· @rokkit/ui · style=${vibe.style}${activeVariant ? ` · variant=${activeVariant.id}` : ''}`}
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:file-tree" aria-hidden="true"></span>
						{/snippet}
						<div class="tree-mount">
							<Tree items={treeItems} fields={treeFields} bind:value={treeValue} {...variantProps} {...tweakProps} />
						</div>
						{#snippet props()}
							<span>nodes</span><span data-value>nested</span>
							<span data-sep>·</span>
							<span>fields</span><span data-value>{'{ label, value }'}</span>
							<span data-sep>·</span>
							<span>selected</span><span data-value>{String(treeValue ?? '—')}</span>
							{#if activeVariant}
								<span data-sep>·</span>
								<span>variant</span><span data-value>{activeVariant.id}</span>
							{/if}
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
							<button type="button">
								<span class="i-mdi:download" aria-hidden="true"></span>
								Download
							</button>
						{/snippet}
					</ChatResponse>

				</div>
			{:else if shell.phase === 'response' && isDynamicDemo && currentMeta}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live</div>
					<div class="canvas-title">{currentMeta.title}</div>
					<div class="canvas-sub">{currentMeta.description}</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name={`<${currentMeta.title.replace(/\s+/g, '')}/>`}
						meta={`· @rokkit/ui · style=${vibe.style}`}
						kicker="LIVE"
					>
						{#if dynamicDemoPromise}
							{#await dynamicDemoPromise}
								<div class="dyn-loading"><span class="koan-spinner" aria-hidden="true"></span></div>
							{:then mod}
								{@const C = mod.default as Component}
								<div class="dyn-mount">
									<C {...tweakProps} />
								</div>
							{:catch err}
								<div class="dyn-error">Failed to load demo: {err.message}</div>
							{/await}
						{/if}
					</ChatResponse>
				</div>
			{/if}
		</main>
	</div>

	{#if children}{@render children()}{/if}

	<!-- Shell-level AlertList so feedback from any demo (wizard save, etc.) shows -->
	<AlertList position={alertListPosition} />
</div>

<style>
	.koan-shell {
		/* Lives inside the root layout's <main>; flex column so the stage
		 * (sidebar + content + composer) stretches to fill what's left after
		 * the SiteHeader + SiteFooter take their share. */
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		background: var(--paper);
		color: var(--ink);
		font-family: var(--font-ui);
		overflow: hidden;
	}

	.stage {
		flex: 1;
		display: flex;
		min-height: 0;
	}

	.group-label {
		padding: 14px 8px 4px;
		font: 500 10px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.conv {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		margin: 1px 0;
		width: 100%;
		border: 0;
		background: transparent;
		border-radius: 6px;
		color: var(--ink-mute);
		cursor: pointer;
		text-align: left;
		font-family: var(--font-ui);
		position: relative;
	}

	.conv:hover {
		background: var(--paper-soft);
		color: var(--ink);
	}

	.conv-active,
	.conv-active:hover {
		background: var(--paper-mute);
		color: var(--ink);
	}

	.conv-empty {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 14px 10px;
		color: var(--ink-soft);
		font: 400 12px var(--font-ui);
		line-height: 1.4;
	}

	.conv-empty .i-mdi\:chat-plus-outline {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		color: var(--ink-mute);
	}

	.conv-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		color: var(--ink-soft);
		display: inline-block;
	}

	.conv-title {
		flex: 1;
		min-width: 0;
		font: 450 12.5px var(--font-ui);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.conv-when {
		font: 500 10px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.02em;
		flex-shrink: 0;
	}

	.conv-mini {
		width: 32px;
		height: 32px;
		display: grid;
		place-items: center;
		margin: 0 auto;
		border: 0;
		background: transparent;
		border-radius: 6px;
		color: var(--ink-soft);
		cursor: pointer;
	}

	.conv-mini:hover {
		background: var(--paper-soft);
		color: var(--ink);
	}

	.conv-mini-active,
	.conv-mini-active:hover {
		background: var(--paper-mute);
		color: var(--ink);
	}

	.chat-left {
		width: 400px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--paper-edge);
		background: var(--paper);
		min-width: 0;
		min-height: 0;
		/* Pin to the stage so the inner ChatStream can scroll inside
		   while header / slab / composer stay anchored. */
		overflow: hidden;
	}

	.chat-header {
		padding: 12px 16px;
		border-bottom: 1px solid var(--paper-edge);
		flex-shrink: 0;
	}

	.tweaks-slab {
		flex-shrink: 0;
		padding: 10px 14px 0;
	}

	.tweaks-slab[data-glide-in] {
		animation: tweaks-glide-in 220ms ease-out;
	}

	@keyframes tweaks-glide-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.composer-tweak-toggle {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 3px 8px;
		border: 1px solid var(--paper-edge);
		border-radius: 4px;
		background: var(--paper-soft);
		color: var(--ink-mute);
		font: 500 11px var(--font-mono);
		letter-spacing: 0.04em;
		cursor: pointer;
	}

	.composer-tweak-toggle:hover {
		border-color: var(--ink-soft);
		color: var(--ink);
	}

	.composer-tweak-toggle[data-on] {
		background: color-mix(in oklab, var(--accent) 10%, var(--paper));
		border-color: color-mix(in oklab, var(--accent) 40%, var(--paper-edge));
		color: var(--accent);
	}

	.composer-tweak-toggle .i-mdi\:tune-variant {
		width: 12px;
		height: 12px;
	}

	.composer-tweak-label {
		font-size: 11px;
	}

	.chat-title {
		font: 500 14px var(--font-display);
		color: var(--ink);
		letter-spacing: -0.01em;
		display: flex;
		align-items: baseline;
		gap: 6px;
	}

	.chat-sub {
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.02em;
		max-width: 280px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.welcome-stream {
		flex: 1;
		overflow-y: auto;
		padding: 18px 16px;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.welcome-hello {
		font: 400 22px/1.3 var(--font-display);
		color: var(--ink);
		letter-spacing: -0.015em;
		margin: 0;
	}

	.welcome-lede {
		font: 400 14px/1.6 var(--font-ui);
		color: var(--ink-mute);
		margin: 0;
	}

	.welcome-lede kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		margin: 0 1px;
		font: 500 11px/1 var(--font-mono);
		color: var(--ink-mute);
		background: var(--paper-mute);
		border: 1px solid var(--paper-edge);
		border-radius: 3px;
		vertical-align: 1px;
	}

	.welcome-browse {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-top: auto;
		padding: 6px 10px;
		font: 500 12px var(--font-ui);
		color: var(--ink-mute);
		background: transparent;
		border: 0;
		border-radius: var(--density-radius-base);
		text-decoration: none;
		align-self: flex-start;
		transition:
			color 120ms ease,
			background 120ms ease;
	}

	.welcome-browse:hover {
		color: var(--ink);
		background: var(--paper-mute);
	}

	.welcome-browse [class*='i-mdi'] {
		width: 14px;
		height: 14px;
	}

	.canvas {
		flex: 1;
		min-width: 0;
		min-height: 0;
		background: var(--paper);
		display: flex;
		flex-direction: column;
		position: relative;
		/* No scroll here — .canvas-body owns its scroll so the head
		   stays pinned at the top while only the body content moves. */
		overflow: hidden;
	}

	.canvas-head {
		padding: 24px 28px 18px;
		border-bottom: 1px solid var(--paper-edge);
		flex-shrink: 0;
	}

	.canvas-head.preparing {
		opacity: 0.55;
	}

	.canvas-eyebrow {
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		margin-bottom: 6px;
	}

	.canvas-title {
		font: 400 22px var(--font-display);
		color: var(--ink);
		letter-spacing: -0.015em;
	}

	.canvas-sub {
		margin-top: 6px;
		font: 400 13.5px/1.55 var(--font-ui);
		color: var(--ink-mute);
		max-width: 640px;
	}

	.canvas-body {
		flex: 1;
		min-height: 0;
	}

	.canvas-body.thinking {
		display: grid;
		place-items: center;
		gap: 14px;
		padding: 56px;
		grid-auto-flow: column;
		grid-auto-columns: min-content;
	}

	.canvas-body.response {
		overflow-y: auto;
		padding: 22px 28px 32px;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	/* Other direct children (variant chips, footnotes) stay
	   intrinsic-sized; the ChatResponse wrapping the live demo grows
	   to fill the remaining canvas. */
	:global(.canvas-body.response > *) {
		flex-shrink: 0;
	}

	:global(.canvas-body.response > [data-chat-response]) {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}

	/* Inside ChatResponse the mount wrapper takes the remaining height
	   so the live component itself fills the canvas instead of sitting
	   in a fixed min-height box with empty space underneath. */
	:global(.canvas-body.response [data-chat-response-body]) {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}

	:global(.canvas-body.response [data-chat-response-body] > *) {
		flex: 1;
		min-height: 0;
	}

	.canvas-body.catalog,
	.canvas-body.api,
	.canvas-body.code,
	.canvas-body.docs {
		overflow-y: auto;
		padding: 16px 28px 32px;
	}

	[data-demo-docs] {
		max-width: 720px;
		font: 400 14.5px/1.65 var(--font-ui);
		color: var(--ink);
	}

	[data-demo-docs] :global(h2) {
		margin: 28px 0 10px;
		font: 500 18px var(--font-display);
		color: var(--ink);
		letter-spacing: -0.01em;
	}

	[data-demo-docs] :global(h2:first-child) {
		margin-top: 0;
	}

	[data-demo-docs] :global(h3) {
		margin: 22px 0 8px;
		font: 500 15px var(--font-display);
		color: var(--ink);
	}

	[data-demo-docs] :global(p) {
		margin: 0 0 14px;
		color: var(--ink-mute);
	}

	/* Restore default list markers — UnoCSS / preflight strips them
	   for the page baseline. Docs prose is one of the few places
	   bullets/numerals are still expected, so set them explicitly. */
	[data-demo-docs] :global(ul),
	[data-demo-docs] :global(ol) {
		margin: 0 0 14px;
		padding-left: 22px;
		color: var(--ink-mute);
	}

	[data-demo-docs] :global(ul) {
		list-style: disc outside;
	}

	[data-demo-docs] :global(ol) {
		list-style: decimal outside;
	}

	[data-demo-docs] :global(ul ul) {
		list-style: circle outside;
	}

	[data-demo-docs] :global(li) {
		margin: 4px 0;
	}

	[data-demo-docs] :global(li::marker) {
		color: var(--ink-soft);
	}

	[data-demo-docs] :global(code) {
		font: 400 13px var(--font-mono, ui-monospace, monospace);
		background: var(--paper-soft);
		padding: 1px 5px;
		border-radius: 3px;
		color: var(--ink);
	}

	[data-demo-docs] :global(strong) {
		color: var(--ink);
		font-weight: 600;
	}

	.canvas-body.code {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	/* Surfaces the count of props the user has tweaked away from default
	   on the active demo. Only renders when there's something to show, so
	   the canvas reads as clean when running default props. Reset reuses
	   the slab's reset path — clears in-memory + drops persisted
	   TweakTurn rows. */
	.canvas-tweaks-strip {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 20px;
		border-bottom: 1px solid var(--paper-edge);
		background: var(--paper-soft);
		font: 500 11px var(--font-mono);
		color: var(--ink-mute);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		flex-shrink: 0;
	}

	.canvas-tweaks-strip .i-mdi\:tune-variant {
		width: 13px;
		height: 13px;
		color: var(--ink-soft);
	}

	.canvas-tweaks-count {
		color: var(--ink);
	}

	.canvas-tweaks-spacer {
		flex: 1;
	}

	.canvas-tweaks-reset {
		padding: 2px 8px;
		border: 1px solid var(--paper-edge);
		border-radius: 4px;
		background: var(--paper);
		color: var(--ink-mute);
		font: 500 11px var(--font-ui);
		letter-spacing: 0;
		text-transform: none;
		cursor: pointer;
	}

	.canvas-tweaks-reset:hover {
		border-color: var(--ink-soft);
		color: var(--ink);
	}

	/* Just an anchor for positioning — Toggle owns its own visuals via
	   the active theme's toggle.css. */
	.canvas-view-toggle {
		position: absolute;
		top: 14px;
		right: 20px;
		z-index: 5;
	}

	.tabs-mount {
		min-height: 180px;
	}

	.dyn-mount {
		display: flex;
		flex-direction: column;
		gap: 14px;
		min-height: 180px;
	}

	.dyn-loading,
	.dyn-error {
		display: grid;
		place-items: center;
		padding: 32px;
		color: var(--ink-mute);
		font: 400 13px var(--font-ui);
		min-height: 120px;
	}

	.dyn-error {
		color: var(--error, var(--ink));
	}

	.tabs-mount :global([data-tabs-panel]:not([data-panel-active])) {
		display: none;
	}

	.tabs-mount :global([data-tabs-content]) {
		padding: 14px 4px 4px;
		color: var(--ink-soft);
		font: 400 13.5px/1.55 var(--font-ui);
	}

	.table-mount {
		min-height: 120px;
	}

	.table-mount[data-variant='sticky-header'] {
		max-height: 340px;
		overflow: auto;
		border-radius: 6px;
		border: 1px solid var(--paper-edge);
	}

	.table-mount[data-variant='sticky-header'] :global([data-table-header-row]) {
		position: sticky;
		top: 0;
		z-index: 1;
		background: var(--paper);
	}

	.tree-mount {
		min-height: 120px;
	}

	.multiselect-mount {
		min-height: 80px;
		max-width: 340px;
	}

	.multiselect-mount[data-variant='no-overflow'] :global([data-multiselect-chips]) {
		flex-wrap: wrap;
		max-height: none;
		overflow: visible;
	}

	.ms-count-row {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.ms-count {
		font: 500 11.5px var(--font-ui);
		color: var(--accent);
	}

	.list-mount {
		min-height: 120px;
		max-width: 340px;
	}

	.toasts-mount {
		min-height: 80px;
	}

	.form-mount {
		min-height: 120px;
		max-width: 440px;
	}

	.select-mount {
		min-height: 80px;
		max-width: 340px;
	}

	.chart-mount {
		min-height: 280px;
		max-width: 640px;
	}

	.combo-mount {
		min-height: 80px;
		max-width: 340px;
	}

	.combo-count {
		margin: 8px 0 0;
		font: 400 12px var(--font-ui);
		color: var(--ink-soft);
	}

	.date-mount {
		min-height: 120px;
		max-width: 440px;
	}

	.wizard-mount[data-variant='dark-only'] :global(.role-row > .picker:first-of-type) {
		display: none;
	}

	.wizard-mount[data-variant='dark-only'] :global(.role-header) {
		grid-template-columns: 1fr 1fr;
	}

	.tokens-preview {
		margin-top: 18px;
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		background: var(--paper-soft);
		overflow: hidden;
	}

	.tokens-preview-head {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		border-bottom: 1px solid var(--paper-edge);
		font: 500 12.5px var(--font-ui);
		color: var(--ink);
	}

	.tokens-hint {
		margin-left: auto;
		color: var(--ink-mute);
		font-weight: 400;
		font-size: 11.5px;
	}

	.tokens-pre {
		margin: 0;
		padding: 12px 14px;
		max-height: 260px;
		overflow: auto;
		font: 12px/1.55 var(--font-mono, ui-monospace, monospace);
		color: var(--ink-soft);
		white-space: pre;
	}

	.stepper-mount {
		min-height: 120px;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.stepper-mount[data-orientation='vertical'] {
		flex-direction: row;
		align-items: flex-start;
	}

	.stepper-mount :global(.step-blurb) {
		margin: 6px 0 0;
		color: var(--ink-soft);
		font: 400 13px/1.5 var(--font-ui);
	}

	.toast-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}

	:global([data-chat-message] .mounted-callout) {
		margin-top: 8px;
		padding: 8px 10px;
		background: var(--accent-soft);
		border-radius: 6px;
		border: 1px dashed color-mix(in oklab, var(--accent) 30%, transparent);
		font: inherit;
		font-size: 12.5px;
		color: var(--ink);
		text-align: left;
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		cursor: pointer;
		transition:
			background 120ms,
			border-color 120ms;
	}

	:global([data-chat-message] .mounted-callout:not(:disabled):hover) {
		background: color-mix(in oklab, var(--accent) 10%, var(--paper-soft));
		border-style: solid;
	}

	:global([data-chat-message] .mounted-callout:disabled) {
		cursor: default;
		opacity: 0.92;
	}

	:global([data-chat-message] .glossary) {
		margin: 4px 0 0;
		padding-left: 18px;
		font-size: 13px;
		line-height: 1.7;
		color: var(--ink-mute);
	}

	:global([data-chat-message] .glossary li) {
		margin-bottom: 2px;
	}

	:global([data-chat-message] .glossary strong) {
		color: var(--ink);
		font-weight: 500;
	}

	:global([data-chat-message] .mounted-callout .callout-label) {
		font: 500 10.5px var(--font-mono);
		color: var(--accent);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.koan-spinner {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-soft);
		border-top-color: transparent;
		animation: koan-canvas-spin 0.8s linear infinite;
		flex-shrink: 0;
	}

	@keyframes koan-canvas-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.thinking-step {
		font: 500 12px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.canvas:has(.welcome-hero) {
		display: grid;
		place-items: center;
	}

	.welcome-hero {
		max-width: 640px;
		padding: 64px 32px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 16px;
	}

	.welcome-hero .mark {
		margin-bottom: 8px;
		display: flex;
		justify-content: center;
	}

	.welcome-hero .lede {
		font: 400 28px/1.25 var(--font-display);
		color: var(--ink);
		letter-spacing: -0.01em;
	}

	.welcome-hero .sub {
		font: 400 15px/1.6 var(--font-ui);
		color: var(--ink-mute);
		max-width: 480px;
	}

	.welcome-hero .meta {
		margin-top: 24px;
		display: flex;
		gap: 16px;
		align-items: center;
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.welcome-hero .meta-value {
		color: var(--ink-mute);
		text-transform: none;
		letter-spacing: 0.04em;
		font-size: 12px;
	}

	.welcome-hero .meta-sep {
		color: var(--ink-faint);
	}
</style>
