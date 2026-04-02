<script>
	// @ts-nocheck
	import {
		Button, ButtonGroup, Badge, Card, Menu, Select, MultiSelect,
		List, Tabs, Toggle, Switch, Range, Divider, Pill, Rating,
		SearchFilter, Dropdown
	} from '@rokkit/ui'
	import { Sparkline, PlotChart, Plot } from '@rokkit/chart'
	import { sales, salesByMonth, salesByRegion, salesByCategory } from '$lib/data/sales.js'

	// ─── Section state ────────────────────────────────────────────────────────────
	let activeSection = $state('buttons')
	const sections = [
		{ id: 'buttons', label: 'Buttons & Badges' },
		{ id: 'selects', label: 'Select & Lists' },
		{ id: 'menus', label: 'Menus' },
		{ id: 'charts', label: 'Charts' },
		{ id: 'forms', label: 'Forms' },
		{ id: 'display', label: 'Display' }
	]

	// ─── Buttons ──────────────────────────────────────────────────────────────────
	const buttonVariants = ['primary', 'secondary', 'ghost', 'danger']
	const buttonSizes = ['sm', 'md', 'lg']

	// ─── Lists / Select ───────────────────────────────────────────────────────────
	const fruits = [
		{ label: 'Apple', value: 'apple', emoji: '🍎' },
		{ label: 'Banana', value: 'banana', emoji: '🍌' },
		{ label: 'Cherry', value: 'cherry', emoji: '🍒' },
		{ label: 'Durian', value: 'durian', emoji: '🫙' },
		{ label: 'Elderberry', value: 'elderberry', emoji: '🫐' }
	]
	let selectedFruit = $state(null)
	let selectedFruits = $state([])
	let listValue = $state(null)
	let searchQuery = $state('')

	// ─── Tabs ─────────────────────────────────────────────────────────────────────
	const tabItems = [
		{ label: 'Overview', value: 'overview' },
		{ label: 'Analytics', value: 'analytics' },
		{ label: 'Reports', value: 'reports' },
		{ label: 'Settings', value: 'settings' }
	]
	let activeTab = $state('overview')

	// ─── Menu ─────────────────────────────────────────────────────────────────────
	const menuItems = [
		{ label: 'Edit', value: 'edit', icon: 'i-lucide:pencil' },
		{ label: 'Duplicate', value: 'duplicate', icon: 'i-lucide:copy' },
		{ label: 'Archive', value: 'archive', icon: 'i-lucide:archive' },
		null, // separator
		{ label: 'Delete', value: 'delete', icon: 'i-lucide:trash-2' }
	]

	const groupedMenuItems = [
		{ group: 'View', label: 'Zoom In', value: 'zoom-in', icon: 'i-lucide:zoom-in' },
		{ group: 'View', label: 'Zoom Out', value: 'zoom-out', icon: 'i-lucide:zoom-out' },
		{ group: 'View', label: 'Fit to Screen', value: 'fit', icon: 'i-lucide:maximize' },
		{ group: 'Export', label: 'Export PNG', value: 'png', icon: 'i-lucide:image' },
		{ group: 'Export', label: 'Export SVG', value: 'svg', icon: 'i-lucide:file-code' },
		{ group: 'Export', label: 'Export CSV', value: 'csv', icon: 'i-lucide:file-spreadsheet' }
	]

	let menuActionLog = $state([])

	function logAction(v) {
		menuActionLog = [`Selected: ${v}`, ...menuActionLog].slice(0, 5)
	}

	// ─── Forms ────────────────────────────────────────────────────────────────────
	let toggleOn = $state(false)
	let switchOn = $state(false)
	let rangeVal = $state(60)
	let ratingVal = $state(3)

	// ─── Charts ───────────────────────────────────────────────────────────────────
	const chartTypes = ['Bar', 'Line', 'Area', 'Scatter', 'Pie']
	let selectedChart = $state('Bar')

	const monthlyData = salesByMonth()
	const regionData = salesByRegion()
	const categoryData = salesByCategory()

	const scatterData = sales.slice(0, 50).map((d) => ({ x: d.quantity, y: d.amount, cat: d.category }))

	// ─── Sparklines ───────────────────────────────────────────────────────────────
	const sparkData = monthlyData.slice(-12)
</script>

<div class="min-h-full px-6 py-8 lg:px-10" data-showcase>
	<!-- ── Page header ──────────────────────────────────────────────────────────── -->
	<div class="mb-6">
		<h1 class="text-surface-z8 text-2xl font-bold tracking-tight">Component Showcase</h1>
		<p class="text-surface-z5 mt-1 text-sm">Interactive gallery of all Rokkit components</p>
	</div>

	<!-- ── Section tabs ──────────────────────────────────────────────────────────── -->
	<div class="mb-8 flex flex-wrap gap-2 border-b border-surface-z2 pb-4">
		{#each sections as s}
			<button
				class="rounded-lg px-3 py-1.5 text-sm transition-colors"
				class:bg-surface-z3={activeSection === s.id}
				class:text-surface-z8={activeSection === s.id}
				class:font-medium={activeSection === s.id}
				class:text-surface-z5={activeSection !== s.id}
				class:hover:text-surface-z7={activeSection !== s.id}
				onclick={() => (activeSection = s.id)}
			>
				{s.label}
			</button>
		{/each}
	</div>

	<!-- ── Buttons & Badges ──────────────────────────────────────────────────────── -->
	{#if activeSection === 'buttons'}
		<div class="space-y-8" data-section="buttons">
			<div>
				<h2 class="text-surface-z7 mb-4 text-base font-semibold">Button Variants</h2>
				<div class="flex flex-wrap gap-3">
					{#each buttonVariants as variant}
						<Button {variant}>{variant}</Button>
					{/each}
				</div>
			</div>

			<div>
				<h2 class="text-surface-z7 mb-4 text-base font-semibold">Button Sizes</h2>
				<div class="flex flex-wrap items-center gap-3">
					{#each buttonSizes as size}
						<Button variant="primary" {size}>{size}</Button>
					{/each}
				</div>
			</div>

			<div>
				<h2 class="text-surface-z7 mb-4 text-base font-semibold">Button Group</h2>
				<ButtonGroup>
					<Button variant="ghost" size="sm">Left</Button>
					<Button variant="ghost" size="sm">Center</Button>
					<Button variant="ghost" size="sm">Right</Button>
				</ButtonGroup>
			</div>

			<Divider />

			<div>
				<h2 class="text-surface-z7 mb-4 text-base font-semibold">Badges</h2>
				<div class="flex flex-wrap gap-2">
					{#each ['default', 'primary', 'secondary', 'success', 'warning', 'danger'] as variant}
						<Badge {variant}>{variant}</Badge>
					{/each}
				</div>
			</div>

			<div>
				<h2 class="text-surface-z7 mb-4 text-base font-semibold">Pills</h2>
				<div class="flex flex-wrap gap-2">
					{#each ['Analytics', 'Infrastructure', 'Security', 'Collaboration', 'AI/ML'] as label}
						<Pill>{label}</Pill>
					{/each}
				</div>
			</div>

			<div>
				<h2 class="text-surface-z7 mb-4 text-base font-semibold">Sparklines</h2>
				<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-5">
					<div class="grid grid-cols-3 gap-6">
						{#each [{ label: 'Revenue', type: 'area', color: 'primary', field: 'amount' }, { label: 'Orders', type: 'bar', color: 'secondary', field: 'orders' }, { label: 'Profit', type: 'line', color: 'primary', field: 'orders' }] as s}
							<div class="flex flex-col gap-1">
								<span class="text-surface-z5 text-xs">{s.label}</span>
								<Sparkline data={sparkData} field={s.field} type={s.type} color={s.color} width={120} height={36} />
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- ── Select & Lists ────────────────────────────────────────────────────────── -->
	{#if activeSection === 'selects'}
		<div class="space-y-8" data-section="selects">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				<div>
					<h2 class="text-surface-z7 mb-4 text-base font-semibold">Select (Dropdown)</h2>
					<Select
						items={fruits}
						fields={{ text: 'label', value: 'value' }}
						bind:value={selectedFruit}
						placeholder="Choose a fruit..."
					/>
					{#if selectedFruit}
						<p class="text-surface-z5 mt-2 text-sm">Selected: <strong>{selectedFruit}</strong></p>
					{/if}
				</div>

				<div>
					<h2 class="text-surface-z7 mb-4 text-base font-semibold">MultiSelect</h2>
					<MultiSelect
						items={fruits}
						fields={{ text: 'label', value: 'value' }}
						bind:value={selectedFruits}
						placeholder="Choose fruits..."
					/>
					{#if selectedFruits.length > 0}
						<p class="text-surface-z5 mt-2 text-sm">
							Selected: <strong>{selectedFruits.join(', ')}</strong>
						</p>
					{/if}
				</div>
			</div>

			<Divider />

			<div>
				<h2 class="text-surface-z7 mb-4 text-base font-semibold">List</h2>
				<div class="border-surface-z2 w-56 overflow-hidden rounded-xl border">
					<List
						items={fruits}
						fields={{ text: 'label', value: 'value' }}
						bind:value={listValue}
					/>
				</div>
				{#if listValue}
					<p class="text-surface-z5 mt-2 text-sm">Selected: <strong>{listValue}</strong></p>
				{/if}
			</div>

			<div>
				<h2 class="text-surface-z7 mb-4 text-base font-semibold">Search Filter</h2>
				<SearchFilter bind:value={searchQuery} placeholder="Search products..." />
				{#if searchQuery}
					<div class="mt-3 space-y-1">
						{#each sales.filter(r => r.product.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5) as row}
							<div class="text-surface-z6 text-sm">{row.product} — {row.category}</div>
						{/each}
					</div>
				{/if}
			</div>

			<Divider />

			<div>
				<h2 class="text-surface-z7 mb-4 text-base font-semibold">Tabs</h2>
				<Tabs items={tabItems} fields={{ text: 'label', value: 'value' }} bind:value={activeTab} />
				<div class="border-surface-z2 bg-surface-z2 mt-3 rounded-lg border p-4">
					<p class="text-surface-z6 text-sm">Content for: <strong>{activeTab}</strong></p>
				</div>
			</div>
		</div>
	{/if}

	<!-- ── Menus ─────────────────────────────────────────────────────────────────── -->
	{#if activeSection === 'menus'}
		<div class="space-y-8" data-section="menus">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
				<!-- Default menu -->
				<div>
					<h2 class="text-surface-z7 mb-4 text-base font-semibold">Default Menu</h2>
					<Menu
						items={menuItems}
						fields={{ text: 'label', value: 'value', icon: 'icon' }}
						onselect={(v) => logAction(v)}
					/>
				</div>

				<!-- Grouped menu -->
				<div>
					<h2 class="text-surface-z7 mb-4 text-base font-semibold">Grouped Menu</h2>
					<Menu
						items={groupedMenuItems}
						fields={{ text: 'label', value: 'value', icon: 'icon', group: 'group' }}
						onselect={(v) => logAction(v)}
					/>
				</div>

				<!-- Custom menu via snippet -->
				<div>
					<h2 class="text-surface-z7 mb-4 text-base font-semibold">Custom Item Renderer</h2>
					<Menu
						items={fruits}
						fields={{ text: 'label', value: 'value' }}
						onselect={(v) => logAction(v)}
					>
						{#snippet item(proxy)}
							<span style="display:flex;align-items:center;gap:8px">
								<span>{proxy.original?.emoji ?? ''}</span>
								<span>{proxy.label}</span>
							</span>
						{/snippet}
					</Menu>
				</div>
			</div>

			{#if menuActionLog.length > 0}
				<div class="border-surface-z2 bg-surface-z2 rounded-lg border p-4">
					<p class="text-surface-z5 mb-2 text-xs font-semibold uppercase">Action Log</p>
					{#each menuActionLog as entry}
						<p class="text-surface-z6 text-sm">{entry}</p>
					{/each}
				</div>
			{/if}

			<Divider />

			<div>
				<h2 class="text-surface-z7 mb-4 text-base font-semibold">Dropdown (trigger + panel)</h2>
				<div class="flex gap-4">
					<Dropdown>
						{#snippet trigger()}
							<Button variant="ghost" size="sm">
								Actions <span class="i-lucide:chevron-down ml-1 text-xs"></span>
							</Button>
						{/snippet}
						{#snippet content()}
							<div class="border-surface-z2 bg-surface-z1 rounded-lg border p-2 shadow-lg">
								{#each menuItems.filter(Boolean) as item}
									<button
										class="text-surface-z7 hover:bg-surface-z2 flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm"
										onclick={() => logAction(item.value)}
									>
										{#if item.icon}
											<span class="{item.icon} inline-block text-base" aria-hidden="true"></span>
										{/if}
										{item.label}
									</button>
								{/each}
							</div>
						{/snippet}
					</Dropdown>
				</div>
			</div>
		</div>
	{/if}

	<!-- ── Charts ────────────────────────────────────────────────────────────────── -->
	{#if activeSection === 'charts'}
		<div class="space-y-8" data-section="charts">
			<div class="flex flex-wrap gap-2">
				{#each chartTypes as ct}
					<button
						class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
						class:border-surface-z4={selectedChart === ct}
						class:bg-surface-z2={selectedChart === ct}
						class:text-surface-z8={selectedChart === ct}
						class:font-medium={selectedChart === ct}
						class:border-surface-z2={selectedChart !== ct}
						class:text-surface-z5={selectedChart !== ct}
						onclick={() => (selectedChart = ct)}
					>
						{ct}
					</button>
				{/each}
			</div>

			<div class="border-surface-z2 bg-surface-z1 rounded-xl border p-6">
				{#if selectedChart === 'Bar'}
					<h3 class="text-surface-z7 mb-4 text-sm font-semibold">Bar Chart — Revenue by Region</h3>
					<PlotChart
						data={regionData}
						spec={{ x: 'region', y: 'amount', geoms: [{ type: 'bar' }] }}
						axes grid
						width={560} height={280}
					/>
				{:else if selectedChart === 'Line'}
					<h3 class="text-surface-z7 mb-4 text-sm font-semibold">Line Chart — Monthly Revenue Trend</h3>
					<Plot.Root data={monthlyData} x="month" y="amount" width={560} height={280}>
						<Plot.Grid />
						<Plot.Axis type="x" tickCount={8} />
						<Plot.Axis type="y" />
						<Plot.Line data={monthlyData} x="month" y="amount" stroke="var(--color-primary)" strokeWidth={2.5} />
						<Plot.Point data={monthlyData} x="month" y="amount" fill="var(--color-primary)" r={4} />
					</Plot.Root>
				{:else if selectedChart === 'Area'}
					<h3 class="text-surface-z7 mb-4 text-sm font-semibold">Area Chart — Monthly Revenue</h3>
					<Plot.Root data={monthlyData} x="month" y="amount" width={560} height={280}>
						<Plot.Grid />
						<Plot.Axis type="x" tickCount={8} />
						<Plot.Axis type="y" />
						<Plot.Area data={monthlyData} x="month" y="amount" fill="var(--color-primary)" opacity={0.2} />
						<Plot.Line data={monthlyData} x="month" y="amount" stroke="var(--color-primary)" strokeWidth={2} />
					</Plot.Root>
				{:else if selectedChart === 'Scatter'}
					<h3 class="text-surface-z7 mb-4 text-sm font-semibold">Scatter Plot — Quantity vs Amount</h3>
					<Plot.Root data={scatterData} x="x" y="y" width={560} height={280}>
						<Plot.Grid />
						<Plot.Axis type="x" />
						<Plot.Axis type="y" />
						<Plot.Point data={scatterData} x="x" y="y" fill="var(--color-secondary)" r={5} opacity={0.7} />
					</Plot.Root>
				{:else if selectedChart === 'Pie'}
					<h3 class="text-surface-z7 mb-4 text-sm font-semibold">Pie Chart — Revenue by Category</h3>
					<PlotChart
						data={categoryData}
						spec={{ label: 'category', value: 'amount', geoms: [{ type: 'arc' }] }}
						width={420} height={280}
					/>
				{/if}
			</div>
		</div>
	{/if}

	<!-- ── Forms ─────────────────────────────────────────────────────────────────── -->
	{#if activeSection === 'forms'}
		<div class="space-y-8" data-section="forms">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				<div class="space-y-6">
					<div>
						<h2 class="text-surface-z7 mb-3 text-base font-semibold">Toggle</h2>
						<div class="flex items-center gap-3">
							<Toggle bind:value={toggleOn} />
							<span class="text-surface-z6 text-sm">{toggleOn ? 'On' : 'Off'}</span>
						</div>
					</div>

					<div>
						<h2 class="text-surface-z7 mb-3 text-base font-semibold">Switch</h2>
						<div class="flex items-center gap-3">
							<Switch bind:value={switchOn} />
							<span class="text-surface-z6 text-sm">{switchOn ? 'Enabled' : 'Disabled'}</span>
						</div>
					</div>

					<div>
						<h2 class="text-surface-z7 mb-3 text-base font-semibold">Rating</h2>
						<Rating bind:value={ratingVal} max={5} />
						<p class="text-surface-z5 mt-2 text-sm">{ratingVal} / 5 stars</p>
					</div>
				</div>

				<div class="space-y-6">
					<div>
						<h2 class="text-surface-z7 mb-3 text-base font-semibold">Range Slider</h2>
						<Range bind:value={rangeVal} min={0} max={100} />
						<p class="text-surface-z5 mt-2 text-sm">Value: {rangeVal}</p>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- ── Display ───────────────────────────────────────────────────────────────── -->
	{#if activeSection === 'display'}
		<div class="space-y-8" data-section="display">
			<div>
				<h2 class="text-surface-z7 mb-4 text-base font-semibold">Card</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
					<Card>
						{#snippet header()}
							<span class="text-surface-z8 font-semibold">Analytics</span>
						{/snippet}
						{#snippet body()}
							<p class="text-surface-z6 text-sm">Revenue insights and performance metrics for your business.</p>
						{/snippet}
						{#snippet footer()}
							<Button variant="ghost" size="sm">View Details</Button>
						{/snippet}
					</Card>
					<Card>
						{#snippet header()}
							<span class="text-surface-z8 font-semibold">Security</span>
						{/snippet}
						{#snippet body()}
							<p class="text-surface-z6 text-sm">Threat monitoring and identity management dashboard.</p>
						{/snippet}
						{#snippet footer()}
							<Button variant="ghost" size="sm">Configure</Button>
						{/snippet}
					</Card>
					<Card>
						{#snippet header()}
							<span class="text-surface-z8 font-semibold">Infrastructure</span>
						{/snippet}
						{#snippet body()}
							<p class="text-surface-z6 text-sm">Cloud resources, CDN performance, and storage usage.</p>
						{/snippet}
						{#snippet footer()}
							<Button variant="ghost" size="sm">Manage</Button>
						{/snippet}
					</Card>
				</div>
			</div>

			<Divider />

			<div>
				<h2 class="text-surface-z7 mb-4 text-base font-semibold">Progress Bars</h2>
				<div class="space-y-3 max-w-md">
					{#each [{ label: 'North America', value: 72 }, { label: 'Europe', value: 58 }, { label: 'Asia Pacific', value: 41 }, { label: 'Latin America', value: 18 }] as item}
						<div class="flex items-center gap-3">
							<span class="text-surface-z6 w-32 text-sm">{item.label}</span>
							<div class="bg-surface-z3 h-2 flex-1 overflow-hidden rounded-full">
								<div class="bg-primary-z6 h-full rounded-full" style="width:{item.value}%"></div>
							</div>
							<span class="text-surface-z5 w-8 text-right text-xs">{item.value}%</span>
						</div>
					{/each}
				</div>
			</div>

			<Divider />

			<div>
				<h2 class="text-surface-z7 mb-4 text-base font-semibold">Dividers &amp; Spacing</h2>
				<div class="space-y-4">
					<p class="text-surface-z6 text-sm">Content above</p>
					<Divider />
					<p class="text-surface-z6 text-sm">Content below</p>
					<Divider label="Or continue with" />
					<p class="text-surface-z6 text-sm">Content after labeled divider</p>
				</div>
			</div>
		</div>
	{/if}
</div>
