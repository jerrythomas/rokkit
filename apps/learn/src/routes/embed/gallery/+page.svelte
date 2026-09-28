<script lang="ts">
	/**
	 * Isolated component gallery for the theme-contrast regression audit.
	 *
	 * Renders one representative instance of each component on a plain bg-paper
	 * surface — NO app shell — themeable via URL params:
	 *   ?style=<rokkit|minimal|material|frosted|zen-sumi>
	 *   ?skin=<default|ocean|violet|rose|emerald>
	 *   ?mode=<light|dark|system>
	 *
	 * The audit (e2e/theme-contrast.e2e.ts) loads this page per style×mode×skin
	 * and measures WCAG contrast of every component part against its real
	 * background. Each component is wrapped in `[data-gallery-comp]` so findings
	 * can be grouped by component. Keep instances small but text-bearing.
	 */
	import { onMount } from 'svelte'
	import { page } from '$app/state'
	import { vibe, commands } from '@rokkit/states'
	import {
		Button, Badge, Pill, Card, List, Tree, Table, Tabs, Select, MultiSelect,
		Menu, Dropdown, Toggle, Switch, ProgressBar, Range, Rating, Timeline,
		Stepper, BreadCrumbs, Toolbar, StatusList, Message, Tooltip, Avatar,
		Divider, Swatch, Code, Carousel, ChatHistory, FloatingNavigation,
		CommandPalette
	} from '@rokkit/ui'
	import { BarChart, PieChart, LineChart, ScatterPlot, BoxPlot } from '@rokkit/chart'
	import { Graph, GraphState } from '@rokkit/graph'
	import { EntityView } from '@rokkit/graph/schema'
	import { datasets } from '$lib/koan/demos/graph/datasets'

	const style = $derived(page.url.searchParams.get('style') ?? 'zen-sumi')
	const skin = $derived(page.url.searchParams.get('skin') ?? 'default')
	const modeParam = $derived(page.url.searchParams.get('mode') ?? 'light')
	const mode = $derived(
		modeParam === 'system' || modeParam === 'auto'
			? typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light'
			: modeParam
	)

	/* density 'full' so node titles, row names, row types AND badges are all present and
	   measurable — at the default 'keys' most rows are hidden and the sweep would pass by
	   simply having less text on the page. A selection is made so the selected/related/dim
	   node states and the highlight/dim edge states are measured too. */
	const graphState = new GraphState({
		nodes: datasets.ecommerce.nodes,
		edges: datasets.ecommerce.edges,
		fields: datasets.ecommerce.fields,
		density: 'full'
	})
	graphState.select('public.orders')

	/* The call graph is the OTHER thing this component draws, and it renders through a
	   different layout with a different node shape — so the sweep has to measure it
	   separately or half the component's surface goes unchecked. */
	const callGraphState = new GraphState({
		nodes: datasets['service-calls'].nodes,
		edges: datasets['service-calls'].edges,
		fields: datasets['service-calls'].fields,
		layout: 'points'
	})

	// The cluster FILL resolves from the light or dark ladder per this mode, while its label
	// inherits the page's ink. Leave mode at its 'light' default here and dark mode paints
	// near-white labels on pale fills — 1.1:1. Same bug the /app demo had; it has to be wired
	// on every surface that renders a Graph, because nothing infers it.
	$effect(() => {
		graphState.update({
			nodes: datasets.ecommerce.nodes,
			edges: datasets.ecommerce.edges,
			fields: datasets.ecommerce.fields,
			density: 'full',
			mode: mode === 'dark' ? 'dark' : 'light',
			value: graphState.value
		})
		callGraphState.update({
			nodes: datasets['service-calls'].nodes,
			edges: datasets['service-calls'].edges,
			fields: datasets['service-calls'].fields,
			layout: 'points',
			mode: mode === 'dark' ? 'dark' : 'light',
			value: callGraphState.value
		})
	})

	// CRITICAL for the contrast audit: this embed page renders inside the app's
	// <body>, which the root layout's `themable` action pins to `vibe`. A
	// wrapper-only data-style would collide with that outer body scope — both
	// `[data-style='X'] [part]` and `[data-style='<vibe>'] [part]` match the
	// same element at equal specificity, so the later-emitted style wins and the
	// audit measures a style MIX, not the requested one. Drive `vibe` itself so
	// `themable` sets <body> to the SAME style/skin/mode → one consistent scope.
	$effect(() => {
		vibe.style = style
		vibe.mode = mode
		vibe.skin = skin
	})

	// representative data + bindable state
	//
	// Leaves carry explicit `value`s and the List is SEEDED. A `collapsible` List
	// mounted with no value arrives as closed group headers with no items
	// rendered, so every item-level interaction rule — hover, focus, active,
	// selected — was unreachable and the audit silently said nothing about them.
	const listItems = [
		{
			label: 'General',
			children: [
				{ label: 'Profile', value: 'profile' },
				{ label: 'Account', value: 'account' }
			]
		},
		{ label: 'Appearance', children: [{ label: 'Theme', value: 'theme' }] }
	]
	let listValue = $state('profile')
	const treeItems = [{ name: 'src', id: 'src', children: [{ name: 'Button.svelte', id: 'btn' }] }]
	let treeValue = $state(null)
	const tableData = [
		{ name: 'Laptop', price: 1299, stock: 45 },
		{ name: 'Phone', price: 899, stock: 120 }
	]
	// Icons on Tabs and Toggle are load-bearing for the audit, not decoration:
	// icon rules are keyed on [data-tabs-icon] / [data-toggle-icon], and an icon
	// carries no text, so without them the icon pass has nothing to measure. The
	// invisible selected-tab icon (paper-soft on a paper-mute hover fill) was
	// only findable once these existed.
	const tabItems = [
		{ label: 'Overview', value: 'overview', icon: 'i-glyph:home', content: 'Your starting point.' },
		{ label: 'Settings', value: 'settings', icon: 'i-glyph:gear', content: 'Tune preferences.' }
	]
	let tabValue = $state('overview')
	const selectItems = [
		{ label: 'Option 01', value: 'opt-1' },
		{ label: 'Option 02', value: 'opt-2' }
	]
	let selectValue = $state('opt-1')
	let multiValue = $state(['red'])
	const colorItems = [
		{ label: 'Red', value: 'red' },
		{ label: 'Blue', value: 'blue' }
	]
	const menuItems = [
		{ label: 'Copy', value: 'copy' },
		{ label: 'Paste', value: 'paste' }
	]
	let dropdownValue = $state('system')
	const fontItems = [
		{ label: 'System UI', value: 'system' },
		{ label: 'Serif', value: 'serif' }
	]
	let toggleValue = $state('grid')
	const toggleOptions = [
		{ label: 'List', value: 'list', icon: 'i-glyph:list' },
		{ label: 'Grid', value: 'grid', icon: 'i-glyph:grid' }
	]
	let switchValue = $state(true)
	let rangeValue = $state(35)
	let ratingValue = $state(3)
	const timelineItems = [
		{ label: 'Requirements', completed: true },
		{ label: 'Design', completed: true },
		{ label: 'Development', active: true }
	]
	const stepperSteps = [{ text: 'Account', completed: true }, { text: 'Profile' }]
	let stepperCurrent = $state(1)
	const crumbItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Products', href: '/products' },
		{ label: 'Laptops' }
	]
	const toolbarItems = [
		{ label: 'Bold', icon: 'i-glyph:text-bold' },
		{ label: 'Italic', icon: 'i-glyph:text-italic' },
		{ itemType: 'separator' },
		{ label: 'Save', icon: 'i-glyph:diskette' }
	]
	const statusItems = [
		{ text: 'At least 8 characters', status: 'pass' },
		{ text: 'Contains uppercase', status: 'fail' },
		{ text: 'Contains number', status: 'warn' }
	]
	const swatchColors = ['#0ea5e9', '#f97316', '#10b981']
	let swatchValue = $state(null)
	const codeSample = "function greet(name) {\n  return `Hello, ${name}!`\n}"

	// Components whose interaction rules had no instance to attach to. Each was
	// listed as "declared but unreachable" in the coverage report, meaning the
	// theme styled a hover/focus state that nothing in the audit could produce.
	let carouselCurrent = $state(0)
	const conversations = [
		{ id: 'c1', title: 'Theme tokens', updatedAt: new Date(2026, 7, 30).toISOString() },
		{ id: 'c2', title: 'Contrast audit', updatedAt: new Date(2026, 7, 29).toISOString() }
	]
	const floatingNavItems = [
		{ label: 'Overview', value: 'overview', icon: 'i-glyph:home' },
		{ label: 'Tokens', value: 'tokens', icon: 'i-glyph:palette' }
	]
	let floatingNavValue = $state('overview')

	// The palette renders [data-command-empty] until commands exist, so its item
	// rules — hover, focus, selected — had nothing to attach to.
	//
	// onMount, NOT $effect: the registry is reactive state, so an effect that
	// registers into it also depends on it and re-runs forever
	// (effect_update_depth_exceeded). onMount runs once and treats the returned
	// disposer as its cleanup, which keeps the singleton registry tidy.
	// These RUN. An earlier version registered `run: () => {}` with labels reading "Open file"
	// and "Save changes", which looked like a working palette and did nothing — worse than
	// either honest option, because a reader cannot tell a fixture from a broken control.
	// Now the label says it is a sample and activating one reports back, so the palette is
	// demonstrably alive without the gallery pretending to own files.
	let lastCommand = $state<string | null>(null)

	onMount(() =>
		commands.registerMany([
			{
				id: 'gallery.sample-one',
				label: 'Sample command one',
				shortcut: 'mod+1',
				group: 'Gallery sample',
				run: () => (lastCommand = 'Sample command one')
			},
			{
				id: 'gallery.sample-two',
				label: 'Sample command two',
				shortcut: 'mod+2',
				group: 'Gallery sample',
				run: () => (lastCommand = 'Sample command two')
			}
		])
	)

	// Chart marks paint with SVG `fill`, not `color`/`background-color`, so the
	// collector measures them on a separate path at the 3:1 non-text threshold.
	const barData = [
		{ name: 'Jan', value: 42 },
		{ name: 'Feb', value: 65 },
		{ name: 'Mar', value: 28 }
	]
	const pieData = [
		{ label: 'Direct', value: 45 },
		{ label: 'Search', value: 35 },
		{ label: 'Social', value: 20 }
	]
	const lineData = [
		{ x: 1, y: 10, series: 'a' },
		{ x: 2, y: 24, series: 'a' },
		{ x: 3, y: 18, series: 'a' }
	]
	const scatterData = [
		{ x: 1, y: 4, group: 'a' },
		{ x: 2, y: 9, group: 'a' },
		{ x: 3, y: 6, group: 'b' }
	]
	// Enough points per group for real quartiles, plus a far value in each so the
	// box-outlier mark actually renders — an outlier-free box emits no outliers.
	const boxData = [
		...[4, 5, 6, 6, 7, 8, 9, 30].map((value) => ({ group: 'a', value })),
		...[3, 4, 4, 5, 6, 7, 8, 26].map((value) => ({ group: 'b', value }))
	]
</script>

<svelte:head><title>Gallery · {style} · {skin} · {mode}</title></svelte:head>

<div class="gallery" data-style={style} data-mode={mode} data-skin={skin}>
	<div data-gallery-comp="button" class="cell">
		<Button>Default</Button>
		<Button variant="primary">Primary</Button>
		<Button variant="secondary">Secondary</Button>
		<Button variant="danger">Danger</Button>
	</div>
	<div data-gallery-comp="badge" class="cell"><Badge count={3} /><Badge count={12} /></div>
	<div data-gallery-comp="pill" class="cell"><Pill value="svelte" /><Pill value="typescript" removable /></div>
	<div data-gallery-comp="card" class="cell">
		<Card><h3>Card title</h3><p>A basic card with text content.</p></Card>
	</div>
	<div data-gallery-comp="list" class="cell"><List items={listItems} collapsible bind:value={listValue} /></div>
	<div data-gallery-comp="tree" class="cell">
		<Tree items={treeItems} fields={{ label: 'name', value: 'id' }} bind:value={treeValue} />
	</div>
	<div data-gallery-comp="table" class="cell"><Table data={tableData} caption="Products" /></div>
	<div data-gallery-comp="tabs" class="cell"><Tabs options={tabItems} bind:value={tabValue} /></div>
	<!--
		`data-gallery-open` names the trigger the audit must click to expose this
		component's inner surface. Options, menu items and their hover/focus/
		selected rules live inside a panel that is closed on load, so without this
		the audit measured only the trigger. These components cannot all be opened
		at once — dismissal is a document-level listener, so opening one closes the
		last — hence the audit opens them one at a time.
	-->
	<div data-gallery-comp="select" class="cell" data-gallery-open="[data-select-trigger]"><Select items={selectItems} bind:value={selectValue} /></div>
	<div data-gallery-comp="multiselect" class="cell" data-gallery-open="[data-select-trigger]"><MultiSelect items={colorItems} bind:value={multiValue} /></div>
	<div data-gallery-comp="menu" class="cell" data-gallery-open="[data-menu-trigger]"><Menu items={menuItems} label="Actions" /></div>
	<div data-gallery-comp="dropdown" class="cell" data-gallery-open="[data-dropdown-trigger]"><Dropdown items={fontItems} bind:value={dropdownValue} /></div>
	<div data-gallery-comp="toggle" class="cell"><Toggle options={toggleOptions} bind:value={toggleValue} /></div>
	<div data-gallery-comp="switch" class="cell"><Switch bind:value={switchValue} /> <span>Notifications</span></div>
	<div data-gallery-comp="progress" class="cell"><ProgressBar value={50} /></div>
	<div data-gallery-comp="range" class="cell"><Range bind:value={rangeValue} min={0} max={100} /></div>
	<div data-gallery-comp="rating" class="cell"><Rating bind:value={ratingValue} max={5} /></div>
	<div data-gallery-comp="timeline" class="cell"><Timeline items={timelineItems} /></div>
	<div data-gallery-comp="stepper" class="cell"><Stepper steps={stepperSteps} bind:current={stepperCurrent} /></div>
	<div data-gallery-comp="breadcrumbs" class="cell"><BreadCrumbs items={crumbItems} /></div>
	<div data-gallery-comp="toolbar" class="cell"><Toolbar items={toolbarItems} /></div>
	<div data-gallery-comp="status-list" class="cell"><StatusList items={statusItems} /></div>
	<div data-gallery-comp="message" class="cell"><Message type="info" text="A regular informational nudge." dismissible /></div>
	<div data-gallery-comp="tooltip" class="cell"><Tooltip content="Saves your changes" position="top"><Button>Hover me</Button></Tooltip></div>
	<div data-gallery-comp="avatar" class="cell"><Avatar name="Ada Lovelace" size="md" /></div>
	<div data-gallery-comp="divider" class="cell"><Divider label="or" /></div>
	<div data-gallery-comp="swatch" class="cell"><Swatch options={swatchColors} bind:value={swatchValue} /></div>
	<div data-gallery-comp="code" class="cell"><Code code={codeSample} language="javascript" /></div>

	<!-- Previously absent from the gallery: their interaction rules were styled
	     by every theme but never measured. -->
	<div data-gallery-comp="carousel" class="cell">
		<Carousel count={3} bind:current={carouselCurrent}>
			{#snippet slide(index)}<div class="slide">Slide {index + 1}</div>{/snippet}
		</Carousel>
	</div>
	<div data-gallery-comp="chat-history" class="cell">
		<ChatHistory {conversations} activeId="c1" />
	</div>
	<div data-gallery-comp="floating-navigation" class="cell">
		<FloatingNavigation items={floatingNavItems} bind:value={floatingNavValue} />
	</div>
	<!-- Held open on purpose: the palette renders [data-command-empty] until commands exist,
	     so its item rules (hover, focus, selected) would have nothing for the contrast
	     collector to measure. -->
	<div data-gallery-comp="command-palette" class="cell">
		<CommandPalette open />
		<p data-gallery-note>
			{lastCommand ? `Ran: ${lastCommand}` : 'Sample commands — pick one to see it run.'}
		</p>
	</div>

	<!-- Chart marks paint via SVG `fill`; the collector measures them at the 3:1
	     non-text threshold. Candlestick and Waterfall are geom-only (no
	     high-level chart component) and stay listed as unreachable rather than
	     being quietly dropped. -->
	<div data-gallery-comp="chart-bar" class="cell">
		<BarChart data={barData} x="name" y="value" width={260} height={160} />
	</div>
	<div data-gallery-comp="chart-pie" class="cell">
		<PieChart data={pieData} label="label" y="value" width={260} height={160} />
	</div>
	<!-- `symbol` is what makes Line emit [data-plot-element="line-marker"]; a bare
	     line renders only the path. -->
	<div data-gallery-comp="chart-line" class="cell">
		<LineChart data={lineData} x="x" y="y" symbol="series" width={260} height={160} />
	</div>
	<div data-gallery-comp="chart-scatter" class="cell">
		<ScatterPlot data={scatterData} x="x" y="y" color="group" width={260} height={160} />
	</div>
	<div data-gallery-comp="chart-box" class="cell">
		<BoxPlot data={boxData} x="group" y="value" width={260} height={160} />
	</div>

	<!-- Graph at density full with a live selection, so titles, row names, row types, badges
	     and every node/edge state are all on the page and measurable. -->
	<div data-gallery-comp="graph" class="cell graph-cell">
		<Graph state={graphState} />
	</div>
	<div data-gallery-comp="graph-points" class="cell graph-cell">
		<Graph state={callGraphState} />
	</div>
	<div data-gallery-comp="graph-entity" class="cell">
		<EntityView state={graphState} />
	</div>
</div>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
	}
	[data-gallery-note] {
		margin: 8px 0 0;
		font-size: 0.75rem;
		color: var(--ink-mute);
	}

	/* Graph's viewport fills its nearest positioned ancestor, so its cell needs a size. */
	.graph-cell {
		position: relative;
		height: 320px;
	}
	.gallery {
		background: var(--paper);
		color: var(--ink);
		min-height: 100vh;
		padding: 24px;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 20px;
		align-items: start;
		font-family: var(--font-ui, sans-serif);
	}
	.cell {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
	}
	.slide {
		display: grid;
		place-items: center;
		min-height: 64px;
		width: 100%;
	}
	/* The CommandPalette is rendered permanently open so its item rules are
	 * measurable, but its backdrop is position:fixed inset:0 and would swallow
	 * every click in the fixture — including the dropdown triggers the audit has
	 * to open, and any click a human makes while inspecting this page.
	 *
	 * Safe to drop: contrast is composited from ANCESTOR backgrounds, and a fixed
	 * overlay is nobody's ancestor here, so no measured value changes. The
	 * palette's own parts still measure against the backdrop, which is correct. */
	:global([data-command-backdrop]) {
		pointer-events: none;
	}
</style>
