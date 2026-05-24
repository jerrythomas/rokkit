<script lang="ts">
	import type { Snippet } from 'svelte'
	import {
		ChatChrome,
		ChatComposer,
		ChatMessage,
		ChatResponse,
		ChatSidebar,
		ChatStream,
		Chips,
		CodeBlock
	} from '$lib/chat'
	import { Tabs, Table, Tree, MultiSelect, Select, List, Button, AlertList } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import { BarChart } from '@rokkit/chart'
	import { alerts } from '@rokkit/states'
	import RokkitWordmark from '$lib/components/RokkitWordmark.svelte'
	import { theme } from '$lib/stores/theme.svelte'
	import { vibe } from '@rokkit/states'
	import { koan } from '$lib/koan/store.svelte'
	import { runMatch } from '$lib/koan/match.svelte'
	import { shell } from '$lib/koan/shell.svelte'
	import ThemeWizardCard from '$lib/koan/demos/theme-wizard/ThemeWizardCard.svelte'
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'

	interface Props {
		children?: Snippet
	}
	const { children }: Props = $props()

	const styles = [
		{ id: 'zen-sumi', label: 'zen-sumi', colors: ['#F7F3EA', '#2A2925', '#A83D1F'] },
		{ id: 'rokkit', label: 'rokkit', colors: ['#FFFFFF', '#1F2937', '#EF4136'] },
		{ id: 'minimal', label: 'minimal', colors: ['#FAFAFA', '#0A0A0A', '#0A0A0A'] },
		{ id: 'material', label: 'material', colors: ['#FFFFFF', '#1F1F1F', '#6750A4'] }
	]

	let style = $state(theme.style)
	let density = $state(theme.density)
	const mode = $derived<'light' | 'dark'>(theme.mode === 'dark' ? 'dark' : 'light')

	$effect(() => {
		if (style !== theme.style) theme.setStyle(style)
	})
	$effect(() => {
		if (density !== theme.density) theme.setDensity(density)
	})
	$effect(() => {
		if (vibe.mode !== theme.mode) theme.setMode(vibe.mode)
	})

	let thinkingTimer: ReturnType<typeof setTimeout> | null = null

	type DemoKind = 'tabs' | 'theme-wizard' | 'table' | 'tree' | 'multi-select' | 'list' | 'toasts' | 'form' | 'select' | 'chart' | 'combo' | 'date-picker'
	const DEMO_ROUTE: Record<DemoKind, string> = {
		tabs: '/app/tabs',
		'theme-wizard': '/app/theming',
		table: '/app/table',
		tree: '/app/tree',
		'multi-select': '/app/multiselect',
		list: '/app/list',
		toasts: '/app/toasts',
		form: '/app/form',
		select: '/app/select',
		chart: '/app/chart',
		combo: '/app/combo',
		'date-picker': '/app/date'
	}

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
		return 'tabs'
	}

	function submitQuery(value: string) {
		const trimmed = value.trim()
		if (!trimmed) return
		koan.query = trimmed
		shell.lastQuery = trimmed
		shell.composerValue = ''
		shell.phase = 'thinking'
		shell.demoType = null

		const nextKind = pickDemoKind(trimmed)
		if (thinkingTimer) clearTimeout(thinkingTimer)
		thinkingTimer = setTimeout(() => {
			goto(DEMO_ROUTE[nextKind])
		}, 1500)
	}

	function tryChip(item: { label?: string }) {
		if (item.label?.startsWith('switch style')) {
			style = style === 'zen-sumi' ? 'rokkit' : 'zen-sumi'
		}
	}

	function startNewConversation() {
		if (thinkingTimer) {
			clearTimeout(thinkingTimer)
			thinkingTimer = null
		}
		shell.lastQuery = ''
		shell.composerValue = ''
		koan.query = ''
		goto('/app')
	}

	// Hardcoded conversation history (will wire to real store later)
	const today = [
		{ id: 'h1', icon: 'i-mdi:tab', title: 'Show me how Tabs work', ago: '12m' },
		{ id: 'h2', icon: 'i-mdi:palette', title: 'Theme for our brand red', ago: '47m' },
		{ id: 'h3', icon: 'i-mdi:help-circle-outline', title: 'How do I bind a list to async data?', ago: '2h' },
		{ id: 'h4', icon: 'i-mdi:select-multiple', title: 'Multi-select with chip overflow', ago: '3h' }
	]
	const yesterday = [
		{ id: 'h5', icon: 'i-mdi:file-tree', title: 'Compare List vs Tree', ago: 'yest' },
		{ id: 'h6', icon: 'i-mdi:help-circle-outline', title: 'A11y for tree navigation', ago: 'yest' },
		{ id: 'h7', icon: 'i-mdi:form-textbox', title: 'Form validation · per-field', ago: 'yest' }
	]
	const older = [
		{ id: 'h8', icon: 'i-mdi:book-open-variant', title: 'When to use Combo vs Select?', ago: 'Mon' },
		{ id: 'h9', icon: 'i-mdi:palette', title: 'Custom skin from brand palette', ago: 'Sun' }
	]
	const allConv = [...today, ...yesterday, ...older]

	const buildChips = [
		{ label: 'Tabs · 5 panes', icon: 'i-mdi:tab' },
		{ label: 'Sortable data table', icon: 'i-mdi:table' },
		{ label: 'Tree select', icon: 'i-mdi:file-tree' },
		{ label: 'Multi-select with chips', icon: 'i-mdi:select-multiple' },
		{ label: 'List with collapsible groups', icon: 'i-mdi:format-list-bulleted' },
		{ label: 'Toast notifications', icon: 'i-mdi:bell-outline' },
		{ label: 'Schema-driven form', icon: 'i-mdi:form-textbox' },
		{ label: 'Single-pick select', icon: 'i-mdi:menu-down' },
		{ label: 'Bar chart with quarterly revenue', icon: 'i-mdi:chart-bar' },
		{ label: 'Combobox with type-to-filter', icon: 'i-mdi:magnify' },
		{ label: 'Date and time picker', icon: 'i-mdi:calendar' }
	]
	const howChips = [
		{ label: 'How does theming work?', icon: 'i-mdi:help-circle-outline' },
		{ label: 'Bind a list to async data', icon: 'i-mdi:help-circle-outline' },
		{ label: 'A11y for keyboard nav', icon: 'i-mdi:help-circle-outline' }
	]
	const themeChips = [
		{ label: 'Theme to my brand', icon: 'i-mdi:palette' },
		{ label: 'Build a custom skin', icon: 'i-mdi:palette' }
	]

	const tryChips = [
		{ label: 'switch style → rokkit', icon: 'i-mdi:palette' },
		{ label: 'show the .css too', icon: 'i-mdi:code-tags' },
		{ label: 'wire it to a real list' }
	]

	const wizardChips = [
		{ label: '← previous step' },
		{ label: 'next step → typography' },
		{ label: 'export tokens.css', icon: 'i-mdi:download' }
	]

	function pickChip(item: { label?: string }) {
		if (item.label) submitQuery(item.label)
	}

	// Tabs demo state — mounted in the canvas response card
	const tabsItems = [
		{ label: 'Overview' },
		{ label: 'Theming' },
		{ label: 'Anatomy' },
		{ label: 'A11y' },
		{ label: 'API' }
	]
	let activeTab = $state<unknown>('Theming')

	const tabsCode = `<script>
  import { Tabs } from '@rokkit/ui'

  let items = $state([
    { label: 'Overview',  content: overviewSnippet },
    { label: 'Theming',   content: themingSnippet  },
    { label: 'Anatomy',   content: anatomySnippet  },
    { label: 'A11y',      content: a11ySnippet     },
    { label: 'API',       content: apiSnippet      },
  ])
  let value = $state(null)
<\/script>

<Tabs bind:items bind:value />`

	// Table demo state — sortable products table on the canvas
	const tableData = [
		{ name: 'Laptop', price: 1299, stock: 45 },
		{ name: 'Phone', price: 899, stock: 120 },
		{ name: 'Tablet', price: 599, stock: 78 },
		{ name: 'Monitor', price: 449, stock: 32 },
		{ name: 'Keyboard', price: 129, stock: 210 },
		{ name: 'Mouse', price: 59, stock: 340 }
	]

	const tableCode = `<script>
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

	// Tree demo state — file-tree shape with deep nesting
	const treeItems = [
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
	const treeFields = { label: 'name', value: 'id' }
	let treeValue = $state<unknown>(null)

	// Date Picker demo state — event scheduling form
	let dateData = $state({
		eventDate: '2026-06-15',
		startsAt: '2026-06-15T14:30'
	})
	const dateSchema = {
		type: 'object',
		properties: {
			eventDate: { type: 'string', format: 'date', required: true },
			startsAt: { type: 'string', format: 'date-time', required: true }
		}
	}

	const dateCode = `<script>
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
	const chartData = [
		{ quarter: 'Q1', revenue: 42 },
		{ quarter: 'Q2', revenue: 58 },
		{ quarter: 'Q3', revenue: 51 },
		{ quarter: 'Q4', revenue: 73 }
	]

	const chartCode = `<script>
  import { BarChart } from '@rokkit/chart'

  const sales = [
    { quarter: 'Q1', revenue: 42 },
    { quarter: 'Q2', revenue: 58 },
    { quarter: 'Q3', revenue: 51 },
    { quarter: 'Q4', revenue: 73 }
  ]
<\/script>

<BarChart data={sales} x="quarter" y="revenue" />`

	// Select demo state — 20-item flat list to exercise scroll + key nav
	const selectItems = Array.from({ length: 20 }, (_, i) => ({
		label: `Option ${String(i + 1).padStart(2, '0')}`,
		value: `opt-${i + 1}`
	}))
	let selectValue = $state<unknown>(null)

	const selectCode = `<script>
  import { Select } from '@rokkit/ui'

  const items = Array.from({ length: 20 }, (_, i) => ({
    label: \`Option \${String(i + 1).padStart(2, '0')}\`,
    value: \`opt-\${i + 1}\`
  }))
  let value = $state(null)
<\/script>

<Select {items} bind:value placeholder="Pick an option" />`

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
		alerts.push({ type: tone, text: toastMessages[tone] })
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
	const listItems = [
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
	let listValue = $state<unknown>(null)

	const listCode = `<script>
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
	<ChatChrome
		bind:style
		bind:density
		{styles}
	>
		{#snippet brand()}
			<RokkitWordmark height={20} />
		{/snippet}
	</ChatChrome>

	<div class="stage">
		<ChatSidebar bind:collapsed={shell.collapsed} onnew={startNewConversation}>
			<div class="group-label">Today</div>
			{#each today as item (item.id)}
				<button type="button" class="conv" data-conv-item>
					<span class="conv-icon {item.icon}" aria-hidden="true"></span>
					<span class="conv-title">{item.title}</span>
					<span class="conv-when">{item.ago}</span>
				</button>
			{/each}
			<div class="group-label">Yesterday</div>
			{#each yesterday as item (item.id)}
				<button type="button" class="conv" data-conv-item>
					<span class="conv-icon {item.icon}" aria-hidden="true"></span>
					<span class="conv-title">{item.title}</span>
					<span class="conv-when">{item.ago}</span>
				</button>
			{/each}
			<div class="group-label">Earlier this week</div>
			{#each older as item (item.id)}
				<button type="button" class="conv" data-conv-item>
					<span class="conv-icon {item.icon}" aria-hidden="true"></span>
					<span class="conv-title">{item.title}</span>
					<span class="conv-when">{item.ago}</span>
				</button>
			{/each}
			{#snippet collapsedBody()}
				{#each allConv.slice(0, 8) as item (item.id)}
					<div class="conv-mini" title={item.title}>
						<span class="conv-icon {item.icon}" aria-hidden="true"></span>
					</div>
				{/each}
			{/snippet}
			{#snippet footer()}
				<span>{allConv.length} conversations</span>
			{/snippet}
		</ChatSidebar>

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
						What are you building today? Three places people usually start —
					</p>

					<section>
						<div class="welcome-eyebrow">Build a component</div>
						<Chips items={buildChips} onselect={pickChip} />
					</section>

					<section>
						<div class="welcome-eyebrow">How-to</div>
						<Chips items={howChips} onselect={pickChip} />
					</section>

					<section>
						<div class="welcome-eyebrow">Theme &amp; customize</div>
						<Chips items={themeChips} onselect={pickChip} />
					</section>
				</div>
			{:else if shell.phase === 'thinking'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="UNDERSTOOD"
						who="Rokkit"
						icon="i-mdi:layers-outline"
					>
						Three things — locate the matching component in
						<code>@rokkit/ui</code>, mount it with sample data,
						and surface the Svelte source you'd copy.
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="LOCATED"
						icon="i-mdi:magnify"
					>
						Component reads <code>items</code> + binds
						<code>value</code>. Style cascades from
						<code>data-style</code> on the shell.
					</ChatMessage>
					<ChatMessage
						kind="think"
						head="MOUNTING"
					>
						wiring sample data and the style cascade…
					</ChatMessage>
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'tabs'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="2m"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="MOUNTED"
						who="Rokkit"
						ago="just now"
						icon="i-mdi:layers-outline"
					>
						<code>&lt;Tabs/&gt;</code> from <code>@rokkit/ui</code> on the canvas.
						Five panes from <code>items</code>. The style on screen is whatever
						<code>data-style</code> is set to — there is no <code>variant</code> prop.
						<div class="mounted-callout">
							<span class="callout-label">Canvas →</span>
							<span>Tabs · how the data-driven API works</span>
						</div>
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="EXPLAINED"
						icon="i-mdi:book-open-variant"
					>
						<strong>Items in, value out.</strong> The component owns selection,
						keyboard nav, focus, a11y. You hand it data, it hands you back
						which one is active.
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="TRY"
						icon="i-mdi:palette"
					>
						Flip the <em>style</em> at the top of the window — the same Tabs
						re-renders. Or copy the source on the right and paste it in.
					</ChatMessage>
					<Chips items={tryChips} onselect={tryChip} />
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'theme-wizard'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="STARTED"
						who="Rokkit"
						ago="just now"
						icon="i-mdi:palette"
					>
						Opened the theme wizard on the canvas. Step 02 — Skin — is active.
						Each role on the left can pick its palette and step. Mode-aware:
						light + dark share roles, swap palette steps.
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="GLOSSARY"
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
					<Chips items={wizardChips} onselect={tryChip} />
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'table'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="MOUNTED"
						who="Rokkit"
						ago="just now"
						icon="i-mdi:table"
					>
						<code>&lt;Table/&gt;</code> from <code>@rokkit/ui</code> on the canvas.
						Columns inferred from the rows. Click a header to sort; shift-click
						to sort by multiple columns.
						<div class="mounted-callout">
							<span class="callout-label">Canvas →</span>
							<span>Sortable Products table</span>
						</div>
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="EXPLAINED"
						icon="i-mdi:book-open-variant"
					>
						<strong>Data in, sortable grid out.</strong> No column config needed
						for the common case — Table reads the first row to derive columns,
						types, and alignment. Override with <code>columns</code> when you
						need formatters, fixed widths, or custom snippets.
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="TRY"
						icon="i-mdi:gesture-tap"
					>
						Sort by <em>price</em>, then shift-click <em>stock</em> to add a
						secondary sort. Or copy the source on the right.
					</ChatMessage>
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'date-picker'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="MOUNTED"
						who="Rokkit"
						ago="just now"
						icon="i-mdi:calendar"
					>
						<code>&lt;FormRenderer/&gt;</code> on the canvas with two fields —
						<em>eventDate</em> uses <code>format: 'date'</code> and
						<em>startsAt</em> uses <code>format: 'date-time'</code>. The
						format hint dispatches to <code>InputDate</code> and
						<code>InputDateTime</code> respectively — same string-type schema,
						different renderer.
						<div class="mounted-callout">
							<span class="callout-label">Canvas →</span>
							<span>Event date + start time</span>
						</div>
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="EXPLAINED"
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
						head="TRY"
						icon="i-mdi:gesture-tap"
					>
						Click a field to open the native browser calendar / time picker.
						Edit either one — the bound <code>data</code> updates live.
					</ChatMessage>
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'combo'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="MOUNTED"
						who="Rokkit"
						ago="just now"
						icon="i-mdi:magnify"
					>
						<code>&lt;Select filterable/&gt;</code> from <code>@rokkit/ui</code>
						on the canvas with a country list of 42 options. Same Select
						component as before — the <code>filterable</code> prop is the
						only difference. Type to narrow.
						<div class="mounted-callout">
							<span class="callout-label">Canvas →</span>
							<span>Countries · type-to-filter</span>
						</div>
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="WHEN TO USE"
						icon="i-mdi:compare-horizontal"
					>
						<strong>Combobox</strong> when the option count is too large for a
						casual scan — typing is faster than navigating. <strong>Plain
						Select</strong> for short fixed lists (under ~10 options) where
						the user just picks from what's visible.
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="TRY"
						icon="i-mdi:gesture-tap"
					>
						Open the dropdown. Start typing — e.g. "ne" narrows to Netherlands,
						New Zealand. Arrow keys walk the filtered set; Enter selects;
						Escape clears the filter without closing.
					</ChatMessage>
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'chart'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="MOUNTED"
						who="Rokkit"
						ago="just now"
						icon="i-mdi:chart-bar"
					>
						<code>&lt;BarChart/&gt;</code> from <code>@rokkit/chart</code> on the
						canvas. Four rows of quarterly revenue, mapped to <code>x</code>
						and <code>y</code> fields — the SVG is built from the data.
						Palette colors, gridlines, and hover tooltips come for free.
						<div class="mounted-callout">
							<span class="callout-label">Canvas →</span>
							<span>Quarterly revenue · Q1–Q4</span>
						</div>
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="EXPLAINED"
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
						head="TRY"
						icon="i-mdi:gesture-tap"
					>
						Hover a bar for the tooltip. Flip the chrome <em>style</em> to see
						the chart re-skin via palette tokens — same data, different look.
					</ChatMessage>
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'select'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="MOUNTED"
						who="Rokkit"
						ago="just now"
						icon="i-mdi:menu-down"
					>
						<code>&lt;Select/&gt;</code> from <code>@rokkit/ui</code> on the canvas
						— single-pick counterpart to MultiSelect. Twenty options stress-test
						the scroll + keyboard navigation; <code>maxRows</code> caps the
						visible window at 8 by default.
						<div class="mounted-callout">
							<span class="callout-label">Canvas →</span>
							<span>20 options · scroll for the rest</span>
						</div>
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="EXPLAINED"
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
						head="TRY"
						icon="i-mdi:gesture-tap"
					>
						Open the dropdown. Mouse-scroll to the bottom; arrow keys walk;
						Home / End jump; type a few characters for prefix-match navigation.
					</ChatMessage>
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'form'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="MOUNTED"
						who="Rokkit"
						ago="just now"
						icon="i-mdi:form-textbox"
					>
						<code>&lt;FormRenderer/&gt;</code> from <code>@rokkit/forms</code> on
						the canvas. JSON-Schema-ish object in; the right input per type
						(text / email / select / checkbox) is rendered, validated, and bound
						to the data object via <code>bind:data</code>.
						<div class="mounted-callout">
							<span class="callout-label">Canvas →</span>
							<span>Four fields · sign-up shape</span>
						</div>
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="EXPLAINED"
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
						head="TRY"
						icon="i-mdi:gesture-tap"
					>
						Type in the fields. <em>email</em> validates as you type;
						<em>role</em> renders as a select because of the enum;
						<em>newsletter</em> renders as a toggle because of the boolean type.
					</ChatMessage>
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'toasts'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="MOUNTED"
						who="Rokkit"
						ago="just now"
						icon="i-mdi:bell-outline"
					>
						<code>&lt;AlertList/&gt;</code> + the <code>alerts</code> store from
						<code>@rokkit/states</code>. Push from anywhere — alerts stack at the
						configured position, dismiss on click or timeout.
						<div class="mounted-callout">
							<span class="callout-label">Canvas →</span>
							<span>Four buttons · one per tone</span>
						</div>
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="EXPLAINED"
						icon="i-mdi:book-open-variant"
					>
						<strong>Imperative, not declarative.</strong> Most components are
						data-bound — Toasts aren't. You push an alert with
						<code>alerts.push(&#123; type, text &#125;)</code> and the AlertList
						mounted anywhere in the tree renders it. One store, many call sites.
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="TRY"
						icon="i-mdi:gesture-tap"
					>
						Click a button on the canvas. Each tone gets a different border + icon.
						Toasts auto-dismiss after a few seconds, or click them to dismiss early.
					</ChatMessage>
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'list'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="MOUNTED"
						who="Rokkit"
						ago="just now"
						icon="i-mdi:format-list-bulleted"
					>
						<code>&lt;List/&gt;</code> from <code>@rokkit/ui</code> on the canvas
						with <code>collapsible</code> turned on. Three group headers — General,
						Appearance, Advanced — each owns its items via <code>children</code>.
						<div class="mounted-callout">
							<span class="callout-label">Canvas →</span>
							<span>Settings menu · collapsible groups</span>
						</div>
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="WHEN TO USE"
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
						head="TRY"
						icon="i-mdi:gesture-tap"
					>
						Click a group header to collapse it. Click an item to select.
						Same API works flat — drop the <code>children</code> for a flat list.
					</ChatMessage>
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'multi-select'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="MOUNTED"
						who="Rokkit"
						ago="just now"
						icon="i-mdi:select-multiple"
					>
						<code>&lt;MultiSelect/&gt;</code> from <code>@rokkit/ui</code> on the
						canvas. Items mapped via <code>{'{ label, value }'}</code>; selected
						values render as chips inside the trigger. <code>bind:value</code>
						gives you an array of the picked values.
						<div class="mounted-callout">
							<span class="callout-label">Canvas →</span>
							<span>Eight colors · two pre-selected</span>
						</div>
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="EXPLAINED"
						icon="i-mdi:book-open-variant"
					>
						<strong>One component, many choices.</strong> Click the trigger to
						open the dropdown, click an option to toggle it. Click a chip in
						the trigger to remove just that one. Keyboard nav works throughout.
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="TRY"
						icon="i-mdi:gesture-tap"
					>
						Add a few more colors, then click a chip to remove it. The
						<code>value</code> array updates live — useful for forms or filters.
					</ChatMessage>
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'tree'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="MOUNTED"
						who="Rokkit"
						ago="just now"
						icon="i-mdi:file-tree"
					>
						<code>&lt;Tree/&gt;</code> from <code>@rokkit/ui</code> on the canvas.
						Nested items via <code>children</code>; label / value mapped from
						the row shape via <code>fields</code>. Arrow keys + Enter navigate.
						<div class="mounted-callout">
							<span class="callout-label">Canvas →</span>
							<span>File tree · expand / collapse</span>
						</div>
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="WHEN TO USE"
						icon="i-mdi:compare-horizontal"
					>
						<strong>Tree</strong> when the hierarchy is the point — multi-level
						nesting, file systems, org charts. <strong>List with collapsible
						groups</strong> for shallow 1–2 level grouping where the items are
						the focus and the groups are just headings.
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="TRY"
						icon="i-mdi:gesture-tap"
					>
						Click a folder to expand. Arrow keys walk the tree; Enter selects.
						Selection is bound — <em>value</em> updates as you navigate.
					</ChatMessage>
				</ChatStream>
			{/if}

			<ChatComposer
				bind:value={shell.composerValue}
				placeholder={shell.phase === 'welcome'
					? 'Ask anything · type / for commands'
					: 'Refine · ask follow-ups · request another component'}
				running={shell.phase === 'thinking'}
				onsubmit={submitQuery}
			/>
		</aside>

		<main class="canvas">
			{#if shell.phase === 'welcome'}
				<div class="welcome-hero">
					<div class="mark"><RokkitWordmark height={64} /></div>
					<div class="lede">Pass the data. The component does the rest.</div>
					<div class="sub">
						Type a question on the left. The answer mounts here — themed,
						density-tuned, copyable, and identical to what you'd ship.
					</div>
					<div class="meta">
						<span>style</span>
						<span class="meta-value">{style}</span>
						<span class="meta-sep">·</span>
						<span>47 components</span>
						<span class="meta-sep">·</span>
						<span>Svelte 5 runes</span>
					</div>
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
					<div class="canvas-eyebrow">Mounted demo · live</div>
					<div class="canvas-title">Tabs · how the data-driven API works</div>
					<div class="canvas-sub">
						Five panes from one <code>items</code> array. Selection is bound.
						Style comes from <code>data-style</code> on the parent. Flip the
						chrome toggle to see it re-render.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;Tabs/&gt;"
						meta="· @rokkit/ui · style={style}"
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:layers-outline" aria-hidden="true"></span>
						{/snippet}
						<div class="tabs-mount">
							<Tabs options={tabsItems} bind:value={activeTab} />
						</div>
						{#snippet props()}
							<span>items</span><span data-value>[5]</span>
							<span data-sep>·</span>
							<span>style</span><span data-value>{style}</span>
							<span data-sep>·</span>
							<span>bytes</span><span data-value>2.1kb</span>
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

					<CodeBlock filename="Tabs.demo.svelte" language="svelte" code={tabsCode} />
				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'theme-wizard'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Theme wizard · live preview</div>
					<div class="canvas-title">Build a theme · step 02 of 04</div>
					<div class="canvas-sub">
						Style chosen; now map roles to palette steps. The right side previews
						each role on the running app.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;ThemeWizard/&gt;"
						meta="· step 02 · skin"
						kicker="WIZARD"
					>
						{#snippet icon()}
							<span class="i-mdi:palette" aria-hidden="true"></span>
						{/snippet}
						<ThemeWizardCard {mode} />
						{#snippet props()}
							<span>style</span><span data-value>{style}</span>
							<span data-sep>·</span>
							<span>palette</span><span data-value>warm-gray + shu</span>
							<span data-sep>·</span>
							<span>dual-mode</span><span data-value>yes</span>
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-save-outline" aria-hidden="true"></span>
								Save preset
							</button>
							<button type="button">
								<span class="i-mdi:download" aria-hidden="true"></span>
								Export tokens.css
							</button>
							<button type="button">
								<span class="i-mdi:refresh" aria-hidden="true"></span>
								Preview live
							</button>
						{/snippet}
					</ChatResponse>
				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'table'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live</div>
					<div class="canvas-title">Table · sortable, data-driven</div>
					<div class="canvas-sub">
						Six rows of products. Columns inferred from the row shape — no schema
						required. Click a header to sort; shift-click to add secondary sorts.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;Table/&gt;"
						meta="· @rokkit/ui · style={style}"
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:table" aria-hidden="true"></span>
						{/snippet}
						<div class="table-mount">
							<Table data={tableData} caption="Products" />
						</div>
						{#snippet props()}
							<span>rows</span><span data-value>[6]</span>
							<span data-sep>·</span>
							<span>columns</span><span data-value>inferred</span>
							<span data-sep>·</span>
							<span>sortable</span><span data-value>yes</span>
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

					<CodeBlock filename="Table.demo.svelte" language="svelte" code={tableCode} />
				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'date-picker'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live</div>
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
						meta="· @rokkit/forms · style={style}"
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
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
						{/snippet}
					</ChatResponse>

					<CodeBlock filename="DatePicker.demo.svelte" language="svelte" code={dateCode} />
				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'combo'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live</div>
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
						meta="· @rokkit/ui · style={style}"
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:magnify" aria-hidden="true"></span>
						{/snippet}
						<div class="combo-mount">
							<Select items={countryItems} bind:value={comboValue} filterable placeholder="Type to search countries" />
						</div>
						{#snippet props()}
							<span>options</span><span data-value>[42]</span>
							<span data-sep>·</span>
							<span>filterable</span><span data-value>yes</span>
							<span data-sep>·</span>
							<span>selected</span><span data-value>{String(comboValue ?? '—')}</span>
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
						{/snippet}
					</ChatResponse>

					<CodeBlock filename="Combo.demo.svelte" language="svelte" code={comboCode} />
				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'chart'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live</div>
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
						meta="· @rokkit/chart · style={style}"
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:chart-bar" aria-hidden="true"></span>
						{/snippet}
						<div class="chart-mount">
							<BarChart data={chartData} x="quarter" y="revenue" />
						</div>
						{#snippet props()}
							<span>rows</span><span data-value>[4]</span>
							<span data-sep>·</span>
							<span>x</span><span data-value>quarter</span>
							<span data-sep>·</span>
							<span>y</span><span data-value>revenue</span>
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

					<CodeBlock filename="Chart.demo.svelte" language="svelte" code={chartCode} />
				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'select'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live</div>
					<div class="canvas-title">Select · single-pick dropdown</div>
					<div class="canvas-sub">
						Twenty options to exercise scroll + keyboard navigation. Click the
						trigger to open; arrow keys walk; Enter selects; Home/End jump.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;Select/&gt;"
						meta="· @rokkit/ui · style={style}"
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:menu-down" aria-hidden="true"></span>
						{/snippet}
						<div class="select-mount">
							<Select items={selectItems} bind:value={selectValue} placeholder="Pick an option" />
						</div>
						{#snippet props()}
							<span>options</span><span data-value>[20]</span>
							<span data-sep>·</span>
							<span>selected</span><span data-value>{String(selectValue ?? '—')}</span>
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
						{/snippet}
					</ChatResponse>

					<CodeBlock filename="Select.demo.svelte" language="svelte" code={selectCode} />
				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'form'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live</div>
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
						meta="· @rokkit/forms · style={style}"
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

					<CodeBlock filename="Form.demo.svelte" language="svelte" code={formCode} />
				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'toasts'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live</div>
					<div class="canvas-title">Toasts · imperative notifications</div>
					<div class="canvas-sub">
						AlertList renders any pushed alert at the configured position. Four
						tones — success, warning, error, info. Click a button to fire one.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;AlertList/&gt;"
						meta="· @rokkit/ui · style={style}"
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:bell-outline" aria-hidden="true"></span>
						{/snippet}
						<div class="toasts-mount">
							<AlertList position="top-right" />
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
							<span>position</span><span data-value>top-right</span>
							<span data-sep>·</span>
							<span>tones</span><span data-value>[4]</span>
							<span data-sep>·</span>
							<span>store</span><span data-value>alerts</span>
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

					<CodeBlock filename="Toasts.demo.svelte" language="svelte" code={toastsCode} />
				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'list'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live</div>
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
						meta="· @rokkit/ui · style={style}"
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:format-list-bulleted" aria-hidden="true"></span>
						{/snippet}
						<div class="list-mount">
							<List items={listItems} collapsible bind:value={listValue} />
						</div>
						{#snippet props()}
							<span>groups</span><span data-value>[3]</span>
							<span data-sep>·</span>
							<span>collapsible</span><span data-value>yes</span>
							<span data-sep>·</span>
							<span>selected</span><span data-value>{String((listValue as { label?: string } | null)?.label ?? '—')}</span>
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

					<CodeBlock filename="List.demo.svelte" language="svelte" code={listCode} />
				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'multi-select'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live</div>
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
						meta="· @rokkit/ui · style={style}"
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:select-multiple" aria-hidden="true"></span>
						{/snippet}
						<div class="multiselect-mount">
							<MultiSelect items={colorItems} bind:value={selectedColors} placeholder="Select colors" />
						</div>
						{#snippet props()}
							<span>options</span><span data-value>[8]</span>
							<span data-sep>·</span>
							<span>selected</span><span data-value>[{selectedColors.length}]</span>
							<span data-sep>·</span>
							<span>value</span><span data-value>{selectedColors.join(', ') || '—'}</span>
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

					<CodeBlock filename="MultiSelect.demo.svelte" language="svelte" code={multiSelectCode} />
				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'tree'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live</div>
					<div class="canvas-title">Tree · hierarchical, navigable</div>
					<div class="canvas-sub">
						Nested folders + files. Click to expand; arrow keys walk the tree;
						Enter selects. Field-mapped via <code>fields={'{'} label, value }</code>.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;Tree/&gt;"
						meta="· @rokkit/ui · style={style}"
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:file-tree" aria-hidden="true"></span>
						{/snippet}
						<div class="tree-mount">
							<Tree items={treeItems} fields={treeFields} bind:value={treeValue} />
						</div>
						{#snippet props()}
							<span>nodes</span><span data-value>nested</span>
							<span data-sep>·</span>
							<span>fields</span><span data-value>{'{ label, value }'}</span>
							<span data-sep>·</span>
							<span>selected</span><span data-value>{String(treeValue ?? '—')}</span>
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

					<CodeBlock filename="Tree.demo.svelte" language="svelte" code={treeCode} />
				</div>
			{/if}
		</main>
	</div>

	{#if children}{@render children()}{/if}
</div>

<style>
	.koan-shell {
		position: fixed;
		inset: 0;
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
		border-radius: 6px;
		color: var(--ink-soft);
		cursor: pointer;
	}

	.conv-mini:hover {
		background: var(--paper-soft);
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
	}

	.chat-header {
		padding: 12px 16px;
		border-bottom: 1px solid var(--paper-edge);
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

	.welcome-eyebrow {
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		margin-bottom: 6px;
	}

	.canvas {
		flex: 1;
		min-width: 0;
		background: var(--paper);
		display: flex;
		flex-direction: column;
		overflow: auto;
	}

	.canvas-head {
		padding: 24px 28px 18px;
		border-bottom: 1px solid var(--paper-edge);
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

	:global(.canvas-body.response > *) {
		flex-shrink: 0;
	}

	.tabs-mount {
		min-height: 120px;
	}

	.table-mount {
		min-height: 120px;
	}

	.tree-mount {
		min-height: 120px;
	}

	.multiselect-mount {
		min-height: 80px;
		max-width: 340px;
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

	.date-mount {
		min-height: 120px;
		max-width: 440px;
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
		font-size: 12.5px;
		display: flex;
		align-items: center;
		gap: 8px;
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
