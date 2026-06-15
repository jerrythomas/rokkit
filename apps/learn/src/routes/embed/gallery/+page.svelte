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
	import { page } from '$app/state'
	import {
		Button, Badge, Pill, Card, List, Tree, Table, Tabs, Select, MultiSelect,
		Menu, Dropdown, Toggle, Switch, ProgressBar, Range, Rating, Timeline,
		Stepper, BreadCrumbs, Toolbar, StatusList, Message, Tooltip, Avatar,
		Divider, Swatch, Code
	} from '@rokkit/ui'

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

	// representative data + bindable state
	const listItems = [
		{ label: 'General', children: [{ label: 'Profile' }, { label: 'Account' }] },
		{ label: 'Appearance', children: [{ label: 'Theme' }] }
	]
	let listValue = $state(null)
	const treeItems = [{ name: 'src', id: 'src', children: [{ name: 'Button.svelte', id: 'btn' }] }]
	let treeValue = $state(null)
	const tableData = [
		{ name: 'Laptop', price: 1299, stock: 45 },
		{ name: 'Phone', price: 899, stock: 120 }
	]
	const tabItems = [
		{ label: 'Overview', value: 'overview', content: 'Your starting point.' },
		{ label: 'Settings', value: 'settings', content: 'Tune preferences.' }
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
		{ label: 'List', value: 'list' },
		{ label: 'Grid', value: 'grid' }
	]
	let switchValue = $state(true)
	let rangeValue = $state(35)
	let ratingValue = $state(3)
	const timelineItems = [
		{ label: 'Requirements', completed: true },
		{ label: 'Design', completed: true },
		{ label: 'Development', active: true }
	]
	const stepperSteps = [{ label: 'Account', completed: true }, { label: 'Profile' }]
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
	<div data-gallery-comp="pill" class="cell"><Pill value="svelte" /><Pill value="typescript" /></div>
	<div data-gallery-comp="card" class="cell">
		<Card><h3>Card title</h3><p>A basic card with text content.</p></Card>
	</div>
	<div data-gallery-comp="list" class="cell"><List items={listItems} collapsible bind:value={listValue} /></div>
	<div data-gallery-comp="tree" class="cell">
		<Tree items={treeItems} fields={{ label: 'name', value: 'id' }} bind:value={treeValue} />
	</div>
	<div data-gallery-comp="table" class="cell"><Table data={tableData} caption="Products" /></div>
	<div data-gallery-comp="tabs" class="cell"><Tabs options={tabItems} bind:value={tabValue} /></div>
	<div data-gallery-comp="select" class="cell"><Select items={selectItems} bind:value={selectValue} /></div>
	<div data-gallery-comp="multiselect" class="cell"><MultiSelect items={colorItems} bind:value={multiValue} /></div>
	<div data-gallery-comp="menu" class="cell"><Menu items={menuItems} label="Actions" /></div>
	<div data-gallery-comp="dropdown" class="cell"><Dropdown items={fontItems} bind:value={dropdownValue} /></div>
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
	<div data-gallery-comp="message" class="cell"><Message type="info" text="A regular informational nudge." /></div>
	<div data-gallery-comp="tooltip" class="cell"><Tooltip content="Saves your changes" position="top"><Button>Hover me</Button></Tooltip></div>
	<div data-gallery-comp="avatar" class="cell"><Avatar name="Ada Lovelace" size="md" /></div>
	<div data-gallery-comp="divider" class="cell"><Divider label="or" /></div>
	<div data-gallery-comp="swatch" class="cell"><Swatch options={swatchColors} bind:value={swatchValue} /></div>
	<div data-gallery-comp="code" class="cell"><Code code={codeSample} language="javascript" /></div>
</div>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
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
</style>
